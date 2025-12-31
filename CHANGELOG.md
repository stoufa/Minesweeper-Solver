# Changelog

## [1.0.1] - 2025-12-31

### Fixed
- **Editor Tab Drawing Bug**: Fixed issue where drawing would continue after releasing mouse button
  - Added `onmouseup` event handler to individual cells
  - Now properly stops drawing when mouse button is released
  - Matches behavior of original `minesweeper-editor.html`

### Details
The Editor tab was missing the `cellEl.onmouseup` handler that stops the drawing state when the mouse button is released over a cell. While there was a global document-level `mouseup` listener, adding the handler to individual cells provides more reliable behavior, especially when the mouse is released directly over a cell.

**File Changed:**
- `minesweeper-solver.js` - Added mouseup handler in `renderEditorBoard()` function

---

## [1.0.0] - 2025-12-31

### Added
- Complete project documentation (9 markdown files)
  - START_HERE.md - Quick orientation guide
  - INDEX.md - Master documentation index
  - QUICKSTART.md - 5-minute tutorial
  - README.md - Complete project overview
  - WEBAPP.md - Web application manual
  - TECHNICAL.md - Algorithm deep-dive
  - API.md - Programming API reference
  - PROJECT_SUMMARY.md - What was created
  - COMPLETION_REPORT.md - Final completion report

- All-in-one web application
  - minesweeper-solver.html - Main interface
  - minesweeper-solver.js - Application logic
  - 4 integrated tabs (Editor, Solver, Viewer, History)
  - Visual board editor with click-and-drag
  - One-click solver with statistics
  - Color-coded viewer with emoji
  - Game history tracking with export

### Features
- ✅ No installation required
- ✅ Works completely offline
- ✅ LocalStorage persistence
- ✅ Import/Export functionality
- ✅ Beautiful gradient design
- ✅ Responsive layout
- ✅ Comprehensive documentation
- ✅ Production-ready code

### Technical
- Total documentation: 2,785+ lines
- Total web app code: 1,400+ lines
- Solver uses simplified cluster-based algorithm
- Supports boards up to 30x30
- Optimized for outline sizes up to 15 cells

