#!/usr/bin/env python3
import sys
import subprocess
from pathlib import Path

def find_latest_board():
    """Find the most recent board_*.txt file based on the timestamp in its name."""
    board_files = sorted(Path(".").glob("board_*.txt"))
    if not board_files:
        print("Error: No board_*.txt files found in the current directory.")
        sys.exit(1)
    return board_files[-1]  # The latest one lexicographically

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 pipeline.py <board_filename | -l | --latest>")
        print("Example: python3 pipeline.py board_20251013_133207.txt")
        print("         python3 pipeline.py --latest")
        sys.exit(1)
    
    arg = sys.argv[1]

    if arg in ("-l", "--latest"):
        board_path = find_latest_board()
        board_file = str(board_path)
        print(f"Using latest board file: {board_file}")
    else:
        board_file = arg
        board_path = Path(board_file)
        if not board_path.exists():
            print(f"Error: File '{board_file}' not found.")
            sys.exit(1)
    
    # Extract timestamp
    board_name = board_path.stem  # e.g., board_20251022_140233
    if board_name.startswith("board_"):
        timestamp = board_name[6:]
    else:
        print(f"Warning: Expected filename format 'board_TIMESTAMP.txt', got '{board_file}'")
        timestamp = board_name
    
    configurations_file = f"configurations_{timestamp}.txt"
    
    print(f"Step 1: Generating configurations from {board_file}")
    print(f"Running: python3 generate_configurations.py {board_file}")
    print("-" * 60)
    
    try:
        subprocess.run(
            ["python3", "generate_configurations.py", board_file],
            check=True
        )
    except subprocess.CalledProcessError as e:
        print(f"\nError: generate_configurations.py failed with exit code {e.returncode}")
        sys.exit(1)
    except FileNotFoundError:
        print("\nError: python3 or generate_configurations.py not found")
        sys.exit(1)
    
    print(f"\nStep 2: Combining configurations from {configurations_file}")
    print(f"Running: python3 combine_configurations.py {configurations_file}")
    print("-" * 60)
    
    try:
        subprocess.run(
            ["python3", "combine_configurations.py", configurations_file],
            check=True
        )
    except subprocess.CalledProcessError as e:
        print(f"\nError: combine_configurations.py failed with exit code {e.returncode}")
        sys.exit(1)
    except FileNotFoundError:
        print("\nError: python3 or combine_configurations.py not found")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("Pipeline completed successfully!")
    print("=" * 60)

if __name__ == "__main__":
    main()

