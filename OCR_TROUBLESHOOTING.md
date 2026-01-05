# OCR Troubleshooting Guide - v2.3+

**If you're getting wrong grid dimensions and only question marks, follow this guide step by step.**

---

## 🔧 Quick Fix Steps

### Step 1: Open Browser Console
Press `F12` to open developer tools, then click on "Console" tab. This will show you debugging information.

### Step 2: Check the Logs
When you click "Process Image", you should see:
```
Processing region: 300×400px
Grid detection result: 25×25px at offset (10, 10)
Calculated board: 16×16
```

### Step 3: Identify the Problem

**If you see:**
- `Grid lines not detected` → Grid detection failed
- `Edge detection result: 25×25px` → Using fallback (often wrong)
- Wrong dimensions → Cell size is incorrect

---

## 🎯 Solutions

### Solution 1: Use Manual Cell Size (Recommended!)

**This is the most reliable method:**

1. **Measure a cell** in your screenshot:
   - Zoom into your image (200-300%)
   - Count pixels for one cell (use crop tool to measure)
   - Typical sizes: 16px, 20px, 24px, 28px, 32px

2. **Enter cell size:**
   - In the OCR modal, find "Cell Size (px)" field
   - Enter the measured size (e.g., `28`)
   - Click "Process Image"

3. **Verify:**
   - Check console: `Using manual cell size: 28px`
   - Check dimensions match your board

**Example:**
- If your minesweeper board has 16×16 cells
- And crop region is 448×448 pixels
- Then cell size = 448/16 = 28px
- Enter `28` in cell size field

---

### Solution 2: Improve Crop

**Make crop as tight as possible:**

1. **Enable crop** (✂️ Toggle Crop button)
2. **Zoom** to 200-300%
3. **Align crop** precisely with grid:
   - Top edge should be at top of first row
   - Left edge should be at left of first column
   - Bottom edge at bottom of last row
   - Right edge at right of last column
4. **No extra space** - crop should be exactly the board grid
5. **Process again**

---

### Solution 3: Check Image Quality

**Requirements for good OCR:**

✅ **Good:**
- High resolution (cell size > 20px)
- Sharp screenshot (not photo of screen)
- Clear contrast between cells
- Visible grid lines
- Standard minesweeper colors

❌ **Bad:**
- Low resolution (cell size < 15px)
- Blurry or compressed image
- Photo of screen
- Custom themes with poor contrast
- No visible grid lines

---

### Solution 4: Manual Editing (Always Works!)

**If OCR keeps failing:**

1. Let it detect (even if wrong)
2. Check detected dimensions in result
3. **Manually edit the text**:
   ```
   Before (wrong):
   ????????
   ????????
   
   After (correct):
   ??1.....
   ??2.....
   ```
4. Fix dimensions if needed:
   - Add/remove rows
   - Add/remove columns
5. Apply to board

---

## 🐛 Common Issues & Fixes

### Issue 1: "8×8 board detected but mine is 16×16"

**Cause:** Cell size detected as 2× actual size

**Fix:**
- Measure actual cell size in pixels
- Divide detected size by 2
- Enter in "Cell Size" field
- Example: If it detects 56px cells, enter `28`

---

### Issue 2: "All question marks in output"

**Causes:**
1. Wrong cell size → Sampling wrong positions
2. Poor image quality → Can't distinguish cells
3. Unusual theme → Colors not recognized

**Fixes:**
1. Use correct manual cell size
2. Improve crop alignment
3. Use higher resolution image
4. Edit manually

---

### Issue 3: "Dimensions change each time I process"

**Cause:** Automatic detection is unreliable

**Fix:**
- **Always use manual cell size!**
- Measure once, use every time
- Much more consistent

---

### Issue 4: "Some cells detected, but many wrong"

**Expected Behavior:**
- 70-85% accuracy is normal
- Numbers: 50-70% accurate
- Always requires manual correction

**What to do:**
- Review each cell
- Correct mistakes
- This is faster than typing from scratch

---

## 📊 Understanding the Feedback

### Toast Notifications:

**"Detected 16×16 board: 145 unknown, 23 empty, 8 numbers, 0 flags"**
- ✅ Good: 16×16 is correct
- ⚠️ Warning: Too many unknowns (145/176 = 82%)
- 💡 Action: Review and correct manually

