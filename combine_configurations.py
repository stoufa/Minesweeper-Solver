from datetime import datetime
from pathlib import Path
import sys

def read_boards(filename):
    """Read all minesweeper board configurations from file."""
    with open(filename, 'r') as f:
        content = f.read()
    
    # Split by empty lines to separate boards
    boards = []
    current_board = []
    
    for line in content.split('\n'):
        if line.strip():
            current_board.append(line)
        elif current_board:
            boards.append(current_board)
            current_board = []
    
    # Add last board if exists
    if current_board:
        boards.append(current_board)
    
    return boards

def find_consistent_cells(boards):
    """Find cells that are the same across all configurations."""
    if not boards:
        return []
    
    # Get dimensions from first board
    height = len(boards[0])
    width = len(boards[0][0]) if height > 0 else 0
    
    # Initialize result board
    result = []
    
    for row_idx in range(height):
        result_row = []
        for col_idx in range(width):
            # Get the character at this position from first board
            first_char = boards[0][row_idx][col_idx]
            
            # Check if all boards have the same character at this position
            is_consistent = True
            for board in boards[1:]:
                if board[row_idx][col_idx] != first_char:
                    is_consistent = False
                    break
            
            if is_consistent:
                result_row.append(first_char)
            else:
                result_row.append('#')
        
        result.append(''.join(result_row))
    
    return result

def main():
    if len(sys.argv) != 2:
        print("Usage: python combine_configurations.py configurations_YYYYMMDD_HHMMSS.txt")
        raise SystemExit(1)

    filename = sys.argv[1]
    path = Path(filename)
    
    # Read the file
    # filename = 'configurations_20251013_094730.txt'
    boards = read_boards(filename)
    
    print(f"Found {len(boards)} board configurations")
    
    # Find consistent cells
    result_board = find_consistent_cells(boards)
    
    # Print the result
    print("\nConsistent cells (# indicates varying cells):")
    print()
    for row in result_board:
        print(row)
       
    # Optional: Save to file
    timestamp = "_".join(path.stem.split("_")[1:]) if "_" in path.stem else datetime.now().strftime("%Y%m%d_%H%M%S")
    outname = f"solution_{timestamp}.txt"
    
    with open(outname, 'w') as f:
        for row in result_board:
            f.write(row + '\n')
        f.write('\n')
    
    print(f"\nResult saved to '{outname}'")

if __name__ == "__main__":
    main()

