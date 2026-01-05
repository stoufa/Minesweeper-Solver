#!/usr/bin/env python3
"""
Simple HTTP server to serve the Minesweeper Solver webapp.
This avoids CORS issues that occur when using the file:// protocol.

Usage:
    python3 serve.py [port]

Default port is 8000.
"""

import http.server
import socketserver
import sys
import os

# Change to the script directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Get port from command line argument or use default
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

# Create handler
Handler = http.server.SimpleHTTPRequestHandler

# Disable caching for development
Handler.extensions_map.update({
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
})

class NoCacheHTTPRequestHandler(Handler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

# Start server
with socketserver.TCPServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
    print(f"╔══════════════════════════════════════════════════════════╗")
    print(f"║  Minesweeper Solver Web Server                          ║")
    print(f"╚══════════════════════════════════════════════════════════╝")
    print(f"")
    print(f"  Server running at: http://localhost:{PORT}/")
    print(f"")
    print(f"  Open this URL in your browser:")
    print(f"    → http://localhost:{PORT}/minesweeper-solver.html")
    print(f"")
    print(f"  Press Ctrl+C to stop the server")
    print(f"")
    print(f"─────────────────────────────────────────────────────────")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n  Server stopped.")
        sys.exit(0)