**"Mostly unknowns detected. Try..."**
- OCR confidence is low
- Follow the suggestions
- Or just edit manually

### Console Logs:

```
Processing region: 448×448px          ← Crop size
Using manual cell size: 28px          ← Manual mode
Calculated board: 16×16               ← Result
```

---

## 🎯 Best Practice Workflow

### Step-by-Step:

1. **Upload** your screenshot
2. **Toggle crop** on
3. **Zoom** to 200%
4. **Measure** one cell (count pixels)
5. **Enter** cell size manually
6. **Align crop** precisely
7. **Process** image
8. **Check console** for logs
9. **Review** output
10. **Correct** mistakes
11. **Apply** to board

### Typical Cell Sizes:

| Game | Cell Size |
|------|-----------|
| Classic Minesweeper | 16px |
| Windows Minesweeper | 24px |
| Minesweeper Online | 28-32px |
| Mobile Apps | 40-60px |

**Measure yours!** Don't guess.

---

## 🔬 Advanced Debugging

### Check Detection Quality:

Open Console (F12) and look for:

```javascript
// Good detection:
Grid detection result: 28×28px at offset (2, 2)
Calculated board: 16×16

// Poor detection:
Grid lines not detected, trying edge detection...
Edge detection result: 25×25px
Calculated board: 18×18  // Wrong!
```

### If Grid Detection Fails:

**Reasons:**
1. No visible grid lines in image
2. Grid lines too thin
3. Anti-aliasing makes lines fuzzy
4. Custom theme with no borders

**Solution:** Use manual cell size (always works!)

---

## 💡 Pro Tips

### Tip 1: Calculate Cell Size

If you know board dimensions:
```
Cell Size = Crop Width / Board Columns
Example: 448px / 16 cols = 28px
```

### Tip 2: Use Grid Lines

If you can see grid lines:
- Measure distance between two lines
- That's your cell size!

### Tip 3: Test with Easy Board

Start with:
- Simple screenshot
- Standard theme
- Good contrast
- Known dimensions

Once it works, try harder images.

### Tip 4: Keep Cell Size

Once you find the right size:
- Remember it
- Use same size for all screenshots from that game
- Much more consistent!

---

## ❓ FAQ

**Q: Why not 100% accurate?**  
A: This is color-based detection, not true OCR. Trade-off between speed/size and accuracy.

**Q: Should I always use manual cell size?**  
A: YES! It's the most reliable method.

**Q: Can I improve OCR accuracy?**  
A: Yes:
1. Use higher resolution screenshots
2. Ensure good contrast
3. Crop precisely
4. Use manual cell size

**Q: What if I don't know cell size?**  
A: Measure it:
1. Zoom into image 300%
2. Use crop tool to measure one cell
3. Count pixels width/height

**Q: Is manual editing faster?**  
A: Depends:
- For new board: OCR + corrections faster
- For small changes: Direct editing faster
- Try both, see what works for you

---

## 🆘 Still Not Working?

### Last Resort Options:

1. **Type manually** - Sometimes faster than troubleshooting
2. **Use different screenshot** - Try another source
3. **Simplify** - Start with smaller board
4. **Report issue** - Provide:
   - Screenshot (share it)
   - Console logs
   - What you tried

---

## ✅ Success Checklist

Before asking for help, verify:

- [ ] Used manual cell size
- [ ] Cropped precisely
- [ ] Zoomed to 200%+
- [ ] Checked console logs
- [ ] Tried different crop
- [ ] Verified image quality
- [ ] Measured cell size correctly
- [ ] Reviewed output before applying

If all checked and still failing → The image may not be suitable for OCR.

---

## 📝 Example: Complete Workflow

### Scenario: 16×16 Expert Board

1. Take screenshot → 1920×1080px
2. Open OCR modal → Upload
3. Toggle crop → On
4. Zoom → 200%
5. Position crop → 448×448px region
6. Measure cell → 448/16 = 28px
7. Enter "28" in Cell Size field
8. Process Image
9. Console shows:
   ```
   Processing region: 448×448px
   Using manual cell size: 28px
   Calculated board: 16×16
   ```
10. Review output:
    ```
    ??1........
    ??2........
    ?321.......
    ...
    ```
11. Correct errors (few numbers wrong)
12. Apply to board ✅

**Result:** 95% accuracy, 1 minute total time!

---

**Remember:** Manual cell size + tight crop = Best results! 🎯

