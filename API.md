# API Documentation

## Python Scripts API Reference

### generate_board.py

**Purpose:** Generate empty board templates

**Command Line Usage:**
```bash
python generate_board.py --width <W> --height <H>
python generate_board.py -w <W> -h <H>
```

**Arguments:**
- `-w, --width`: Number of columns (must be > 0)
- `-h, --height`: Number of rows (must be > 0)
- `--help`: Show help message

**Output:** Creates `board_YYYYMMDD_HHMMSS.txt`

**Exit Codes:**
- `0`: Success
- `1`: Invalid arguments
- `2`: File write error

---

### generate_configurations.py

**Purpose:** Generate all valid mine configurations

**Command Line Usage:**
```bash
python generate_configurations.py <board_file>
```

**Arguments:**
- `board_file`: Path to board text file (e.g., `board_20251231_120000.txt`)

**Output:** Creates `configurations_YYYYMMDD_HHMMSS.txt`

**Constants:**
```python
MAX_COMBINATIONS_WARN = 10_000_000  # Safety threshold
```

**Functions:**

#### `read_board(path)`
```python
def read_board(path):
    """
    Read a minesweeper board from file.
    
    Args:
        path: Path to board file
        
    Returns:
        List[List[str]]: 2D board array
    """
```

#### `neighbors(r, c, nrows, ncols)`
```python
def neighbors(r, c, nrows, ncols):
    """
    Get neighboring cell positions.
    
    Args:
        r: Row index
        c: Column index
        nrows: Total rows
        ncols: Total columns
        
    Yields:
        Tuple[int, int]: Neighbor positions (row, col)
    """
```

#### `find_outline_and_numbers(board)`
```python
def find_outline_and_numbers(board):
    """
    Identify outline cells and number constraints.
    
    Args:
        board: 2D board array
        
    Returns:
        Tuple[List[Tuple], Dict]: (outline positions, number cells)
    """
```

#### `solve_cluster(cluster_vars, var_pos_map, number_constraints)`
```python
def solve_cluster(cluster_vars, var_pos_map, number_constraints):
    """
    Solve a cluster using backtracking with pruning.
    
    Args:
        cluster_vars: List of variable indices in cluster
        var_pos_map: Map from variable index to position
        number_constraints: Constraint information
        
    Returns:
        List[Dict]: List of solutions, each mapping var -> 'x'/'o'
    """
```

**Exit Codes:**
- `0`: Success
- `1`: Invalid arguments
- `2`: Inconsistent board

---

### combine_configurations.py

**Purpose:** Combine configurations to find certain cells

**Command Line Usage:**
```bash
python combine_configurations.py <configurations_file>
```

**Arguments:**
- `configurations_file`: Path to configurations file

**Output:** Creates `solution_YYYYMMDD_HHMMSS.txt`

**Functions:**

#### `read_boards(filename)`
```python
def read_boards(filename):
    """
    Read all board configurations from file.
    
    Args:
        filename: Path to configurations file
        
    Returns:
        List[List[str]]: List of boards (each board is list of row strings)
    """
```

#### `find_consistent_cells(boards)`
```python
def find_consistent_cells(boards):
    """
    Find cells that are consistent across all boards.
    
    Args:
        boards: List of board configurations
        
    Returns:
        List[str]: Result board with consistent cells and '#' for varying
    """
```

**Exit Codes:**
- `0`: Success
- `1`: Invalid arguments

---

### pipeline.py

**Purpose:** Run complete workflow (generate + combine)

**Command Line Usage:**
```bash
python pipeline.py <board_file>
python pipeline.py --latest
python pipeline.py -l
```

**Arguments:**
- `board_file`: Path to board file
- `-l, --latest`: Use most recent board file

**Functions:**

#### `find_latest_board()`
```python
def find_latest_board():
    """
    Find the most recent board_*.txt file.
    
    Returns:
        Path: Path to latest board file
        
    Raises:
        SystemExit: If no board files found
    """
```

**Exit Codes:**
- `0`: Success
- `1`: Invalid arguments or file not found

---

### board_viewer.py

**Purpose:** Display board with emoji formatting

**Command Line Usage:**
```bash
python board_viewer.py <board_file>
```

**Arguments:**
- `board_file`: Path to board file to view

**Emoji Mapping:**
```python
{
    '!': '💣',   # Mine
    'o': '👍',   # Safe
    'x': '👎',   # Unsafe
    '?': '❓',   # Unknown
    '#': '🤔',   # Uncertain
    '0-9': '𝟎-𝟗' # Numbers
}
```

**Exit Codes:**
- `0`: Success
- `1`: Invalid arguments or file not found

---

## File Format Specifications

### Board File Format

**Extension:** `.txt`

**Format:**
```
<row1>
<row2>
...
<rowN>
```

Each character represents one cell:
- `.` = Unknown/unvisited
- `?` = Unknown (treated same as `.`)
- `!` = Flagged mine
- `0-8` = Revealed number

**Example:**
```
..........
.1110.....
.1!!10....
.12210....
..........
```

### Configurations File Format

**Extension:** `.txt`

**Format:**
Multiple boards separated by blank lines:
```
<board1>

<board2>

<board3>

...
```

Each board uses same format as input, but with:
- `o` = Safe cell (in this configuration)
- `x` = Mine cell (in this configuration)

### Solution File Format

**Extension:** `.txt`

**Format:** Same as board file, but cells are:
- Original values (numbers, flags) preserved
- `o` = Definitely safe (same in all configs)
- `x` = Definitely mine (same in all configs)
- `#` = Uncertain (varies across configs)

**Example:**
```
##########
#1110ooooo
#1xx10oooo
#12210oooo
##########
```

---

## Web Application API

### JavaScript State Object

