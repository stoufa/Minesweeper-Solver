# Web Application Documentation

## Overview

The Minesweeper Solver Web Application provides a unified interface for creating, solving, and analyzing Minesweeper boards without using the command line.

## Features

### 🎨 Four Main Tabs

1. **Editor** - Create and edit boards visually
2. **Solver** - Generate solutions with statistics
3. **Viewer** - Visualize boards with emoji rendering
4. **History** - Save and manage game sessions

### 🌟 Key Capabilities

- ✅ No installation required (pure HTML/CSS/JavaScript)
- ✅ Works offline (no server needed)
- ✅ Persistent history using browser localStorage
- ✅ Import/Export functionality
- ✅ Responsive design
- ✅ Real-time visual feedback

---

## Tab-by-Tab Guide

### 📝 Editor Tab

**Purpose:** Create and edit Minesweeper boards

#### Controls

**Dimensions:**
- **Rows**: 1-30 (default: 10)
- **Columns**: 1-30 (default: 10)

**Buttons:**
- **Create Board**: Generate new empty board
- **Clear Board**: Reset all cells to empty (.)
- **Save & Go to Solver →**: Transfer to solver and switch tabs
- **Download as File**: Save as `board_YYYYMMDD_HHMMSS.txt`

#### Pen Tools

Click a pen to select, then draw on the board:

| Symbol | Meaning | Usage |
|--------|---------|-------|
| `.` (dot) | Empty/Unknown | Unrevealed cells |
| `?` | Unknown | Alternative for unrevealed |
| `!` | Mine | Known/flagged mine |
| `0-8` | Number | Revealed cell with mine count |

#### Drawing

- **Click** - Place single cell
- **Click + Drag** - Draw multiple cells
- **Keyboard** - Press the symbol key to select that pen

#### Preview

The text area at bottom shows the raw board format - this is what gets saved/exported.

---

### 🔍 Solver Tab

**Purpose:** Analyze boards and find safe moves

#### Workflow

1. **Load Board**
   - Click "Load from Editor" to use your drawn board
   - Click "Load from File" to upload a text file
   - Or paste directly into "Input Board" textarea

2. **Solve**
   - Click "🔍 Solve Board"
   - Wait for analysis (shows spinner)
   - View statistics and solution

3. **Review Results**
   - Statistics show:
     - **Outline Cells**: Unknown cells being analyzed
     - **Clusters**: Independent groups found
     - **Configurations**: Valid possibilities found
     - **Safe Cells**: Cells definitely safe to click
   - Solution appears in "Solution" textarea

4. **Take Action**
   - Click "View Solution →" to see visual rendering
   - Click "Save to History" to store this game

#### Output Legend

| Symbol | Emoji | Meaning | Action |
|--------|-------|---------|--------|
| `o` | 👍 | Safe | Click this cell! |
| `x` | 👎 | Mine | Flag this cell! |
| `#` | 🤔 | Uncertain | Need more info |
| `0-8` | Number | Known | Already revealed |
| `!` | 💣 | Mine | Already flagged |

#### Understanding Results

**All Safe (o/👍):** Every valid configuration has this cell safe - **100% safe to click!**

**All Mines (x/👎):** Every valid configuration has a mine here - **100% definitely a mine!**

