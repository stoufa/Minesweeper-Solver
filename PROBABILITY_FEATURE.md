# Probability-Based Move Suggestions

## Overview

When solving a Minesweeper board, sometimes there are no cells that are guaranteed to be safe or mines. In such cases, the solver now computes **probability scores** for each uncertain cell and suggests the safest move.

## How It Works

### 1. Configuration Generation
The solver generates all possible valid configurations of the board that satisfy the constraints (number clues).

### 2. Probability Calculation
For each uncertain cell, the solver:
- Counts how many configurations have that cell as a mine
- Divides by the total number of configurations
- Result: probability that the cell contains a mine (0.0 = definitely safe, 1.0 = definitely a mine)

### 3. Best Move Suggestion
The solver identifies the cell with the **lowest mine probability** (highest safety) and displays:
- **Best guess**: The safest cell with its exact coordinates
- **Mine risk**: Percentage chance of hitting a mine
- **Safe chance**: Percentage chance of being safe
- **Top 5 safest cells**: A table showing the 5 best options

## Example Output

When no certain moves are available, you'll see:

```
💡 No certain moves available!
Best guess: Cell (5, 3) - 87.5% chance of being safe (12.5% mine risk)

Top 5 Safest Cells:
┌──────────────┬─────────┬─────────┐
│ Cell (r, c)  │ Mine %  │ Safe %  │
├──────────────┼─────────┼─────────┤
│ (5, 3)       │  12.5%  │  87.5%  │ ← Highlighted in green
│ (7, 2)       │  25.0%  │  75.0%  │
│ (4, 8)       │  33.3%  │  66.7%  │
│ (6, 1)       │  40.0%  │  60.0%  │
│ (3, 9)       │  50.0%  │  50.0%  │
└──────────────┴─────────┴─────────┘
```

## When Is This Feature Triggered?

The probability suggestion appears when:
1. ✅ The board has been solved
2. ✅ Valid configurations were found
3. ✅ **No cells are marked as certain** (all uncertain cells marked with `#`)

If there are any cells marked as `o` (definitely safe) or `x` (definitely mine), those should be acted upon first, and the probability suggestion will be hidden.

## Interpretation

- **0-20% mine risk**: Very safe bet - go for it!
- **20-40% mine risk**: Relatively safe - good option
- **40-60% mine risk**: Coin flip territory - proceed with caution
- **60-80% mine risk**: Risky - avoid if better options exist
- **80-100% mine risk**: Very dangerous - last resort

## Technical Details

- **Algorithm**: Brute force for small boards (≤10 uncertain cells), random sampling for larger boards
- **Max configurations**: Limited to 1024 for performance
- **Accuracy**: 100% accurate for small boards, statistical approximation for large boards
- **Performance**: Typically completes in <1 second for most boards

## Usage Tips

1. **Always check the output board first** - look for cells marked as `o` (safe) or `x` (mine)
2. **Use probability when stuck** - when the output only shows `#` (uncertain cells)
3. **Compare the top 5** - sometimes multiple cells have similar probabilities
4. **Consider the risk** - if all probabilities are high (>40%), you might be in a guess-required situation

## Limitations

- For very large boards with many uncertain cells, the solver uses random sampling which may not explore all configurations
- Probabilities assume all configurations are equally likely (which may not reflect the actual mine distribution)
- Edge cases with complex constraint patterns may have reduced accuracy

## Future Enhancements

Potential improvements:
- Visual heatmap overlay on the board showing probabilities
- Weight configurations by likelihood based on remaining mine count
- Advanced pattern recognition for common Minesweeper scenarios
- Export probability data for external analysis

---

**Version**: 3.3.0  
**Last Updated**: January 12, 2026

