# Getting Started with Minesweeper Solver

## Quick Start (Web App - Recommended)

### 1. Start the Local Server

```bash
cd /path/to/minesweeper_solver
python3 serve.py
```

You should see:
```
╔══════════════════════════════════════════════════════════╗
║  Minesweeper Solver Web Server                          ║
╚══════════════════════════════════════════════════════════╝

  Server running at: http://localhost:8000/

  Open this URL in your browser:
    → http://localhost:8000/minesweeper-solver.html
```

### 2. Open in Browser

Click or navigate to: **http://localhost:8000/minesweeper-solver.html**

### 3. Use the Web App

#### Tab 1: Editor
1. **Set board dimensions** (e.g., 10×10)
2. **Create board** - Click "Create Board"
3. **Draw your board state**:
   - Click to select a pen tool (`.` = empty, `?` = unknown, `!` = mine, `0-8` = numbers)
   - Click and drag to paint cells
   - **Visual Grid Editor**: Click "📐 Visual Grid Editor" to upload a screenshot and manually mark cells

#### Tab 2: Solver
1. **Load your board** - Click "Load from Editor" (or upload a file)
2. **Find solution** - Click "Find Safe Moves"
3. **View results**:
   - `👍` = Definitely safe
   - `👎` = Definitely mine
   - `🤔` = Uncertain
   - If all uncertain, probability percentages are shown

#### Tab 3: Viewer
- View and compare different boards
- Useful for checking previous solutions

#### Tab 4: History
- **Save current state** - Click "💾 Save to History"
- **View timeline** - See the evolution of your game
- **Export/Import** - Save your game history to study later

## Visual Grid Editor Workflow

Perfect for converting screenshots to boards:

1. **Upload Image**:
   - Click "📐 Visual Grid Editor" in the Editor tab
   - Drag & drop a screenshot, or paste from clipboard (Ctrl+V)

2. **Crop to Board**:
   - Drag the green crop rectangle to cover just the board area
   - Use corner/edge handles to resize precisely
   - Adjust zoom and opacity sliders as needed

3. **Set Dimensions**:
   - Enter the actual board dimensions (e.g., 8×8, 16×16)

4. **Create Grid**:
   - Click "Create Grid" - overlay grid appears on the image

5. **Mark Cells**:
   - Click cells to select them
   - Use keyboard or buttons to set cell value:
     - `.` or `Space` = Empty/revealed
     - `0-8` = Number
     - `!` = Mine
     - `?` = Unknown

6. **Export**:
   - Click "Export to Board" - switches to Editor tab with your board ready!

## Command Line Workflow (Advanced)

### Generate Empty Board
```bash
python generate_board.py --width 10 --height 10
```

### Edit Board
Edit the generated `board_YYYYMMDD_HHMMSS.txt` file manually or use the web editor.

### Find Solution (Pipeline)
```bash
python pipeline.py board_20260105_120000.txt
```

This generates:
- `configurations_20260105_120000.txt` - All valid mine configurations
- `solution_20260105_120000.txt` - Combined solution

### View Results
```bash
python board_viewer.py solution_20260105_120000.txt
```

## Tips & Tricks

### Editor Tab
- **Keyboard shortcuts**: Press `.`, `?`, `!`, or `0-8` to quickly switch pen tools
- **Live validation**: The board is validated in real-time to check constraint violations
- **No duplicates**: History won't save the same board twice

### Solver Tab
- **Probability mode**: When all cells are uncertain, probabilities are calculated
- **Best guess**: The solver suggests the cell with the lowest mine probability
- **Statistics**: Shows total configurations found and analysis details

### Visual Grid Editor
- **Zoom**: Use the slider to zoom in/out of the image
- **Opacity**: Adjust image opacity to see the grid overlay better
- **Precise cropping**: Use corner handles for proportional resize, edge handles for one-dimensional resize
- **Move crop**: Click inside the rectangle and drag to move it

### History Tab
- **Timeline view**: See board states in chronological order
- **Load any state**: Click a timeline entry to load that board state
- **Export history**: Download all your game states as a JSON file
- **Import history**: Load a previously exported history to review past games

## Common Issues

### "Can't modify cells after releasing mouse"
This has been fixed in v3.2.0. Make sure you're using the latest version.

### "Black canvas in Visual Grid Editor"
Refresh the page and try again. Make sure you're using a supported image format (PNG, JPG).

### "CORS errors in console"
You're opening the HTML file directly. Use the server scripts instead:
```bash
python3 serve.py
```

### "Board constraints are violated"
The numbers on your board don't match the mine configuration. Double-check:
- Each number equals the count of adjacent mines/flags
- Revealed cells (0-8) should have the correct count

## Need Help?

- Check `README.md` for comprehensive documentation
- See `CHANGELOG.md` for recent fixes and features
- Review `SERVER_GUIDE.md` for server setup details
- Look in `archive/` for example boards and solutions

---

**Happy solving! 💣🎮**

