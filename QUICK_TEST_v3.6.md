# Quick Test Guide - v3.6.0 Features

## 🚀 Fast Testing (5 minutes)

### Part 1: Visual Grid Editor Bug Fixes

#### Test 1: Opacity Applied on Upload (30 seconds)
1. Open http://localhost:8888/minesweeper-solver.html
2. Go to **Visual Grid Editor** tab
3. Upload any screenshot/image
4. **Expected**: Image appears faded (30% opacity), not full brightness
5. **✅ PASS** if image is semi-transparent immediately

#### Test 2: Crop Re-adjustment (1 minute)
1. With image loaded, click **"Create Grid"** (use 8×8)
2. Grid appears on image
3. Click **"Enable Crop"** button
4. **Expected**: Grid disappears, crop rectangle appears
5. Drag crop handles to resize
6. Click **"Enable Crop"** again
7. **Expected**: Grid reappears (crop hidden)
8. **✅ PASS** if you can toggle crop on/off freely

#### Test 3: Reset and Re-upload (1 minute)
1. Click **"Reset"** button
2. **Expected**: Upload dialog appears again
3. Upload a **different** image
4. **Expected**: New image loads successfully
5. **✅ PASS** if second upload works without issues

---

### Part 2: Visual Suggestion Board (2 minutes)

#### Test 1: Load Test Board
1. Go to **Solver** tab
2. Paste this board:
```
................
................
................
.........3332...
.....!312!11!211
...34!2011111211
222!2110000001!1
!111100000000111
1100011112211221
110001!22!!11!!1
!100012!22212342
1100112121101!2!
11102!201!102231
1!102!2022201!10
222121101!101121
!11!10001110001!
```

#### Test 2: Solve and View Visual Board
1. Click **"Solve Board"**
2. Wait for results (may take a few seconds)
3. Scroll down to **"No certain moves available!"** section
4. **Expected to see**:
   - Table with top 5 cells and probabilities ✅
   - **📍 Visual Board** below the table ✅
   - Grid showing the entire board ✅
   - **★** (star) marking the best cell ✅
   - **② ③ ④ ⑤** marking alternatives ✅
   - Legend: "★ = Best choice | ② ③ ④ ⑤ = Alternative safe choices" ✅

#### Test 3: Verify Visual Board
1. Find the **★** in the visual board
2. Note its position
3. Check it matches the "Best guess: Cell (X, Y)" coordinates above
4. **✅ PASS** if star position matches coordinates

---

## 🔍 What to Look For

### Visual Grid Editor Fixes

**Opacity Test**:
- ❌ BAD: Image at 100% brightness (solid)
- ✅ GOOD: Image faded/semi-transparent

**Crop Re-adjustment**:
- ❌ BAD: Can't toggle crop after creating grid
- ✅ GOOD: Crop button works anytime, grid hides/shows

**Reset Test**:
- ❌ BAD: Second upload doesn't work or shows old image
- ✅ GOOD: Fresh upload dialog, new image loads

### Visual Suggestion Board

**Visual Board Display**:
```
Should look like this:

📍 Visual Board (suggested cells highlighted):
┌────────────────┐
│ . . . ② ★ . . │  ← Star visible
│ . . 3 3 3 2 . │  ← Numbers visible
│ . ! 3 1 2 ! 1 │  ← Mines (💣) visible
│ 2 2 ! 2 1 1 1 │
└────────────────┘

★ = Best choice | ② ③ ④ ⑤ = Alternatives
```

**Markers**:
- **★** = Bright green, bold, largest
- **②③④⑤** = Green shades, progressively lighter
- Numbers = Color-coded (1=blue, 2=green, 3=red, etc.)
- **💣** = Mines shown
- Empty cells = Blank or faded

---

## 🐛 Troubleshooting

### Visual Grid Editor Issues

**"Opacity still 100%"**
- Hard refresh: Ctrl+Shift+R
- Check browser console for errors

**"Crop toggle doesn't work"**
- Make sure you clicked "Create Grid" first
- Look for "Enable Crop" button
- Should toggle between "Enable Crop" and "Disable Crop"

**"Reset doesn't clear file input"**
- Try clicking Reset twice
- Check if upload dialog appears
- Clear browser cache if needed

### Visual Board Issues

**"No visual board showing"**
- Make sure solver shows "No certain moves available!"
- Only appears when probabilities are calculated
- Check that board has unknowns (. or ?)

**"Can't see markers"**
- Zoom in browser (Ctrl/Cmd + Plus)
- Star (★) should be obvious
- Numbers (②③④⑤) are circled digits

**"Board too small/large"**
- Adjust browser zoom
- Board adapts to dimensions automatically
- Large boards (30×30) might need zoom out

---

## ✅ Success Criteria

All tests pass if:

### Visual Grid Editor
- ✅ Image opacity is faded immediately on upload
- ✅ Can toggle crop on/off after creating grid
- ✅ Grid hides when crop enabled, shows when disabled
- ✅ Reset allows uploading new images without issues

### Visual Suggestion Board
- ✅ Visual board appears in probability suggestions
- ✅ ★ (star) marks the best cell
- ✅ ② ③ ④ ⑤ mark alternatives
- ✅ Board dimensions match input board
- ✅ Cell values displayed correctly
- ✅ Star position matches coordinates in text

---

## 📊 Quick Reference

### Visual Board Markers

| Marker | Rank | Color | Meaning |
|--------|------|-------|---------|
| ★ | 1st | Bright green | Best choice |
| ② | 2nd | Medium green | Good alternative |
| ③ | 3rd | Light green | Decent option |
| ④ | 4th | Pale green | Safe-ish |
| ⑤ | 5th | Very pale | Least safe of top 5 |

### Cell Symbols

| Symbol | Type | Color |
|--------|------|-------|
| 1 | Number | Blue |
| 2 | Number | Green |
| 3 | Number | Red |
| 4-8 | Numbers | Various |
| 💣 | Mine | Red |
| ? | Unknown | Yellow |
| (blank) | Empty | Gray |

---

## 🎯 Expected Results

### Test Board Result

For the 16×16 board provided:
- **Configurations**: ~1000+ found
- **Safe cells**: 0 (all uncertain)
- **Probability suggestions**: Yes
- **Visual board**: Shows entire 16×16 grid
- **Best cell**: Marked with ★
- **Alternatives**: Marked with ② ③ ④ ⑤

### Typical Output

```
Statistics:
- Outline: 48 cells
- Configurations: 1024
- Safe cells: 0
- Uncertain: 48

💡 No certain moves available!
Best guess: Cell (1, 9) - 68.3% safe

Top 5 Safest Cells:
(1, 9)  - 31.7% mine, 68.3% safe
(1, 8)  - 34.2% mine, 65.8% safe
(2, 9)  - 36.5% mine, 63.5% safe
(1, 7)  - 38.1% mine, 61.9% safe
(0, 9)  - 39.7% mine, 60.3% safe

📍 Visual Board:
[16×16 grid with ★ at (1,9)]
```

---

## 🎉 All Done!

If all tests pass, you have:
- ✅ Fixed Visual Grid Editor bugs
- ✅ Working visual suggestion board
- ✅ Easy cell location without counting
- ✅ Better strategic Minesweeper gameplay!

**Enjoy the enhanced solver!** 🚀

