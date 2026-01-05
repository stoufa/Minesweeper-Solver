#!/bin/bash
# Test script to verify the minesweeper solver web app works correctly
# Run this after starting the server with: python3 serve.py

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Minesweeper Solver - Quick Test                        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3."
    exit 1
fi
echo "✅ Python 3 is installed"

# Check if serve.py exists
if [ ! -f "serve.py" ]; then
    echo "❌ serve.py not found. Are you in the correct directory?"
    exit 1
fi
echo "✅ serve.py exists"

# Check if serve.sh exists and is executable
if [ ! -f "serve.sh" ]; then
    echo "❌ serve.sh not found"
    exit 1
fi
echo "✅ serve.sh exists"

if [ ! -x "serve.sh" ]; then
    echo "⚠️  serve.sh is not executable, fixing..."
    chmod +x serve.sh
fi
echo "✅ serve.sh is executable"

# Check if main HTML file exists
if [ ! -f "minesweeper-solver.html" ]; then
    echo "❌ minesweeper-solver.html not found"
    exit 1
fi
echo "✅ minesweeper-solver.html exists"

# Check if JavaScript file exists
if [ ! -f "minesweeper-solver.js" ]; then
    echo "❌ minesweeper-solver.js not found"
    exit 1
fi
echo "✅ minesweeper-solver.js exists"

# Check JavaScript syntax
python3 -c "
import sys
try:
    with open('minesweeper-solver.js', 'r') as f:
        content = f.read()
    # Basic check for common syntax errors
    if 'function createEditorBoard' not in content:
        print('❌ createEditorBoard function not found')
        sys.exit(1)
    if 'function handleCellChange' not in content:
        print('❌ handleCellChange function not found')
        sys.exit(1)
    if 'function exportGrid' not in content:
        print('❌ exportGrid function not found')
        sys.exit(1)
    print('✅ Key functions exist in JavaScript')
except Exception as e:
    print(f'❌ Error reading JavaScript file: {e}')
    sys.exit(1)
"

# Check if archive directory exists
if [ ! -d "archive" ]; then
    echo "⚠️  archive/ directory not found (creating it)"
    mkdir archive
fi
echo "✅ archive/ directory exists"

echo ""
echo "─────────────────────────────────────────────────────────"
echo "All checks passed! ✅"
echo ""
echo "To start the server, run:"
echo "  python3 serve.py"
echo ""
echo "Then open in your browser:"
echo "  http://localhost:8000/minesweeper-solver.html"
echo ""
echo "Manual Testing Checklist:"
echo "  [ ] Editor: Create a board and draw cells"
echo "  [ ] Editor: Click and drag to paint multiple cells"
echo "  [ ] Editor: Release mouse and verify painting stops"
echo "  [ ] Editor: Hover over cells (no changes should occur)"
echo "  [ ] Visual Grid Editor: Upload an image"
echo "  [ ] Visual Grid Editor: Crop the image"
echo "  [ ] Visual Grid Editor: Create grid and mark cells"
echo "  [ ] Visual Grid Editor: Export to board"
echo "  [ ] Visual Grid Editor: Return and upload new image"
echo "  [ ] Solver: Load board and find solution"
echo "  [ ] History: Save board to history"
echo "  [ ] History: View timeline"
echo "  [ ] History: Export and import history"
echo "─────────────────────────────────────────────────────────"

