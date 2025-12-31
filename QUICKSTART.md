# Quick Start Guide

Get started with Minesweeper Solver in 5 minutes!

## 🚀 Option 1: Web Application (Easiest)

### Step 1: Open the Web App
Simply open `minesweeper-solver.html` in your web browser. No installation needed!

### Step 2: Create a Board
1. Go to the **Editor** tab
2. Set dimensions (e.g., 10x10)
3. Click and drag to draw your board state:
   - Click the pen buttons to select what to draw
   - Numbers (0-8) for revealed cells
   - `!` for known mines
   - `.` for unknown cells

### Step 3: Solve
1. Click **"Save & Go to Solver →"**
2. Click **"🔍 Solve Board"**
3. Wait a moment while it analyzes

### Step 4: View Results
- `👍` = **SAFE** - Click these cells!
- `👎` = **MINE** - Flag these cells!
- `🤔` = **UNCERTAIN** - Need more info

### Step 5: Save Your Progress
Click **"Save to History"** to keep track of your games!

---

## 🐍 Option 2: Command Line (Most Powerful)

### Step 1: Create a Board
```bash
# Create a 10x10 empty board
python generate_board.py --width 10 --height 10
```

This creates `board_YYYYMMDD_HHMMSS.txt`

### Step 2: Edit the Board
Open the file in a text editor and fill in your game state:
```
..........
.1110.....
.1??10....
.12210....
..........
```

Where:
- `.` = unknown cell
- `0-8` = revealed number
- `!` = known mine
- `?` = also unknown

### Step 3: Solve Using Pipeline
```bash
# Automatic solve - finds latest board
python pipeline.py --latest

# Or specify a board
python pipeline.py board_20251231_120000.txt
```

This will:
1. Generate all valid configurations
2. Combine them to find certain cells
3. Save the result

### Step 4: View the Solution
```bash
python board_viewer.py solution_20251231_120000.txt
```

You'll see:
- `👍` = Safe cells (click these!)
- `👎` = Mine cells (flag these!)
- `🤔` = Uncertain cells (avoid these!)

---

## 📊 Example Walkthrough

### Scenario: Mid-game Minesweeper

You're playing Minesweeper and stuck on this position:

```
..........
.1110.....
.1??10....
.12210....
..........
```

You know:
- The `1`s and `2`s are revealed numbers
- The `?` cells are unknown
- You want to know which cells are safe

### Using Web App:

1. **Open** `minesweeper-solver.html`
2. **Editor tab**: Create 10x10 board
3. **Draw** the pattern above using pen tools
4. **Solver tab**: Click "Solve Board"
5. **View** the result - it will show which cells are safe!

### Using Command Line:

1. **Create board:**
   ```bash
   python generate_board.py -w 10 -h 5
   ```

2. **Edit** `board_YYYYMMDD_HHMMSS.txt` to match the pattern

3. **Solve:**
   ```bash
   python pipeline.py --latest
   ```

4. **View:**
   ```bash
   python board_viewer.py solution_YYYYMMDD_HHMMSS.txt
   ```

### Expected Result:

```
🤔 🤔 🤔 🤔 🤔 🤔 🤔 🤔 🤔 🤔
🤔 𝟏 𝟏 𝟏 𝟎 👍 👍 👍 👍 👍
🤔 𝟏 🤔 🤔 𝟏 𝟎 👍 👍 👍 👍
🤔 𝟏 𝟐 𝟐 𝟏 𝟎 👍 👍 👍 👍
🤔 🤔 🤔 🤔 🤔 🤔 🤔 🤔 🤔 🤔
```

All the `👍` cells are **100% safe** to click!

---

## 💡 Pro Tips

### Tip 1: Start Simple
For your first try, use a small board (5x5) with just a few numbers to see how it works.

### Tip 2: Mark Known Mines
If you've already flagged mines in your game, mark them with `!` in the board file. This helps the solver.

### Tip 3: Use the Viewer
The HTML viewer (`minesweeper-viewer.html`) is great for visualizing results without the command line.

### Tip 4: Save Your Work
The web app's history feature lets you track multiple games. Very useful for learning patterns!

### Tip 5: Uncertain Cells
When you see `🤔` (uncertain), it means that cell could be either safe or a mine. The solver needs more information. In the game, you might need to make a guess or reveal other cells first.

---

## 🎯 Common Use Cases

### Use Case 1: "I'm Stuck"
You've revealed several cells but don't know which cell to click next safely.

**Solution:** Input your board, run solver, click the `👍` cells!

### Use Case 2: "Is This Cell Safe?"
You suspect a cell might be safe but aren't sure.

**Solution:** The solver will tell you for certain if it's safe, a mine, or uncertain.

### Use Case 3: "What's the Probability?"
You want to know your odds before guessing.

**Solution:** Currently shows certain/uncertain. For probabilities, you'd need to enhance the code (see TECHNICAL.md).

### Use Case 4: "Learn Minesweeper Patterns"
You want to get better at Minesweeper.

**Solution:** Save different board states and solutions in the history. Study which patterns lead to safe cells!

---

## 🔧 Troubleshooting

### Problem: "No valid solutions found"
**Cause:** Your board has contradictory constraints (impossible situation)
**Fix:** Check your input - you may have entered a number wrong, or made a wrong flag in the game

### Problem: "Too many configurations"
**Cause:** Very large outline (20+ unknown cells near numbers)
**Fix:** 
- Try revealing more cells in the game first
- Or edit the Python code to increase `MAX_COMBINATIONS_WARN`

### Problem: "Everything shows as uncertain (🤔)"
**Cause:** Not enough information - all cells could be either safe or mines
**Fix:** You'll need to make a guess in the game, reveal more cells, then try again

### Problem: "Web app is slow"
**Cause:** JavaScript solver is limited for large boards
**Fix:** Use the Python command-line tools instead for better performance

### Problem: "Can't find board_*.txt"
**Cause:** Wrong directory or file not created
**Fix:** Make sure you're in the right directory. Use full path if needed.

---

## 📚 What's Next?

### Learn More
- Read **README.md** for complete documentation
- Check **TECHNICAL.md** to understand the algorithms
- Browse **API.md** for programming reference

### Explore Examples
Look in the `archive/` folder for real examples:
```bash
# View an example board
python board_viewer.py archive/board_20251111_151640.txt

# View its solution
python board_viewer.py archive/solution_20251111_151640.txt
```

### Customize
- Modify emoji mappings in `board_viewer.py`
- Adjust configuration limits in `generate_configurations.py`
- Enhance the web app styling in `minesweeper-solver.html`

### Share
Found it helpful? Share with other Minesweeper players!

---

## 🎮 Happy Minesweeping!

You now know how to:
- ✅ Create boards (web or command line)
- ✅ Solve them to find safe cells
- ✅ View results visually
- ✅ Save your game history

Now go beat some Minesweeper records! 💣🎯

---

**Need help?** Check the other documentation files or examine the example files in `archive/`.

