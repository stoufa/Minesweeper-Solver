#!/usr/bin/env python3
"""
generate_configurations.py

Improved Minesweeper outline configuration generator.

Usage:
    python generate_configurations.py board_YYYYMMDD_HHMMSS.txt

What changed (major improvements):
- Splits the outline (unknown cells adjacent to numbers) into independent clusters
  of variables. Each cluster touches a disjoint set of numbered constraints, so
  they can be solved separately and combined (drastically reduces search space).
- Uses a backtracking search with **strong pruning**:
  - For any numbered cell we check partial assignments: if assigned mines exceed
    the expected count, or even when assigning all remaining neighbors cannot
    reach the expected count, we prune immediately.
- Writes configurations progressively to avoid holding everything in memory.
- Safety check to refuse explosion when final number of configurations is
  astronomically large (configurable threshold).

Output:
- If input is `board_YYYYMMDD_HHMMSS.txt`, output will be
  `configurations_YYYYMMDD_HHMMSS.txt`.

Schema:
- Input symbols: digits '0'-'6', '!' flagged mine, '.' unknown/unvisited, '?'
  treated like '.' (unknown). Any other characters are passed through.
- Output replaces outline '.' with 'o' (safe) or 'x' (mine). Other '.' far from
  numbers are left untouched.

"""

from collections import defaultdict, deque
from datetime import datetime
from pathlib import Path
import itertools
import sys

MAX_COMBINATIONS_WARN = 10_000_000  # warn / abort beyond this many total combinations


'''
def read_board(path: Path):
    with path.open("r", encoding="utf-8") as f:
        rows = [list(line.rstrip('\n')) for line in f]
    # normalize rows to same length
    maxc = max(len(r) for r in rows) if rows else 0
    for r in rows:
        if len(r) < maxc:
            r.extend(["."] * (maxc - len(r)))
    return rows
'''

def read_board(path):
    """Read a single minesweeper board from file, ignoring trailing empty lines."""
    with open(path, 'r', encoding='utf-8') as f:
        # rows = [line.rstrip('\n') for line in f]
        rows = [list(line.rstrip('\n')) for line in f]
    # Remove trailing empty lines
    while rows and not rows[-1]:
        rows.pop()
    return rows

def neighbors(r, c, nrows, ncols):
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            if dr == 0 and dc == 0:
                continue
            nr, nc = r + dr, c + dc
            if 0 <= nr < nrows and 0 <= nc < ncols:
                yield nr, nc


def find_outline_and_numbers(board):
    nrows, ncols = len(board), len(board[0]) if board else (0, 0)
    outline = set()
    numbers = {}  # (r,c) -> int
    for r in range(nrows):
        for c in range(ncols):
            ch = board[r][c]
            if ch.isdigit():
                numbers[(r, c)] = int(ch)
            elif ch == '.' or ch == '?':
                # unknown for now; mark as outline later if adjacent to number
                pass
    for (r, c), val in numbers.items():
        for nr, nc in neighbors(r, c, nrows, ncols):
            if board[nr][nc] in ('.', '?'):
                outline.add((nr, nc))
    return sorted(outline), numbers


def build_variable_index(outline):
    return {pos: idx for idx, pos in enumerate(outline)}


def build_constraint_graph(outline, numbers, var_index):
    # For each number cell, determine which outline variables touch it
    nvars = len(var_index)
    num_neighbors = {}  # (r,c) -> list of var indices touching it
    for (r, c), val in numbers.items():
        vars_here = [var_index[(nr, nc)] for nr, nc in neighbors(r, c, len(board), len(board[0]))
                     if (nr, nc) in var_index]
        if vars_here:
            num_neighbors[(r, c)] = (val, vars_here)

    # Build undirected graph between variables: connect two variables if they appear
    # together in the neighborhood of any number. This defines clusters.
    g = [[] for _ in range(nvars)]
    for _, (_, varlist) in num_neighbors.items():
        for a, b in itertools.combinations(varlist, 2):
            g[a].append(b)
            g[b].append(a)
    return g, num_neighbors


def connected_components(graph):
    n = len(graph)
    comp_id = [-1] * n
    comps = []
    cid = 0
    for i in range(n):
        if comp_id[i] != -1:
            continue
        # BFS/DFS
        stack = [i]
        comp = []
        comp_id[i] = cid
        while stack:
            u = stack.pop()
            comp.append(u)
            for v in graph[u]:
                if comp_id[v] == -1:
                    comp_id[v] = cid
                    stack.append(v)
        comps.append(comp)
        cid += 1
    return comps, comp_id


def prepare_number_constraints(num_neighbors, board):
    # For each numbered cell we compute:
    # expected = number - count_of_already_flagged('!') around it
    # varlist = list of variable indices (outline) touching it
    prepared = {}
    for (r, c), (number, varlist) in num_neighbors.items():
        flagged = 0
        for nr, nc in neighbors(r, c, len(board), len(board[0])):
            if board[nr][nc] == '!':
                flagged += 1
        expected = number - flagged
        if expected < 0:
            # immediate inconsistency in the input board
            raise ValueError(f"Inconsistent board: too many flagged around {(r,c)}")
        prepared[(r, c)] = {'expected': expected, 'vars': varlist}
    return prepared


