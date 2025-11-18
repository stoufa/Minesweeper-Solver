#!/usr/bin/env python3
import sys
import subprocess
from pathlib import Path

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 pipeline.py <board_filename>")
        print("Example: python3 pipeline.py board_20251013_133207.txt")
        sys.exit(1)
    
    board_file = sys.argv[1]
    
    # Validate that the board file exists
    if not Path(board_file).exists():
        print(f"Error: File '{board_file}' not found")
        sys.exit(1)
    
    # Extract the timestamp from the board filename
    # e.g., board_20251013_133207.txt -> 20251013_133207
    board_path = Path(board_file)
    board_name = board_path.stem  # Gets filename without extension
    
    if board_name.startswith('board_'):
        timestamp = board_name[6:]  # Remove 'board_' prefix
    else:
        print(f"Warning: Expected filename format 'board_TIMESTAMP.txt', got '{board_file}'")
        timestamp = board_name
    
    configurations_file = f"configurations_{timestamp}.txt"
    
    print(f"Step 1: Generating configurations from {board_file}")
    print(f"Running: python3 generate_configurations.py {board_file}")
    print("-" * 60)
    
    try:
        result = subprocess.run(
            ["python3", "generate_configurations.py", board_file],
            check=True,
            capture_output=False
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
        result = subprocess.run(
            ["python3", "combine_configurations.py", configurations_file],
            check=True,
            capture_output=False
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
