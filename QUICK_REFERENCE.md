# Minesweeper Solver - Quick Reference Guide

## 🚀 Getting Started

### Launch the Application
```bash
cd /home/databiz189/Téléchargements/minesweeper_solver
python3 -m http.server 8081
```
Then open: `http://localhost:8081/minesweeper-solver.html`

---

## 🎨 User Interface Overview

### Four Main Tabs:
1. **📝 Editor** - Create and edit minesweeper boards
2. **🔍 Solver** - Analyze boards and find safe moves
3. **👁️ Viewer** - Visualize solved boards
4. **📚 History** - Review past games and analysis

---

## 📝 Editor Tab

### Creating a Board
1. Set rows/columns (1-30)
2. Click "Create Board"
3. Select a pen tool (click or press key)
4. Draw on the board (click and drag)

### Pen Tools (Keyboard Shortcuts)
- `.` - Empty cell
- `?` - Unknown cell
- `!` - Mine
- `0-8` - Number (adjacent mine count)

### Live Validation ✅
- Automatically checks constraints as you draw
- Green ✅ = All valid
- Red ⚠️ = Constraint violations
- Shows specific error messages

### Actions
- **Save & Go to Solver →** - Load board into solver
- **Download as File** - Save board as .txt file
- **Clear Board** - Reset to all empty cells

---

## 🔍 Solver Tab

### How to Solve
1. Load board (from Editor or File)
2. Click "🔍 Solve Board"
3. View statistics and solution

### Solution Symbols
- `o` (👍) - **Safe cell** - Definitely safe to click
- `x` (👎) - **Mine** - Definitely a mine
- `#` (🤔) - **Uncertain** - Could be either

### Statistics Displayed
- **Outline Cells** - Cells being analyzed
- **Clusters** - Independent regions
- **Configurations** - Valid mine arrangements tested
- **Safe Cells** - Cells confirmed safe

### Probability Suggestions 🎲
When no cells are certain (all `#`):
- Shows safest cell to click
- Displays probability percentage
- Example: "Cell (3,5) has 22.5% chance of being a mine"

### Actions
- **View Solution →** - Open in Viewer tab
- **Save to History** - Add to game history

---

## 👁️ Viewer Tab

### Features
- Visual board display with emojis
- Color-coded cells for easy identification
- Load from solver or custom file

### Cell Display
- 💣 = Mine
- ❓ = Unknown
- 🤔 = Uncertain (could be mine or safe)
- 👍 = Safe
- 👎 = Mine (from analysis)
- Numbers = Adjacent mine count

---

## 📚 History Tab

### List View (Default)
- Shows all saved games chronologically
- Displays timestamp and statistics
- Actions per game:
  - **View** - Open in viewer
  - **Download** - Save to file
  - **Delete** - Remove from history

### Timeline View 📅
- Visual chronological timeline
- Shows progression of games
- Mini board previews
- Toggle with "📅 Timeline View" button

### Management
- **💾 Export All** - Save history as JSON
- **📥 Import History** - Load previously exported history
- **🗑️ Clear History** - Delete all saved games

### Duplicate Prevention
- Same board cannot be saved twice
- Shows warning if attempted
- Keeps history clean and unique

---

## 💡 Pro Tips

### Editor
- Use keyboard shortcuts for faster drawing
- Watch live validation to avoid invalid boards
- Release mouse to stop drawing (or move mouse out of board)

### Solver
- Start with small boards to learn patterns
- If all cells are uncertain, use probability suggestion
- Save interesting boards to history for later study

### History
- Export regularly to backup your analysis
- Use timeline view to see game progression
- Import history to restore or merge games

---

## 🎨 Theme

### Dark Theme (Default)
- Easy on the eyes for extended use
- Purple gradient accents
- High contrast for readability
- All components styled consistently

---

## ⚠️ Limitations

### Browser Solver
- Simplified algorithm (fast but less powerful than Python)
- Limited to 1024 configurations for large boards
- Uses random sampling for >10 outline cells

### For Complex Analysis
Use Python backend:
```bash
python3 pipeline.py path/to/board.txt
```

---

## 🐛 Troubleshooting

### Drawing doesn't stop
- **Fixed!** This was the editor bug that's now resolved
- If it happens: Refresh the page

### Validation not showing
- Add at least one numbered cell (0-8)
- Validation only appears when numbers are present

### History not saving
- Check if it's a duplicate board
- Clear browser storage if localStorage is full
- Export history first, then clear and re-import

### Solver taking too long
- Board might be too complex for JavaScript solver
- Use Python solver for better performance
- Try smaller boards first

---

## 📱 Browser Compatibility

**Recommended Browsers:**
- Chrome/Chromium (best performance)
- Firefox
- Safari
- Edge

**Required Features:**
- ES6 JavaScript support
- LocalStorage
- CSS Grid

---

## 🎓 Learning Resources

### Understanding the Algorithm
See these files in the project:
- `TECHNICAL.md` - Algorithm details
- `API.md` - Code documentation
- `PROJECT_SUMMARY.md` - Project overview

### Example Boards
Check the `archive/` folder for sample boards to study

---

## 🆘 Need Help?

1. Check `TEST_FEATURES.md` for testing guide
2. Review `UPDATE_SUMMARY_v2.md` for recent changes
3. Read `COMPLETION_REPORT.md` for project status
4. Look at `WEBAPP.md` for technical details

---

**Enjoy solving! 💣🎯**

