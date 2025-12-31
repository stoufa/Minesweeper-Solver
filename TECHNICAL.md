# Technical Documentation

## Architecture Overview

The Minesweeper Solver consists of several components that work together to analyze board states and find optimal moves.

## Core Algorithms

### 1. Configuration Generation (`generate_configurations.py`)

#### Problem Statement
Given a partially revealed Minesweeper board, find all valid mine placements that satisfy the constraints of revealed numbers.

#### Algorithm

**Phase 1: Outline Detection**
```python
def find_outline_and_numbers(board):
    """
    Identifies:
    - outline: Set of unknown cells adjacent to revealed numbers
    - numbers: Map of (row, col) -> number value
    """
```

The outline represents the "frontier" - cells we need to solve for.

**Phase 2: Cluster Decomposition**
```python
def build_constraint_graph(outline, numbers, var_index):
    """
    Creates a graph where:
    - Nodes = outline cells (variables)
    - Edges = cells that appear together in a number's neighborhood
    """
```

This graph is then decomposed into connected components (clusters). Each cluster can be solved independently, exponentially reducing the search space.

**Example:**
```
Original problem: 20 variables → 2^20 = 1,048,576 combinations

After clustering:
- Cluster 1: 5 variables → 2^5 = 32 combinations
- Cluster 2: 8 variables → 2^8 = 256 combinations
- Cluster 3: 7 variables → 2^7 = 128 combinations

Total: 32 × 256 × 128 = 1,048,576 combinations (same)
BUT we only need to check: 32 + 256 + 128 = 416 combinations during solving!
```

**Phase 3: Backtracking with Pruning**
```python
def solve_cluster(cluster_vars, var_pos_map, number_constraints):
    """
    For each cluster:
    1. Order variables by constraint degree (most constrained first)
    2. Try assignments (mine 'x' or safe 'o')
    3. Prune early if constraints violated
    """
```

**Pruning Conditions:**
- Assigned mines exceed expected count
- Remaining cells insufficient to meet expected count

**Phase 4: Combination**
```python
def combine_and_write_solutions(board, outline, var_index, components, comp_solutions, outpath):
    """
    Takes cartesian product of cluster solutions
    Writes each complete configuration to file
    """
```

#### Complexity Analysis

**Brute Force:**
- Time: O(2^n) where n = number of outline cells
- Space: O(2^n) to store all configurations

**Optimized (Clustered):**
- Time: O(∑ 2^ci × k) where ci = cluster i size, k = number of constraints
- Space: O(max(2^ci)) - only largest cluster solutions in memory at once
- Typically 100-1000x faster for real-world boards

### 2. Configuration Combination (`combine_configurations.py`)

#### Purpose
Identify cells that have the same value across all valid configurations.

#### Algorithm
```python
def find_consistent_cells(boards):
    """
    For each cell position:
    - If all configurations agree → output that value
    - If configurations differ → output '#' (uncertain)
    """
```

#### Output Interpretation
- `o` (safe): Click this cell - it's definitely safe
- `x` (mine): Flag this cell - it's definitely a mine
- `#` (uncertain): Need more information - avoid clicking
- Numbers/flags: Already known information

### 3. Board Reading and Writing

#### File Format
Text files with one character per cell:
```
.?1001!!1
??3211221
!3!!21211
```

Each line is a row, each character is a cell.

#### Normalization
- Trailing newlines removed
- Rows padded to equal length (if needed)
- Timestamp extracted from filename

## Data Structures

### Board Representation
```python
board: List[List[str]]  # 2D array of characters
```

### Variable Index
```python
var_index: Dict[Tuple[int, int], int]
# Maps position (row, col) to variable index
# Example: {(0, 1): 0, (0, 2): 1, (1, 1): 2}
```

### Constraint Graph
```python
graph: List[List[int]]
# Adjacency list representation
# graph[i] = list of variable indices connected to variable i
```

