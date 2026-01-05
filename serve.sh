#!/bin/bash
# Start a simple HTTP server to serve the Minesweeper Solver webapp
# This avoids CORS issues with file:// protocol

PORT=${1:-8000}

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Minesweeper Solver Web Server                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  Server running at: http://localhost:$PORT/"
echo ""
echo "  Open this URL in your browser:"
echo "    → http://localhost:$PORT/minesweeper-solver.html"
echo ""
echo "  Press Ctrl+C to stop the server"
echo ""
echo "─────────────────────────────────────────────────────────"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT --bind 127.0.0.1
elif command -v python &> /dev/null; then
    python -m http.server $PORT --bind 127.0.0.1
else
    echo "Error: Python not found. Please install Python 3."
    exit 1
fi

