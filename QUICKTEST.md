# Quick Start - Testing the Probability Fix

## ⚡ Fast Test (30 seconds)

1. **Start the server**:
   ```bash
   ./serve.sh
   ```
   Or:
   ```bash
   python3 serve.py 8888
   ```

2. **Open**: http://localhost:8888/minesweeper-solver.html

3. **Click** the "Solver" tab

4. **Paste this test board** (the one you reported):
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

5. **Click "Solve Board"**

6. **Look for**:
   - Output board with `#` symbols (uncertain cells)
   - Statistics showing configurations found
   - **Probability suggestions** with top 5 safest cells
   - Warning message if using heuristics

## ✅ What Should Happen

### Before (Broken):
- Output = same as input (no changes)
- No probability suggestions
- No helpful information

### After (Fixed):
- Output shows uncertain cells marked as `#`
- Statistics show analysis details
- **Top 5 safest cells displayed with probabilities**
- Clear recommendation for next move
- Warning if using heuristic estimates

## 🔍 Example Expected Output

```
Statistics:
- Outline Size: 48
- Configurations: 1024 (or 0 if heuristic)
- Safe Cells: 0
- Uncertain Cells: 48

💡 No certain moves available!

Best guess: Cell (2, 8) - 75.3% chance of being safe

Top 5 Safest Cells:
Cell (2,8)  → 24.7% mine risk, 75.3% safe
Cell (1,7)  → 26.1% mine risk, 73.9% safe
Cell (2,7)  → 28.4% mine risk, 71.6% safe
...
```

## 🐛 Troubleshooting

### "Same board as output"
- ✅ This was the bug - now fixed!
- If you still see this, hard refresh: Ctrl+Shift+R

### No probability suggestions shown
- Check if any cells are marked as certain (o or x)
- Probabilities only show when NO certain moves exist

### "No configurations found"
- ✅ This is OK! The heuristic fallback handles this
- You'll see a warning message
- You'll still get probability suggestions

## 📊 Console Debug Info

Open browser console (F12) to see:
```
Large outline (48 cells), using smart sampling with 100000 attempts...
Found 1024 valid configurations after 45231 attempts
```

Or if using heuristics:
```
Found 0 valid configurations after 100000 attempts
```

## 🎯 What Changed

1. **Smart sampling**: Uses constraint analysis to make better guesses
2. **More attempts**: Up to 100,000 attempts for large boards
3. **Heuristic fallback**: Calculates probabilities even when no configurations found
4. **Better UI**: Shows top 5 cells, warns when using estimates

## 📁 Related Files

- `PROBABILITY_FIX_SUMMARY.md` - Detailed explanation
- `CHANGELOG.md` - Version 3.4.0 changes
- `test_solver.html` - Simple test page

## 🎉 Result

The probability feature now works as intended! You'll always get actionable suggestions for your next move, even on complex boards with many unknowns.

