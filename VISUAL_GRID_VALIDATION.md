# Visual Grid Editor - Board Validation Feature

## Overview

The Visual Grid Editor now automatically validates board constraints when you click "Export to Board". This ensures that the board you're creating respects the fundamental rules of Minesweeper.

## What Gets Validated

For each numbered cell (0-8) on the board, the validator checks:

1. **Too Many Mines**: The number of adjacent mines (`!`) doesn't exceed the cell's number
2. **Impossible Constraint**: The cell's number can actually be satisfied with the available unknown cells (`.` or `?`)

### Examples

**Valid Board** ✅
```
!11.
1!1.
11..
```
- The `1` at (0,1) has 1 mine nearby ✅
- The `1` at (0,2) has 1 mine nearby ✅
- All constraints satisfied

**Invalid Board** ❌
```
!!1.
1!1.
11..
```
- The `1` at (0,2) has 2 mines nearby (should be 1) ❌
- Constraint violated!

## How It Works

### When You Export

1. Click **"Export to Board"** in the Visual Grid Editor
2. **Automatic validation** runs in the background
3. **Three possible outcomes**:

#### Outcome 1: All Valid ✅
```
✅ Board exported: 8×8 (all constraints valid)
```
- Board is exported to the Editor tab
- Green success toast notification
- Ready to solve!

#### Outcome 2: Violations Found ⚠️
```
⚠️ Board Constraint Violations Found!

• Cell (2,3) has 1 but 2 mines nearby (too many)
• Cell (4,5) has 3 but can't reach it (not enough cells)
• Cell (1,7) has 2 but 3 mines nearby (too many)

Do you want to export anyway?
[Cancel] [OK]
```
- Shows up to 5 errors
- You can choose to:
  - **Cancel**: Fix the errors first
  - **OK**: Export anyway (for testing/debugging)

#### Outcome 3: Export With Warnings
If you choose "OK" after seeing violations:
```
⚠️ Board exported: 8×8 (with constraint violations)
```
- Orange warning toast
- Board exported but you know it has issues
- Can still be edited or solved (but may not have valid solutions)

## Why This Matters

### Before This Feature ❌
- You could export invalid boards
- Solver might find no solutions (confusing)
- Hard to know if the board or solver was wrong
- Time wasted debugging

### After This Feature ✅
- Immediate feedback on board validity
- Know exactly which cells have problems
- Can fix issues before solving
- Confidence in your board setup

## Use Cases

### 1. Creating Boards from Screenshots
When using the Visual Grid Editor to transcribe a board from an image:
- OCR might misread some cells
- Validation catches transcription errors
- Ensures your board matches the screenshot

### 2. Manual Board Creation
When manually building a board for testing:
- Easy to make mistakes
- Validation prevents invalid setups
- Faster iteration

### 3. Learning Tool
Understanding Minesweeper constraints:
- See why certain configurations are invalid
- Learn the rules through feedback
- Better understanding of the game

## Technical Details

### Validation Function
```javascript
validateBoardData(board) {
  // Returns: { valid, errors, hasNumbers }
  // - valid: boolean (true if all constraints satisfied)
  // - errors: array of error messages
  // - hasNumbers: boolean (true if board has numbered cells)
}
```

### Constraints Checked
For each numbered cell with value `N`:
- `mineCount ≤ N` (not too many mines)
- `mineCount + unknownCount ≥ N` (enough cells to satisfy)

Where:
- `mineCount` = adjacent cells marked as `!`
- `unknownCount` = adjacent cells marked as `.` or `?`

### Error Messages
Format: `Cell (row,col) has N but...`
- `"...X mines nearby (too many)"` - Too many known mines
- `"...can't reach it (not enough cells)"` - Impossible to satisfy

## Example Workflow

1. **Open Visual Grid Editor tab**
2. **Upload a screenshot**
3. **Adjust crop/zoom** to frame the board
4. **Set grid dimensions** (e.g., 8×8)
5. **Click cells to set values**
   - Numbers: 0-8
   - Mines: !
   - Unknown: . or ?
6. **Click "Export to Board"**
7. **See validation result**:
   - ✅ All valid → Exported to Editor
   - ⚠️ Errors → Fix or export anyway
8. **Continue to Solver tab** to find next moves

## Tips

### Fixing Common Errors

**"Too many mines"**
- Check if you marked a mine that should be unknown
- Verify the number is correct

**"Not enough cells"**
- Make sure unknown cells (. or ?) are around the number
- Don't mark cells as mines (!) if they might be safe

### Best Practices
- Export early and often to catch errors
- If you get warnings, review the error messages
- Use the confirmation dialog as a checklist
- Fix the first few errors, then re-export

## Summary

The Visual Grid Editor now helps you create **valid, solvable boards** by:
- ✅ Automatically checking constraints
- ✅ Showing clear error messages
- ✅ Letting you fix issues before solving
- ✅ Giving you confidence in your board setup

No more mystery about why a board won't solve! 🎉

