#!/usr/bin/env python3
"""
generate_board.py

Usage:
    python generate_board.py --width 10 --height 5
    python generate_board.py -w 8 -h 3

This script creates a file named `board_YYYYMMDD_HHMMSS.txt` in the
current directory containing `height` lines where each line contains
`width` dots ('.').
"""

import argparse
from datetime import datetime
from pathlib import Path
import sys


def positive_int(value: str) -> int:
    try:
        iv = int(value)
    except ValueError:
        raise argparse.ArgumentTypeError(f"invalid int value: '{value}'")
    if iv <= 0:
        raise argparse.ArgumentTypeError(f"value must be > 0: {iv}")
    return iv


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate a text board of dots.",
        add_help=False
    )
    parser.add_argument("-h", "--height", type=positive_int, required=True,
                        help="number of lines (must be > 0)")
    parser.add_argument("--help", action="help", help="show this help message and exit")
    parser.add_argument("-w", "--width", type=positive_int, required=True,
                    help="number of dots per line (must be > 0)")

    args = parser.parse_args()

    now = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"board_{now}.txt"
    outpath = Path(filename)

    # Write efficiently: build one line and reuse it
    line = "." * args.width + "\n"

    try:
        with outpath.open("w", encoding="utf-8") as f:
            for _ in range(args.height):
                f.write(line)
            f.write('\n')
    except OSError as e:
        print(f"Failed to write file {outpath}: {e}", file=sys.stderr)
        return 2

    print(f"Wrote board to {outpath} ({args.width}x{args.height})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
    