### Number Constraints
```python
number_constraints: Dict[Tuple[int, int], Dict]
# {
#   (row, col): {
#     'expected': int,  # number of mines - already flagged
#     'vars': List[int]  # variable indices in neighborhood
#   }
# }
```

## Performance Optimizations

### 1. Cluster Decomposition
**Impact:** 100-1000x speedup
**Reason:** Exponential reduction in search space

### 2. Variable Ordering
**Heuristic:** Most constrained first
**Impact:** Better pruning, faster backtracking
**Reason:** Failures detected earlier

### 3. Progressive Writing
**Impact:** Constant memory usage
**Reason:** Configurations written to disk immediately, not stored in memory

### 4. Early Pruning
**Impact:** Eliminates invalid branches early
**Checks:**
```python
if assigned_mines > expected:
    return  # Too many mines already

if assigned_mines + unassigned < expected:
    return  # Can't reach expected count
```

## Edge Cases

### Empty Outline
```python
if not outline:
    print("No outline cells found. Nothing to do.")
    raise SystemExit(0)
```
Board is already fully solved or has no revealed numbers.

### Inconsistent Board
```python
if expected < 0:
    raise ValueError(f"Inconsistent board: too many flagged around {(r,c)}")
```
User flagged more mines than the number indicates.

### Configuration Explosion
```python
if total > MAX_COMBINATIONS_WARN:
    raise RuntimeError(f"Refusing to produce >{MAX_COMBINATIONS_WARN} configurations")
```
Prevents memory overflow.

### No Valid Solutions
```python
if not sols:
    print("No valid solutions for a cluster -> overall board has no valid configurations")
    raise SystemExit(0)
```
Board state is impossible (user made an error).

## File Naming Convention

All files use timestamp format: `YYYYMMDD_HHMMSS`

**Pattern:**
- Input: `board_20251231_120000.txt`
- Configurations: `configurations_20251231_120000.txt`
- Solution: `solution_20251231_120000.txt`

**Timestamp Extraction:**
```python
timestamp = "_".join(path.stem.split("_")[1:]) if "_" in path.stem else datetime.now().strftime("%Y%m%d_%H%M%S")
```

## Pipeline Flow

```
┌─────────────────┐
│ User Input      │
│ - Manual edit   │
│ - HTML editor   │
│ - Script gen    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ board_*.txt     │
│ (Input board)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ generate_       │
│ configurations  │
│                 │
│ 1. Find outline │
│ 2. Cluster      │
│ 3. Solve each   │
│ 4. Combine      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│configurations_* │
│ (All valid      │
│  configs)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ combine_        │
│ configurations  │
│                 │
│ Compare all     │
│ configs         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ solution_*.txt  │
│ (Next move)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Visualization   │
│ - Console       │
│ - HTML viewer   │
└─────────────────┘
```

## Error Handling

### Input Validation
- File existence check
- Board format validation
- Dimension consistency

### Runtime Safety
- Memory overflow prevention
- Constraint satisfaction validation
- Solution existence verification

### User Feedback
- Progress indicators during solving
- Clear error messages
- Success confirmations

## Testing with Archive

The `archive/` folder contains real-world test cases:

```bash
# Test configuration generation
python generate_configurations.py archive/board_20251111_151640.txt

# Verify against known solution
diff solution_20251111_151640.txt archive/solution_20251111_151640.txt
```

## Future Optimizations

### 1. Probability Calculation
Instead of just certain/uncertain, calculate probability each cell contains a mine.

### 2. Parallel Processing
Solve clusters in parallel for faster results.

### 3. Incremental Solving
Update only affected clusters when board changes.

### 4. Heuristic Ordering
When all cells are uncertain, suggest the safest probability-wise.

### 5. SAT Solver Integration
Use industrial-strength SAT solvers for very large boards.

## API Reference

See `API.md` for detailed function signatures and usage examples.