**Uncertain (#/🤔):** Some configurations have mine, some have safe - **cannot determine without more info**

---

### 👁️ Viewer Tab

**Purpose:** Visualize boards with color-coded cells

#### Features

- **Visual Rendering**: See boards with colors and emoji
- **Color Coding**:
  - Empty cells: Light gray background
  - Numbers: Blue background
  - Mines (!): Red background with 💣
  - Unknown (?): Yellow background with ❓
  - Safe (o): Green background with 👍
  - Unsafe (x): Red background with 👎
  - Uncertain (#): Yellow background with 🤔

#### Loading Boards

**From Solver:**
1. Solve a board in Solver tab
2. Click "View Solution →"
3. Auto-switches to Viewer

**From File:**
1. Click "Load Custom Board"
2. Select a `.txt` file
3. Board renders automatically

**Manual Paste:**
1. Paste board text into textarea
2. Board updates in real-time

#### Use Cases

- Review solutions visually
- Compare input vs output boards
- Take screenshots for reference
- Verify board files before solving

---

### 📚 History Tab

**Purpose:** Manage saved game sessions

#### Features

**Game List:**
Each entry shows:
- Date and time
- Statistics (Outline/Configs/Safe cells)
- Action buttons

**Actions per Game:**
- **View**: Load in Viewer tab
- **Download**: Save as text file
- **Delete**: Remove from history

**Bulk Actions:**
- **Export All**: Download history as JSON
- **Clear History**: Delete all saved games

#### Storage

- Uses browser **localStorage**
- Persists between sessions
- Limit: ~5-10MB (browser dependent)
- Private to your browser

#### Export Format

JSON file containing:
```json
[
  {
    "timestamp": "20251231_120000",
    "inputBoard": "...\n...\n",
    "outputBoard": "ooo\nxxx\n",
    "stats": {
      "outlineSize": 10,
      "clusters": 2,
      "configurations": 64,
      "safeCells": 5
    }
  }
]
```

---

## Technical Details

### Browser Compatibility

**Supported:**
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

**Required Features:**
- ES6 JavaScript
- CSS Grid
- LocalStorage
- FileReader API

### Performance

**Solver Limitations:**

| Outline Size | Performance | Method |
|--------------|-------------|--------|
| 1-10 cells | < 1 sec | Brute force |
| 11-15 cells | 1-5 sec | Brute force |
| 16-20 cells | 5-30 sec | Sampling |
| 20+ cells | Limited | Sampling only |

**Recommendation:** For boards with 20+ outline cells, use Python command-line tools instead.

### Algorithm

The JavaScript solver uses a **simplified version** of the Python algorithm:

**Small Boards (≤10 outline):** 
- Exhaustive enumeration
- Checks all 2^n configurations
- 100% accurate

**Large Boards (>10 outline):**
- Random sampling (up to 1024 configs)
- Not exhaustive
- May miss some edge cases
- Good for quick estimates

**For production use:** Use Python scripts (much faster, exact results)

### Data Privacy

**All data stays local:**
- No server communication
- No cloud storage
- No tracking
- Everything in your browser

**History data:**
- Stored in localStorage only
- Never leaves your computer
- Clear with "Clear History" button

---

## Keyboard Shortcuts

### Editor Tab
- **0-8, ., ?, !** - Select pen tool
- **Click + Drag** - Paint cells

### All Tabs
- **Ctrl/Cmd + Click** on tabs - Switch tabs (browser default)

---

## Common Workflows

### Workflow 1: Quick Analysis

1. **Editor** → Draw board (30 seconds)
2. **Solver** → Click solve (2 seconds)
3. **Viewer** → See results (instant)
4. **Done!**

### Workflow 2: Session Management

1. **Solver** → Load & solve board
2. **History** → Save to history
3. Play next game in Minesweeper
4. Return to step 1
5. Later: **History** → Review all games

### Workflow 3: File-Based

1. **Editor** → Download board file
2. Use Python CLI for solving:
   ```bash
   python pipeline.py board_20251231_120000.txt
   ```
3. **Viewer** → Load solution file
4. **History** → Save for reference

### Workflow 4: Import/Export

1. **Editor** → Create several boards
2. **Solver** → Solve each one
3. **History** → Export all as JSON
4. Share JSON with others
5. They import and view

---

## Tips & Tricks

### Tip 1: Quick Testing
Use small boards (5x5) to test patterns quickly.

### Tip 2: Template Reuse
Download a board, modify it in text editor, reload in solver. Faster than redrawing!

### Tip 3: Screenshot Results
Viewer tab is perfect for screenshots - clean visual representation.

### Tip 4: Batch Processing
For many boards, use Python CLI + bash scripting instead of web app.

### Tip 5: Mobile Use
Works on mobile browsers! But drawing on small screens is tricky. Better on tablet/desktop.

### Tip 6: Offline Use
Download the HTML+JS files. Works completely offline - great for offline gaming!

### Tip 7: Multiple Windows
Open multiple browser tabs to compare different boards side-by-side.

---

## Troubleshooting

### Issue: Board doesn't render
**Solution:** Check that input has no empty lines in middle, each row same length

### Issue: Solver shows "0 configurations"
**Solution:** Board is impossible/contradictory - check your input numbers

### Issue: Solver takes forever
**Solution:** Too many outline cells - use Python CLI or reveal more cells first

### Issue: History not saving
**Solution:** 
- Check localStorage isn't disabled
- Check browser isn't in private/incognito mode
- Check storage quota isn't full

### Issue: Downloaded file is empty
**Solution:** Create/edit board first before downloading

### Issue: Can't load file
**Solution:** Ensure file is plain text (.txt), not Word doc or PDF

---

## Customization

### Change Colors

Edit CSS in `minesweeper-solver.html`:

```css
.cell.safe {
  background: #d1fae5;  /* Change green shade */
  font-size: 18px;
}
```

### Change Emoji

Edit JavaScript in `minesweeper-solver.js`:

```javascript
if (cell === 'o') {
  cellEl.textContent = '✅';  // Use checkmark instead of 👍
}
```

### Adjust Limits

```javascript
const maxConfigs = Math.min(2048, ...);  // Increase from 1024
```

---

## Future Enhancements

**Possible additions:**

1. **Probability Mode**: Show percentage instead of just certain/uncertain
2. **Pattern Library**: Save and reuse common patterns
3. **Undo/Redo**: In editor
4. **Auto-save**: Periodic saves
5. **Import from Screenshot**: OCR to recognize game state
6. **Multi-board View**: Compare multiple solutions
7. **Statistics Dashboard**: Win rates, patterns analysis
8. **Share Links**: Generate shareable URLs
9. **Dark Mode**: Alternative color scheme
10. **Tutorial Mode**: Interactive learning

---

## API for Developers

See `API.md` for complete JavaScript API reference.

**Quick example:**

```javascript
// Solve a board programmatically
const board = [
  ['.', '1', '1', '0'],
  ['.', '1', '?', '0'],
  ['.', '1', '1', '0']
];

const result = solveMinesweeper(board);
console.log(result.stats);
console.log(result.solution);
```

---

## Comparison: Web App vs CLI

| Feature | Web App | Python CLI |
|---------|---------|------------|
| Installation | None | Python 3.7+ |
| Interface | Visual | Command line |
| Speed (small) | Fast | Fast |
| Speed (large) | Limited | Very fast |
| Offline | ✅ Yes | ✅ Yes |
| History | ✅ Built-in | Manual |
| Visualization | ✅ Excellent | Text/Emoji |
| Accuracy | Good | Perfect |
| Max board size | ~15 outline | Unlimited |
| Best for | Quick analysis | Production use |

**Recommendation:** 
- Web app for interactive exploration and learning
- CLI for serious analysis and large boards

---

## Credits

Built with vanilla JavaScript - no frameworks, no dependencies, just pure web technologies!

**Technologies used:**
- HTML5
- CSS3 (Grid, Flexbox)
- ES6+ JavaScript
- LocalStorage API
- File API
- Blob API

---

**Enjoy solving Minesweeper with confidence!** 💣🎮

