# Starting the Web Server

To avoid CORS issues when loading the webapp, you should use a local HTTP server instead of opening the HTML file directly with `file://` protocol.

## Quick Start

### Option 1: Using the Python Script (Recommended)

```bash
python3 serve.py
```

Or specify a custom port:

```bash
python3 serve.py 3000
```

### Option 2: Using the Bash Script

```bash
./serve.sh
```

Or specify a custom port:

```bash
./serve.sh 3000
```

### Option 3: Manual Python Command

```bash
python3 -m http.server 8000
```

## Accessing the Webapp

Once the server is running, open your browser and navigate to:

```
http://localhost:8000/minesweeper-solver.html
```

Replace `8000` with your chosen port if you used a different one.

## Stopping the Server

Press `Ctrl+C` in the terminal where the server is running.

## Troubleshooting

**Port already in use?**
- Choose a different port number (e.g., 8001, 8080, 3000)
- Or find and stop the process using that port:
  ```bash
  lsof -ti:8000 | xargs kill
  ```

**Python not found?**
- Make sure Python 3 is installed: `python3 --version`
- Install Python 3 if needed: `sudo apt install python3` (Linux) or download from python.org

**Permission denied?**
- Make the scripts executable: `chmod +x serve.py serve.sh`

