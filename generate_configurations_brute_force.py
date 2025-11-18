#!/usr/bin/env python3
"""
generate_configurations.py
Reads a Minesweeper board text file and outputs all valid configurations
of the outline (unvisited cells adjacent to revealed cells).
"""

import itertools
from datetime import datetime
from pathlib import Path
import sys


def read_board(filename):
    with open(filename, "r") as f:
        return [list(line.strip()) for line in f if line.strip()]


def neighbors(r, c, nrows, ncols):
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            if dr == 0 and dc == 0:
                continue
            nr, nc = r + dr, c + dc
            if 0 <= nr < nrows and 0 <= nc < ncols:
                yield nr, nc


def find_outline(board):
    nrows, ncols = len(board), len(board[0])
    outline = set()
    for r in range(nrows):
        for c in range(ncols):
            if board[r][c].isdigit():  # revealed number
                for nr, nc in neighbors(r, c, nrows, ncols):
                    if board[nr][nc] == ".":
                        outline.add((nr, nc))
    return sorted(outline)


def count_adjacent_mines(board, r, c):
    nrows, ncols = len(board), len(board[0])
    count = 0
    for nr, nc in neighbors(r, c, nrows, ncols):
        if board[nr][nc] in ("!", "x"):  # confirmed or assumed mine
            count += 1
    return count


def is_valid(board):
    nrows, ncols = len(board), len(board[0])
    for r in range(nrows):
        for c in range(ncols):
            if board[r][c].isdigit():
                expected = int(board[r][c])
                actual = count_adjacent_mines(board, r, c)
                # invalid if too many or too few mines around
                if actual != expected:
                    return False
    return True


def generate_configurations(board):
    outline = find_outline(board)
    if not outline:
        print("No outline cells found.")
        return []
    print(f'found outline containing {len(outline)} cells')
    nb_configs = 2**len(outline)
    print(f'possible number of configurations: {nb_configs:_}')

    valid_configs = []
    for idx, combo in enumerate(itertools.product("ox", repeat=len(outline))):
        bcopy = [row[:] for row in board]
        for (r, c), symbol in zip(outline, combo):
            bcopy[r][c] = symbol
        if is_valid(bcopy):
            valid_configs.append(bcopy)
            print(f'found valid configuration! #{idx}')
    return valid_configs


def save_configurations(valid_configs, input_filename):
    if not valid_configs:
        print("No valid configurations found.")
        return
    timestamp = "_".join(input_filename.stem.split("_")[1:])
    outname = f"configurations_{timestamp}.txt"
    with open(outname, "w") as f:
        for config in valid_configs:
            for row in config:
                f.write("".join(row) + "\n")
            f.write("\n")
    print(f"Saved {len(valid_configs)} valid configurations to {outname}")


def main():
    if len(sys.argv) != 2:
        print("Usage: python generate_configurations.py board_YYYYMMDD_HHMMSS.txt")
        return 1
    path = Path(sys.argv[1])
    print('reading board...')
    board = read_board(path)
    print('generating configurations...')
    valid = generate_configurations(board)
    print('saving configurations...')
    save_configurations(valid, path)


if __name__ == "__main__":
    main()