```javascript
state = {
  editor: {
    rows: number,
    cols: number,
    board: string[][],
    pen: string,
    isDrawing: boolean
  },
  solver: {
    inputBoard: string,
    outputBoard: string,
    stats: {
      outlineSize: number,
      clusters: number,
      configurations: number,
      safeCells: number
    }
  },
  viewer: {
    currentBoard: string
  },
  history: Array<{
    timestamp: string,
    inputBoard: string,
    outputBoard: string,
    stats: object
  }>
}
```

### Core Functions

#### `boardToString(board)`
```javascript
/**
 * Convert 2D board array to string representation
 * @param {string[][]} board - 2D array of cell characters
 * @returns {string} String representation with newlines
 */
```

#### `stringToBoard(str)`
```javascript
/**
 * Convert string to 2D board array
 * @param {string} str - String with newline-separated rows
 * @returns {string[][]} 2D array of cell characters
 */
```

#### `solveMinesweeper(board)`
```javascript
/**
 * Solve a minesweeper board
 * @param {string[][]} board - Input board
 * @returns {Object} {solution: board, stats: {...}}
 */
```

#### `getNeighbors(r, c, nrows, ncols)`
```javascript
/**
 * Get all neighboring cells
 * @param {number} r - Row index
 * @param {number} c - Column index
 * @param {number} nrows - Total rows
 * @param {number} ncols - Total columns
 * @returns {Array<[number, number]>} Array of [row, col] pairs
 */
```

#### `generateConfigurations(board, outline, numbers, nrows, ncols)`
```javascript
/**
 * Generate valid configurations
 * @param {string[][]} board - Current board state
 * @param {Array<[number, number]>} outline - Outline cell positions
 * @param {Object} numbers - Number constraints
 * @param {number} nrows - Total rows
 * @param {number} ncols - Total columns
 * @returns {Array<string[][]>} Array of valid board configurations
 */
```

#### `combineConfigurations(board, configurations, outline)`
```javascript
/**
 * Combine configurations to find certain cells
 * @param {string[][]} board - Original board
 * @param {Array<string[][]>} configurations - All valid configs
 * @param {Array<[number, number]>} outline - Outline positions
 * @returns {string[][]} Solution board
 */
```

### LocalStorage API

**Keys:**
- `minesweeper_history`: Array of game history entries

**Functions:**

#### `saveToLocalStorage(key, data)`
```javascript
/**
 * Save data to browser localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to save (will be JSON stringified)
 */
```

#### `loadFromLocalStorage(key)`
```javascript
/**
 * Load data from browser localStorage
 * @param {string} key - Storage key
 * @returns {any} Parsed data or null if not found
 */
```

---

## Integration Examples

### Python to Python

**Example 1: Full Pipeline**
```python
import subprocess

board_file = "board_20251231_120000.txt"

# Generate configurations
subprocess.run(["python3", "generate_configurations.py", board_file])

# Combine configurations
configs_file = board_file.replace("board_", "configurations_")
subprocess.run(["python3", "combine_configurations.py", configs_file])

# View solution
solution_file = board_file.replace("board_", "solution_")
subprocess.run(["python3", "board_viewer.py", solution_file])
```

**Example 2: Using pipeline.py**
```python
import subprocess

# Automatic workflow
subprocess.run(["python3", "pipeline.py", "--latest"])
```

### Python to Web

**Export board for web viewing:**
```python
# After generating solution
with open("solution_20251231_120000.txt", "r") as f:
    content = f.read()
    
# Copy to clipboard or serve via HTTP for web app
```

### Web to Python

**Download board from web for Python processing:**
```javascript
// In browser
const boardStr = boardToString(state.editor.board);
const blob = new Blob([boardStr], { type: 'text/plain' });
const link = document.createElement('a');
link.href = URL.createObjectURL(blob);
link.download = `board_${getTimestamp()}.txt`;
link.click();

// Then use with Python:
// python generate_configurations.py board_YYYYMMDD_HHMMSS.txt
```

---

## Error Handling

### Common Errors

**1. FileNotFoundError**
```python
# When board file doesn't exist
try:
    board = read_board(path)
except FileNotFoundError:
    print(f"Error: File '{path}' not found.")
    sys.exit(1)
```

**2. Inconsistent Board**
```python
# When board has impossible constraints
if expected < 0:
    raise ValueError(f"Inconsistent board: too many flagged around {(r,c)}")
```

**3. Configuration Explosion**
```python
# When too many configurations
if total > MAX_COMBINATIONS_WARN:
    raise RuntimeError(f"Refusing to produce >{MAX_COMBINATIONS_WARN} configurations")
```

**4. No Valid Solutions**
```python
# When board has no valid configurations
if not sols:
    print("No valid solutions found")
    sys.exit(0)
```

### Best Practices

1. **Always validate input files exist before processing**
2. **Check board consistency before solving**
3. **Limit configuration count for large boards**
4. **Provide clear error messages to users**
5. **Use exit codes consistently**

---

## Performance Considerations

### Python

- **Small boards (< 10 outline cells):** < 1 second
- **Medium boards (10-20 outline cells):** 1-10 seconds
- **Large boards (> 20 outline cells):** May require clustering optimization

### JavaScript (Web App)

- **Limited to ~10 outline cells** for real-time solving
- **Uses sampling** for larger boards (not exhaustive)
- **Suitable for interactive use**, not production analysis

**Recommendation:** Use Python scripts for large/complex boards, web app for quick analysis and visualization.

---

## Version Compatibility

- **Python:** 3.7+
- **Web Browsers:** Modern browsers with ES6+ support
  - Chrome 60+
  - Firefox 60+
  - Safari 12+
  - Edge 79+

No external dependencies required!

