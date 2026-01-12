# Quick Test - Board Validation Feature

## Test the New Feature (2 minutes)

### Step 1: Start the Server
```bash
cd /home/databiz189/Téléchargements/minesweeper_solver
python3 serve.py 8888
```

### Step 2: Open the Webapp
Open in browser: **http://localhost:8888/minesweeper-solver.html**

### Step 3: Go to Visual Grid Editor Tab
Click on the **"Visual Grid Editor"** tab

### Step 4: Create a Test Grid

#### Option A: Upload an Image
- Click "Upload Image"
- Select a minesweeper screenshot
- Adjust crop/zoom
- Set dimensions
- Click cells to set values

#### Option B: Manual Test (Easier)
1. Set dimensions: **3 rows × 3 cols**
2. Click "Initialize Grid"
3. Create this INVALID board:
   - Cell (0,0): Click to set `!` (mine)
   - Cell (0,1): Click to set `!` (mine)
   - Cell (0,2): Click to set `1`
   - Cell (1,0): Click to set `1`
   - Cell (1,1): Click to set `!` (mine)
   - Cell (1,2): Click to set `1`
   - Cell (2,0): Click to set `1`
   - Cell (2,1): Click to set `1`
   - Cell (2,2): Click to set `.` (or leave as `?`)

Your grid should look like:
```
!!1
1!1
11?
```

### Step 5: Export and See Validation
Click **"Export to Board"**

**Expected Result**: You should see:
```
⚠️ Board Constraint Violations Found!

• Cell (0,2) has 1 but 2 mines nearby (too many)

Do you want to export anyway?
```

**Why?** Cell at (0,2) has value "1" but has 2 mines adjacent to it (cells 0,0 and 0,1).

### Step 6: Fix the Board
1. Click **Cancel** in the dialog
2. Change cell (0,2) from `1` to `2`
3. Click **"Export to Board"** again

**Expected Result**: You should see:
```
✅ Board exported: 3×3 (all constraints valid)
```

Success! The board is now valid.

---

## Test Cases

### Test 1: Valid Board ✅
```
Grid: 3×3
.1.
121
.1.
```
**Expected**: Green success toast, exported to editor

---

### Test 2: Too Many Mines ❌
```
Grid: 3×3
!!1    ← Cell (0,2) has "1" but 2 mines
1!1
11.
```
**Expected**: Error dialog showing "Cell (0,2) has 1 but 2 mines nearby"

---

### Test 3: Impossible Constraint ❌
```
Grid: 3×3
000
010    ← Cell (1,1) has "1" but no mines possible (all 0s around)
000
```
**Expected**: Error dialog showing "Cell (1,1) has 1 but can't reach it"

---

### Test 4: Export Anyway
1. Create an invalid board
2. See error dialog
3. Click **OK** (instead of Cancel)

**Expected**: Orange warning toast "⚠️ Board exported (with constraint violations)"

---

## What to Look For

✅ **Validation runs automatically** when clicking "Export to Board"
✅ **Error dialog shows** when violations found
✅ **Clear error messages** explain what's wrong
✅ **Can cancel or proceed** based on your choice
✅ **Success toast** when board is valid
✅ **Warning toast** when exported with violations

---

## Troubleshooting

### "No validation dialog appears"
- Make sure you have numbered cells (0-8) on the board
- Validation only runs if there are numbers to check

### "Can't create the test board"
- Make sure you clicked "Initialize Grid" first
- Click cells multiple times to cycle through values
- Order: ? → . → ! → 0 → 1 → 2 → ... → 8 → ?

### "Export button doesn't work"
- Hard refresh: Ctrl+Shift+R
- Clear cache and reload
- Check browser console for errors

---

## Success!

If you see the validation working, the feature is ready to use! 🎉

You can now confidently create boards knowing they'll be validated for correctness.