def solve_cluster(cluster_vars, var_pos_map, number_constraints):
    """
    cluster_vars: list of variable indices belonging to the cluster
    var_pos_map: maps var index -> position (r,c)
    number_constraints: dict keyed by (r,c) -> {'expected', 'vars'} for all number cells
                        (only those that reference variables in this cluster matter)

    Returns a list of solutions, each is dict var_index -> 'x' or 'o'
    """
    # Restrict constraints to those that mention any variable in this cluster
    vars_set = set(cluster_vars)
    relevant_numbers = {}
    for k, v in number_constraints.items():
        # intersection
        inter = [vid for vid in v['vars'] if vid in vars_set]
        if inter:
            relevant_numbers[k] = {'expected': v['expected'], 'vars': inter}

    # For pruning we will maintain for each numbered constraint:
    #  assigned_mines, assigned_safe, unassigned_count (within this cluster)

    # Precompute for each variable which numbered constraints it participates in
    var_to_numbers = {vid: [] for vid in cluster_vars}
    for num_pos, info in relevant_numbers.items():
        for vid in info['vars']:
            var_to_numbers[vid].append(num_pos)

    # order variables heuristically: by degree (most constrained first)
    var_order = sorted(cluster_vars, key=lambda v: -len(var_to_numbers[v]))

    solutions = []

    # state for numbers
    number_state = {num_pos: {'assigned_mines': 0, 'assigned_safe': 0, 'unassigned': len(info['vars'])}
                    for num_pos, info in relevant_numbers.items()}

    assign = {}

    def backtrack(i=0):
        if i == len(var_order):
            # found a full assignment consistent with constraints
            solutions.append(assign.copy())
            return
        vid = var_order[i]

        # try assign 'x' (mine) and 'o' (safe)
        for sym in ('x', 'o'):
            inconsistent = False
            touched = []
            for num_pos in var_to_numbers[vid]:
                st = number_state[num_pos]
                # update
                st['unassigned'] -= 1
                if sym == 'x':
                    st['assigned_mines'] += 1
                else:
                    st['assigned_safe'] += 1
                touched.append(num_pos)

                expected = relevant_numbers[num_pos]['expected']
                am = st['assigned_mines']
                un = st['unassigned']
                # prune conditions:
                # - assigned mines > expected
                # - even if all remaining are mines, assigned_mines + unassigned < expected
                if am > expected or (am + un) < expected:
                    inconsistent = True
                    break

            if not inconsistent:
                assign[vid] = sym
                backtrack(i + 1)
                del assign[vid]

            # revert updates
            for num_pos in touched:
                st = number_state[num_pos]
                if sym == 'x':
                    st['assigned_mines'] -= 1
                else:
                    st['assigned_safe'] -= 1
                st['unassigned'] += 1

        # end for sym

    backtrack(0)
    return solutions


def combine_and_write_solutions(board, outline, var_index, components, comp_solutions, outpath):
    # comp_solutions is list of lists (for each component) where each solution is dict var->'x'/'o'
    counts = [len(lst) for lst in comp_solutions]
    total = 1
    for c in counts:
        total *= c
        if total > MAX_COMBINATIONS_WARN:
            raise RuntimeError(f"Refusing to produce >{MAX_COMBINATIONS_WARN} combined solutions ({total})")

    print(f"Writing {total} combined solutions to {outpath} ...")

    # create a template copy
    base = [row[:] for row in board]

    with outpath.open("w", encoding="utf-8") as f:
        for combo in itertools.product(*comp_solutions):
            # combo is a tuple of solution dicts (one per component)
            b = [row[:] for row in base]
            for sol in combo:
                for vid, sym in sol.items():
                    r, c = outline[vid]
                    b[r][c] = sym
            # write board
            for row in b:
                f.write("".join(row) + "\n")
            f.write("\n")

    print("Done.")


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python generate_configurations.py board_YYYYMMDD_HHMMSS.txt")
        raise SystemExit(1)

    path = Path(sys.argv[1])
    print("reading board...")
    board = read_board(path)

    print("finding outline and number cells...")
    outline, numbers = find_outline_and_numbers(board)
    print(f"found outline containing {len(outline)} cells")

    if not outline:
        print("No outline cells found. Nothing to do.")
        raise SystemExit(0)

    var_index = build_variable_index(outline)
    print("building constraint graph...")
    graph, num_neighbors = build_constraint_graph(outline, numbers, var_index)

    print("computing connected components of the outline (clusters)...")
    comps, comp_id = connected_components(graph)
    print(f"found {len(comps)} cluster(s): sizes = {[len(c) for c in comps]}")

    # prepare numeric constraints (expected counts after accounting for flagged '!')
    try:
        prepared_numbers = prepare_number_constraints(num_neighbors, board)
    except ValueError as e:
        print("Input board inconsistent:", e)
        raise SystemExit(2)

    # solve each cluster independently
    comp_solutions = []
    for idx, comp in enumerate(comps):
        print(f"solving cluster {idx+1}/{len(comps)} (size={len(comp)})...")
        # map var idx -> pos for convenience
        var_pos_map = {v: outline[v] for v in comp}
        sols = solve_cluster(comp, var_pos_map, prepared_numbers)
        print(f"  cluster {idx+1} has {len(sols)} solutions")
        if not sols:
            print("No valid solutions for a cluster -> overall board has no valid configurations")
            raise SystemExit(0)
        comp_solutions.append(sols)

    # output file name
    timestamp = "_".join(path.stem.split("_")[1:]) if "_" in path.stem else datetime.now().strftime("%Y%m%d_%H%M%S")
    outname = Path(f"configurations_{timestamp}.txt")

    combine_and_write_solutions(board, outline, var_index, comps, comp_solutions, outname)

