# Visual Suggestion Board - User Guide

## Overview

The probability suggestion feature now includes a **visual board display** that shows exactly where the suggested safe cells are located, eliminating the need to manually count rows and columns!

## What's New

### Visual Board Display

When the solver suggests next moves (probability-based recommendations), you now see:

1. **Text Table** - Top 5 safest cells with probabilities (as before)
2. **Visual Board** ⭐ NEW! - Graphical representation showing cell locations

## How It Looks

### Example Display

```
💡 No certain moves available!

Best guess: Cell (2, 8) - 75.3% chance of being safe

Top 5 Safest Cells:
┌─────────────┬─────────┬─────────┐
│ Cell (r,c)  │ Mine %  │ Safe %  │
├─────────────┼─────────┼─────────┤
│ (2, 8)      │ 24.7%   │ 75.3%   │ ← Best!
│ (1, 7)      │ 26.1%   │ 73.9%   │
│ (2, 7)      │ 28.4%   │ 71.6%   │
└─────────────┴─────────┴─────────┘

📍 Visual Board (suggested cells highlighted):
┌─────────────────────────────┐
│ 1  2  3  .  .  .  1  ②  ★ │  ← Row 2, Star at col 8
│ .  .  2  3  2  .  1  ③  2 │
│ .  .  1  !  2  1  1  .  . │
└─────────────────────────────┘

★ = Best choice | ② ③ ④ ⑤ = Alternative safe choices
```

## Visual Markers

### Suggested Cells

| Marker | Meaning | Color | Priority |
|--------|---------|-------|----------|
| **★** | Best choice | Bright green | #1 |
| **②** | 2nd best | Medium green | #2 |
| **③** | 3rd best | Light green | #3 |
| **④** | 4th best | Pale green | #4 |
| **⑤** | 5th best | Very pale green | #5 |

### Cell Types

| Symbol | Meaning | Color |
|--------|---------|-------|
| `1-8` | Numbers | Color-coded (1=blue, 2=green, 3=red, etc.) |
| `💣` | Mine | Red |
| `?` | Unknown | Yellow |
| (empty) | Revealed empty | Gray |

## Benefits

### Before ❌
```
Best guess: Cell (12, 7)
```
You had to:
1. Count down 12 rows from top
2. Count across 7 columns from left
3. Hope you didn't miscount
4. Repeat for each suggested cell

### After ✅
```
📍 Visual Board:
[visual grid showing ★ exactly where to click]
```
You can:
1. **See immediately** where to click
2. **Compare alternatives** visually
3. **No counting** required
4. **Context** - see surrounding cells

## Use Cases

### 1. Large Boards
On a 16×16 or 30×30 board, counting cells is error-prone. The visual board makes it instant.

### 2. Multiple Suggestions
When you have 5 suggested cells, you can see them all at once and choose based on board context.

### 3. Strategic Planning
See where suggestions are relative to known mines and numbers, helping you make better decisions.

## Color Coding

### Suggestion Highlights

The background color intensity indicates priority:
- **★ (Best)**: Brightest green with thick border
- **② (2nd)**: Slightly dimmer
- **③ (3rd)**: Even dimmer
- **④ (4th)**: Faint
- **⑤ (5th)**: Very faint

This helps you quickly identify the safest option while still seeing alternatives.

## Example Scenarios

### Scenario 1: Clear Best Choice

```
Visual Board:
1  1  .  .  .
1  ★  1  .  .
.  1  1  .  .
```
The ★ stands out - click there!

### Scenario 2: Multiple Good Options

```
Visual Board:
1  1  ②  .  .
1  !  2  ③  .
.  2  ★  1  .
```
All three (★②③) are good, but ★ is safest. You can see they're clustered together.

### Scenario 3: Complex Board

```
Visual Board (16×16):
. . 1 ! 2 1 . . . 1 2 3 2 1 . .
1 1 2 2 2 1 . . 1 2 ! ! ! 2 1 .
! 1 . . 1 . . . 1 ! 4 4 3 2 1 .
2 2 1 1 1 . . . 1 2 2 ★ 1 . . .
... (more rows)
```
Easy to spot the ★ even on a large board!

## Technical Details

### Board Generation

The visual board:
- Respects actual board dimensions
- Shows all cells, not just unknowns
- Highlights only the top 5 safest cells
- Uses CSS grid for proper alignment
- Compact 25×25px cells for space efficiency

### Markers

- Numbered markers (②③④⑤) use Unicode circled digits
- Star (★) is a standard Unicode character
- Colors use RGBA for semi-transparent backgrounds
- Borders highlight suggested cells further

## Tips

### Reading the Board

1. **Look for the star first** - That's your best bet
2. **Check alternatives** - If ★ looks risky in context, try ②
3. **Note the surroundings** - Numbers and mines around suggestions matter
4. **Use probabilities** - The table shows exact percentages

### Strategic Use

- If ★ is next to many unknowns, it might cascade (good!)
- If ★ is isolated, it's safer but might not reveal much
- Multiple suggestions nearby often mean that area is safer overall
- Suggestions far from revealed areas might be corner/edge plays

## Integration with Workflow

### Standard Workflow

1. **Enter board** in Editor or Visual Grid Editor
2. **Click "Solve Board"** in Solver tab
3. **View results**:
   - Safe cells (if any)
   - OR probability suggestions with visual board
4. **Find the ★** on the visual board
5. **Click that cell** in your actual game
6. **Update board** with new information
7. **Repeat**

### With History

1. Solve → See visual board
2. Note the ★ position
3. Make move in game
4. Save to history (automatically tracks progression)
5. Load from history later to review strategy

## Troubleshooting

### "Visual board not showing"

Make sure:
- Solver found configurations (check stats)
- No certain cells exist (visual board only shows for probability suggestions)
- Browser supports CSS grid (all modern browsers do)

### "Can't see markers clearly"

- Zoom in your browser (Ctrl/Cmd + Plus)
- The markers use bold, distinct Unicode characters
- Colors have high contrast with dark theme

### "Board too small/large"

- Board adapts to actual dimensions
- Large boards (30×30) might need browser zoom out
- Small boards (8×8) display clearly at default zoom

## Summary

The visual suggestion board transforms probability recommendations from abstract coordinates into an intuitive, visual guide. No more counting rows and columns - just look for the ★ and click!

**Key Benefits**:
- ✅ Instant visual location of best move
- ✅ See all alternatives at a glance  
- ✅ Context from surrounding cells
- ✅ No manual counting required
- ✅ Better strategic decisions

**Try it now**: Solve a board with no certain cells and see the visual board in action!

