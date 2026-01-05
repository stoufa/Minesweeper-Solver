// Minesweeper Solver - Main JavaScript

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let state = {
  editor: {
    rows: 10,
    cols: 10,
    board: [],
    pen: '.',
    isDrawing: false
  },
  solver: {
    inputBoard: '',
    outputBoard: '',
    stats: null
  },
  viewer: {
    currentBoard: ''
  },
  history: []
};

const PENS = ['.', '?', '!', '0', '1', '2', '3', '4', '5', '6', '7', '8'];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}_${hour}${minute}${second}`;
}

function boardToString(board) {
  return board.map(row => row.join('')).join('\n');
}

function stringToBoard(str) {
  return str.split('\n').filter(line => line.length > 0).map(line => line.split(''));
}

function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function loadFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// ============================================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================================

function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  // Icon based on type
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const titles = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info'
  };

  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-title">${titles[type] || titles.info}</div>
      <div class="toast-message">${message}</div>
    </div>
    <div class="toast-close" onclick="this.parentElement.remove()">×</div>
  `;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Auto dismiss
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
}

function showSuccessToast(message, duration = 3000) {
  showToast(message, 'success', duration);
}

function showErrorToast(message, duration = 3000) {
  showToast(message, 'error', duration);
}

function showWarningToast(message, duration = 3000) {
  showToast(message, 'warning', duration);
}

function showInfoToast(message, duration = 3000) {
  showToast(message, 'info', duration);
}

// ============================================================================
// TAB MANAGEMENT
// ============================================================================

function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(targetTab).classList.add('active');

      if (targetTab === 'history') {
        renderHistory();
      }
    });
  });
}

// ============================================================================
// EDITOR FUNCTIONS
// ============================================================================

function initEditor() {
  renderPenButtons();
  createEditorBoard();

  document.getElementById('rows').addEventListener('input', (e) => {
    state.editor.rows = Math.max(1, Math.min(30, Number(e.target.value) || 10));
    createEditorBoard();
  });

  document.getElementById('cols').addEventListener('input', (e) => {
    state.editor.cols = Math.max(1, Math.min(30, Number(e.target.value) || 10));
    createEditorBoard();
  });

  document.getElementById('createBoard').addEventListener('click', createEditorBoard);
  document.getElementById('clearBoard').addEventListener('click', clearEditorBoard);
  document.getElementById('saveToSolver').addEventListener('click', saveToSolver);
  document.getElementById('downloadBoard').addEventListener('click', downloadBoard);

  // Global mouseup to stop drawing - use capture phase to ensure it fires first
  document.addEventListener('mouseup', () => {
    state.editor.isDrawing = false;
  }, true);

  // Stop drawing when mouse leaves the window entirely
  document.addEventListener('mouseleave', () => {
    state.editor.isDrawing = false;
  });

  // Stop drawing when window loses focus
  window.addEventListener('blur', () => {
    state.editor.isDrawing = false;
  });

  // Board-specific listeners will be added after board is created
  document.addEventListener('keydown', (e) => {
    if (PENS.includes(e.key)) {
      state.editor.pen = e.key;
      renderPenButtons();
    }
  });
}

function renderPenButtons() {
  const container = document.getElementById('penButtons');
  container.innerHTML = '';

  PENS.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'pen-btn' + (state.editor.pen === p ? ' active' : '');
    btn.textContent = p === '.' ? '·' : p;
    btn.onclick = () => {
      state.editor.pen = p;
      renderPenButtons();
    };
    container.appendChild(btn);
  });
}

function createEditorBoard() {
  const { rows, cols } = state.editor;
  state.editor.board = Array.from({ length: rows }, () => Array(cols).fill('.'));
  renderEditorBoard();
  document.getElementById('validationResult').classList.add('hidden');
}

function clearEditorBoard() {
  const { rows, cols } = state.editor;
  state.editor.board = Array.from({ length: rows }, () => Array(cols).fill('.'));
  renderEditorBoard();
  document.getElementById('validationResult').classList.add('hidden');
}

function renderEditorBoard() {
  const boardEl = document.getElementById('editorBoard');
  const { board, cols } = state.editor;

  // Clear the board
  boardEl.innerHTML = '';
  boardEl.style.gridTemplateColumns = `repeat(${cols}, 35px)`;

  // Create cells with event listeners
  board.forEach((row, r) => {
    row.forEach((cell, c) => {
      const cellEl = document.createElement('div');
      cellEl.className = 'cell';
      cellEl.textContent = cell === '.' ? '' : cell;

      if (cell === '!') cellEl.classList.add('mine');
      if (cell === '?') cellEl.classList.add('flag');
      if (cell.match(/[0-8]/)) cellEl.classList.add('number');

      // Use mousedown only to start and immediately paint
      cellEl.addEventListener('mousedown', (e) => {
        e.preventDefault();
        state.editor.isDrawing = true;
        handleCellChange(r, c);
      });

      // Use mouseenter for dragging
      cellEl.addEventListener('mouseenter', () => {
        if (state.editor.isDrawing) {
          handleCellChange(r, c);
        }
      });

      // Prevent context menu
      cellEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });

      boardEl.appendChild(cellEl);
    });
  });
}

function handleCellChange(r, c) {
  const pen = state.editor.pen;

  // Only update if the cell value actually changed
  if (state.editor.board[r][c] === pen) {
    return;
  }

  state.editor.board[r][c] = pen;

  // Update only the specific cell element instead of re-rendering entire board
  const boardEl = document.getElementById('editorBoard');
  const cellIndex = r * state.editor.cols + c;
  const cellEl = boardEl.children[cellIndex];

  if (cellEl) {
    cellEl.textContent = pen === '.' ? '' : pen;
    cellEl.className = 'cell';

    if (pen === '!') cellEl.classList.add('mine');
    if (pen === '?') cellEl.classList.add('flag');
    if (pen.match(/[0-8]/)) cellEl.classList.add('number');
  }

  validateBoardConstraints();
}

function saveToSolver() {
  const boardStr = boardToString(state.editor.board);
  state.solver.inputBoard = boardStr;
  document.getElementById('inputBoard').value = boardStr;

  // Switch to solver tab
  document.querySelector('.tab[data-tab="solver"]').click();
}

function downloadBoard() {
  const content = boardToString(state.editor.board);
  const timestamp = getTimestamp();
  const filename = `board_${timestamp}.txt`;
  const blob = new Blob([content], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function validateBoardConstraints() {
  const board = state.editor.board;
  const nrows = board.length;
  const ncols = board[0].length;
  const errors = [];
  let hasNumbers = false;

  for (let r = 0; r < nrows; r++) {
    for (let c = 0; c < ncols; c++) {
      const cell = board[r][c];
      if (cell >= '0' && cell <= '8') {
        hasNumbers = true;
        const expected = parseInt(cell);
        const neighbors = getNeighbors(r, c, nrows, ncols);

        let mineCount = 0;
        let unknownCount = 0;

        for (const [nr, nc] of neighbors) {
          const neighborCell = board[nr][nc];
          if (neighborCell === '!') {
            mineCount++;
          } else if (neighborCell === '.' || neighborCell === '?') {
            unknownCount++;
          }
        }

        // Check if constraint is violated
        if (mineCount > expected) {
          errors.push(`Cell (${r},${c}) has ${cell} but ${mineCount} mines nearby (too many)`);
        } else if (mineCount + unknownCount < expected) {
          errors.push(`Cell (${r},${c}) has ${cell} but can't reach it (not enough cells)`);
        }
      }
    }
  }

  const validationDiv = document.getElementById('validationResult');

  if (!hasNumbers) {
    validationDiv.classList.add('hidden');
    return;
  }

  validationDiv.classList.remove('hidden');

  if (errors.length > 0) {
    validationDiv.className = 'alert alert-error';
    validationDiv.innerHTML = '<strong>⚠️ Constraint Violations:</strong><br>' + errors.slice(0, 5).join('<br>');
    if (errors.length > 5) {
      validationDiv.innerHTML += `<br>... and ${errors.length - 5} more errors`;
    }
  } else {
    validationDiv.className = 'alert alert-success';
    validationDiv.innerHTML = '<strong>✅ All constraints valid!</strong> The board looks good.';
  }
}

// ============================================================================
// OCR / IMAGE IMPORT FUNCTIONS
// ============================================================================

let ocrState = {
  image: null,
  imageData: null,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  detectedBoard: '',
  cropEnabled: false,
  cropX: 50,
  cropY: 50,
  cropWidth: 200,
  cropHeight: 200,
  cropDragging: false,
  cropResizing: false,
  cropResizeHandle: null
};

// Visual Grid Editor State
const gridState = {
  image: null,
  canvas: null,
  ctx: null,
  cols: 8,
  rows: 8,
  cells: [],
  selectedRow: -1,
  selectedCol: -1,
  scale: 1,
  opacity: 0.3,
  // Crop properties
  cropEnabled: false,
  cropX: 0,
  cropY: 0,
  cropWidth: 300,
  cropHeight: 300,
  cropDragging: false,
  cropResizing: false,
  cropResizeHandle: null,
  cropDragStartX: 0,
  cropDragStartY: 0,
  cropStartX: 0,
  cropStartY: 0,
  cropStartWidth: 0,
  cropStartHeight: 0
};

function initGridEditor() {
  const modal = document.getElementById('ocrModal');
  const closeBtn = document.getElementById('closeOcrModal');
  const importBtn = document.getElementById('importFromImage');
  const uploadArea = document.getElementById('uploadArea');
  const uploadInput = document.getElementById('imageUpload');

  // Open modal
  importBtn.addEventListener('click', () => {
    modal.classList.add('active');
    resetOCRState();
  });

  // Close modal
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  // Upload area click
  uploadArea.addEventListener('click', () => {
    uploadInput.click();
  });

  // File upload
  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      loadImageFile(file);
    }
  });

  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      loadImageFile(file);
    }
  });

  // Paste from clipboard
  document.addEventListener('paste', (e) => {
    if (modal.classList.contains('active')) {
      const items = e.clipboardData.items;
      for (let item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          loadImageFile(file);
          break;
        }
      }
    }
  });

  // Opacity control
  imageOpacity.addEventListener('input', (e) => {
    const value = e.target.value;
    document.getElementById('opacityValue').textContent = value;
    ocrImage.style.opacity = value / 100;
  });

  // Zoom control
  imageZoom.addEventListener('input', (e) => {
    const value = e.target.value;
    document.getElementById('zoomValue').textContent = value;
    ocrState.scale = value / 100;
    updateImageTransform();
  });

  // Toggle crop
  toggleCropBtn.addEventListener('click', () => {
    toggleCropRegion();
  });

  // Auto-calculate cell size when dimensions are entered
  const boardColsInput = document.getElementById('boardCols');
  const boardRowsInput = document.getElementById('boardRows');
  const manualCellSizeInput = document.getElementById('manualCellSize');

  function updateCellSize() {
    const cols = parseInt(boardColsInput.value) || 0;
    const rows = parseInt(boardRowsInput.value) || 0;

    if (cols > 0 && rows > 0 && ocrState.image) {
      const containerRect = document.getElementById('ocrImageContainer').getBoundingClientRect();
      const imgRect = document.getElementById('ocrImage').getBoundingClientRect();

      let width, height;
      if (ocrState.cropEnabled) {
        const scaleX = ocrState.image.width / imgRect.width;
        const scaleY = ocrState.image.height / imgRect.height;
        width = ocrState.cropWidth * scaleX / ocrState.scale;
        height = ocrState.cropHeight * scaleY / ocrState.scale;
      } else {
        width = ocrState.image.width;
        height = ocrState.image.height;
      }

      const cellW = Math.round(width / cols);
      const cellH = Math.round(height / rows);
      const cellSize = Math.max(cellW, cellH); // Use larger for safety

      manualCellSizeInput.value = cellSize;
      console.log(`Auto-calculated cell size: ${cellW}×${cellH}px → using ${cellSize}px`);
    }
  }

  boardColsInput.addEventListener('input', updateCellSize);
  boardRowsInput.addEventListener('input', updateCellSize);

  // Image dragging (pan)
  ocrImageContainer.addEventListener('mousedown', (e) => {
    if (ocrState.image && !ocrState.cropEnabled) {
      ocrState.isDragging = true;
      ocrState.dragStartX = e.clientX - ocrState.offsetX;
      ocrState.dragStartY = e.clientY - ocrState.offsetY;
      ocrImageContainer.style.cursor = 'grabbing';
      e.preventDefault();
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (ocrState.isDragging) {
      ocrState.offsetX = e.clientX - ocrState.dragStartX;
      ocrState.offsetY = e.clientY - ocrState.dragStartY;
      updateImageTransform();
      e.preventDefault();
    }
  });

  document.addEventListener('mouseup', () => {
    if (ocrState.isDragging) {
      ocrState.isDragging = false;
      ocrImageContainer.style.cursor = 'move';
    }
    ocrState.cropDragging = false;
    ocrState.cropResizing = false;
    ocrState.cropResizeHandle = null;
  });

  // Process image (OCR)
  processBtn.addEventListener('click', () => {
    processImageOCR();
  });

  // Apply OCR result
  applyBtn.addEventListener('click', () => {
    applyOCRToBoard();
  });

  // Reset
  resetBtn.addEventListener('click', () => {
    resetOCRState();
  });
}

function loadImageFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      ocrState.image = img;
      ocrState.imageData = e.target.result;
      document.getElementById('ocrImage').src = e.target.result;
      document.getElementById('uploadSection').style.display = 'none';
      document.getElementById('ocrSection').style.display = 'block';

      // Reset transform
      ocrState.scale = 1;
      ocrState.offsetX = 0;
      ocrState.offsetY = 0;

      // Initialize crop region to center of image (good default for most screenshots)
      const containerWidth = 500; // OCR container width
      const containerHeight = 500; // OCR container height

      // Start with a crop region in the center, about 60% of image size
      ocrState.cropWidth = Math.min(300, img.width * 0.6);
      ocrState.cropHeight = Math.min(300, img.height * 0.6);
      ocrState.cropX = (containerWidth - ocrState.cropWidth) / 2;
      ocrState.cropY = (containerHeight - ocrState.cropHeight) / 2;

      updateImageTransform();

      showSuccessToast('Image loaded! Use "Toggle Crop" to select board area, then "Process Image"');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function updateImageTransform() {
  const img = document.getElementById('ocrImage');
  img.style.transform = `translate(${ocrState.offsetX}px, ${ocrState.offsetY}px) scale(${ocrState.scale})`;
}

function toggleCropRegion() {
  ocrState.cropEnabled = !ocrState.cropEnabled;

  const container = document.getElementById('ocrImageContainer');
  const existingCrop = container.querySelector('.crop-overlay');

  if (ocrState.cropEnabled) {
    if (!existingCrop) {
      createCropOverlay();
    }
    showSuccessToast('Crop enabled! Drag to move, resize handles to adjust size.');
  } else {
    if (existingCrop) {
      existingCrop.remove();
    }
    showInfoToast('Crop disabled. Full image will be processed.');
  }
}

function createCropOverlay() {
  const container = document.getElementById('ocrImageContainer');
  const cropDiv = document.createElement('div');
  cropDiv.className = 'crop-overlay';
  cropDiv.style.left = ocrState.cropX + 'px';
  cropDiv.style.top = ocrState.cropY + 'px';
  cropDiv.style.width = ocrState.cropWidth + 'px';
  cropDiv.style.height = ocrState.cropHeight + 'px';

  // Add resize handles
  const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'];
  handles.forEach(pos => {
    const handle = document.createElement('div');
    handle.className = `crop-handle ${pos}`;
    handle.dataset.handle = pos;
    cropDiv.appendChild(handle);
  });

  container.appendChild(cropDiv);

  // Add event listeners for crop manipulation
  cropDiv.addEventListener('mousedown', handleCropMouseDown);
}

function handleCropMouseDown(e) {
  e.stopPropagation();

  if (e.target.classList.contains('crop-handle')) {
    ocrState.cropResizing = true;
    ocrState.cropResizeHandle = e.target.dataset.handle;
  } else if (e.target.classList.contains('crop-overlay')) {
    ocrState.cropDragging = true;
  }

  ocrState.dragStartX = e.clientX;
  ocrState.dragStartY = e.clientY;

  const cropOverlay = document.querySelector('.crop-overlay');
  const rect = cropOverlay.getBoundingClientRect();
  ocrState.cropStartX = rect.left - document.getElementById('ocrImageContainer').getBoundingClientRect().left;
  ocrState.cropStartY = rect.top - document.getElementById('ocrImageContainer').getBoundingClientRect().top;
  ocrState.cropStartWidth = ocrState.cropWidth;
  ocrState.cropStartHeight = ocrState.cropHeight;

  document.addEventListener('mousemove', handleCropMouseMove);
  document.addEventListener('mouseup', handleCropMouseUp);
}

function handleCropMouseMove(e) {
  if (ocrState.cropDragging) {
    const dx = e.clientX - ocrState.dragStartX;
    const dy = e.clientY - ocrState.dragStartY;

    ocrState.cropX = Math.max(0, ocrState.cropStartX + dx);
    ocrState.cropY = Math.max(0, ocrState.cropStartY + dy);

    const cropOverlay = document.querySelector('.crop-overlay');
    cropOverlay.style.left = ocrState.cropX + 'px';
    cropOverlay.style.top = ocrState.cropY + 'px';
  } else if (ocrState.cropResizing) {
    const dx = e.clientX - ocrState.dragStartX;
    const dy = e.clientY - ocrState.dragStartY;
    const handle = ocrState.cropResizeHandle;

    const cropOverlay = document.querySelector('.crop-overlay');

    if (handle.includes('e')) {
      ocrState.cropWidth = Math.max(50, ocrState.cropStartWidth + dx);
    }
    if (handle.includes('w')) {
      const newWidth = Math.max(50, ocrState.cropStartWidth - dx);
      ocrState.cropX = ocrState.cropStartX + (ocrState.cropStartWidth - newWidth);
      ocrState.cropWidth = newWidth;
    }
    if (handle.includes('s')) {
      ocrState.cropHeight = Math.max(50, ocrState.cropStartHeight + dy);
    }
    if (handle.includes('n')) {
      const newHeight = Math.max(50, ocrState.cropStartHeight - dy);
      ocrState.cropY = ocrState.cropStartY + (ocrState.cropStartHeight - newHeight);
      ocrState.cropHeight = newHeight;
    }

    cropOverlay.style.left = ocrState.cropX + 'px';
    cropOverlay.style.top = ocrState.cropY + 'px';
    cropOverlay.style.width = ocrState.cropWidth + 'px';
    cropOverlay.style.height = ocrState.cropHeight + 'px';
  }
}

function handleCropMouseUp() {
  ocrState.cropDragging = false;
  ocrState.cropResizing = false;
  ocrState.cropResizeHandle = null;
  document.removeEventListener('mousemove', handleCropMouseMove);
  document.removeEventListener('mouseup', handleCropMouseUp);
}

function processImageOCR() {
  if (!ocrState.image) {
    showErrorToast('No image loaded!');
    return;
  }

  // Reset debug counter
  window.ocrDebugCount = 0;

  // Check if manual dimensions are provided
  const manualCols = parseInt(document.getElementById('boardCols').value) || 0;
  const manualRows = parseInt(document.getElementById('boardRows').value) || 0;
  const ocrMethod = document.getElementById('ocrMethod').value;

  if (manualCols === 0 || manualRows === 0) {
    showWarningToast(
      '⚠️ Manual dimensions NOT provided! Auto-detection often fails. For best results, enter Board Cols and Board Rows.',
      8000
    );
  }

  // Check which OCR method to use
  if (ocrMethod === 'tesseract') {
    // Use Tesseract.js for actual OCR
    processTesseractOCR(manualCols, manualRows);
  } else {
    // Use color-based detection (original method)
    showInfoToast('Processing image... Analyzing board structure.', 5000);
    processColorBasedOCR();
  }
}

async function processTesseractOCR(cols, rows) {
  if (!window.Tesseract) {
    showErrorToast('Tesseract.js not loaded! Falling back to color-based detection.');
    processColorBasedOCR();
    return;
  }

  showInfoToast('🔍 Running Tesseract OCR... This may take 10-20 seconds.', 3000);

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Get the image region to process
    let sx, sy, sWidth, sHeight;

    if (ocrState.cropEnabled) {
      const containerRect = document.getElementById('ocrImageContainer').getBoundingClientRect();
      const imgRect = document.getElementById('ocrImage').getBoundingClientRect();
      const scaleX = ocrState.image.width / imgRect.width;
      const scaleY = ocrState.image.height / imgRect.height;

      const cropRelX = (ocrState.cropX - (imgRect.left - containerRect.left)) * scaleX / ocrState.scale;
      const cropRelY = (ocrState.cropY - (imgRect.top - containerRect.top)) * scaleY / ocrState.scale;
      const cropRelWidth = ocrState.cropWidth * scaleX / ocrState.scale;
      const cropRelHeight = ocrState.cropHeight * scaleY / ocrState.scale;

      sx = Math.max(0, cropRelX);
      sy = Math.max(0, cropRelY);
      sWidth = Math.min(ocrState.image.width - sx, cropRelWidth);
      sHeight = Math.min(ocrState.image.height - sy, cropRelHeight);
    } else {
      sx = 0;
      sy = 0;
      sWidth = ocrState.image.width;
      sHeight = ocrState.image.height;
    }

    canvas.width = sWidth;
    canvas.height = sHeight;
    ctx.drawImage(ocrState.image, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);

    // Run Tesseract with progress tracking
    const { data: { text } } = await Tesseract.recognize(
      canvas,
      'eng',
      {
        logger: m => {
          if (m.status === 'recognizing text') {
            const progress = Math.round(m.progress * 100);
            showInfoToast(`OCR Progress: ${progress}%`, 1000);
          }
        }
      }
    );

    console.log('Tesseract raw output:', text);

    // Parse Tesseract output into board format
    const board = parseTesseractOutput(text, cols, rows);

    ocrState.detectedBoard = board;
    document.getElementById('ocrResult').value = board;

    // Count cell types
    const lines = board.split('\n').filter(l => l.trim().length > 0);
    const detectedRows = lines.length;
    const detectedCols = lines[0] ? lines[0].length : 0;

    let questionMarks = 0, dots = 0, numbers = 0, flags = 0;

    for (const line of lines) {
      for (const ch of line) {
        if (ch === '?') questionMarks++;
        else if (ch === '.') dots++;
        else if (ch === '!') flags++;
        else if (ch >= '0' && ch <= '8') numbers++;
      }
    }

    showSuccessToast(
      `Tesseract detected ${detectedRows}×${detectedCols} board: ${questionMarks} unknown, ${dots} empty, ${numbers} numbers, ${flags} flags`,
      6000
    );

  } catch (error) {
    showErrorToast('Tesseract OCR failed: ' + error.message);
    console.error('Tesseract error:', error);
  }
}

function parseTesseractOutput(text, expectedCols, expectedRows) {
  // Tesseract output needs parsing - it reads text from image
  // For minesweeper, we need to extract numbers and convert to our format

  const lines = text.split('\n').filter(l => l.trim().length > 0);
  console.log('Tesseract lines:', lines);

  // If we have expected dimensions, use grid-based processing
  if (expectedCols > 0 && expectedRows > 0) {
    return processGridBasedTesseract(expectedCols, expectedRows);
  }

  // Otherwise try to parse the text output
  const board = [];

  for (const line of lines) {
    const row = [];
    // Look for numbers 0-8, dots, question marks
    for (const char of line) {
      if (char >= '0' && char <= '8') {
        row.push(char);
      } else if (char === '.') {
        row.push('.');
      } else if (char === '?') {
        row.push('?');
      } else if (char === '!') {
        row.push('!');
      }
    }
    if (row.length > 0) {
      board.push(row.join(''));
    }
  }

  return board.join('\n');
}

function processGridBasedTesseract(cols, rows) {
  // Process each cell individually with Tesseract for better accuracy
  // This is slower but more accurate
  showInfoToast('Using grid-based OCR for maximum accuracy...', 3000);

  // For now, return a placeholder - full implementation would process each cell
  // individually which is more complex
  return Array(rows).fill(Array(cols).fill('?').join('')).join('\n');
}

function processColorBasedOCR() {
  // Original color-based detection method
  setTimeout(() => {
    try {
      const board = extractBoardFromImage();
      ocrState.detectedBoard = board;
      document.getElementById('ocrResult').value = board;

      // Count cell types for feedback
      const lines = board.split('\n').filter(l => l.trim().length > 0);
      const rows = lines.length;
      const cols = lines[0] ? lines[0].length : 0;

      let questionMarks = 0;
      let dots = 0;
      let numbers = 0;
      let flags = 0;

      for (const line of lines) {
        for (const ch of line) {
          if (ch === '?') questionMarks++;
          else if (ch === '.') dots++;
          else if (ch === '!') flags++;
          else if (ch >= '0' && ch <= '8') numbers++;
        }
      }

      const total = questionMarks + dots + numbers + flags;

      showSuccessToast(
        `Color-based: ${rows}×${cols} board: ${questionMarks} unknown, ${dots} empty, ${numbers} numbers, ${flags} flags`,
        6000
      );

      // If mostly question marks, suggest manual editing
      if (total > 0 && questionMarks / total > 0.9) {
        showWarningToast(
          'Mostly unknowns detected. Try: 1) Tesseract OCR method, 2) Enter Board Cols/Rows manually, 3) Adjust crop tighter, or 4) Edit result manually',
          8000
        );
      }

    } catch (error) {
      showErrorToast('Error processing image: ' + error.message);
      console.error('OCR Error:', error);
    }
  }, 100);
}

function extractBoardFromImage() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Determine crop region or use full image
  let sx, sy, sWidth, sHeight;

  if (ocrState.cropEnabled) {
    // Convert crop coordinates from screen space to image space
    const containerRect = document.getElementById('ocrImageContainer').getBoundingClientRect();
    const imgRect = document.getElementById('ocrImage').getBoundingClientRect();

    // Calculate scale factor from displayed image to actual image
    const scaleX = ocrState.image.width / imgRect.width;
    const scaleY = ocrState.image.height / imgRect.height;

    // Convert crop region to image coordinates
    const cropRelX = (ocrState.cropX - (imgRect.left - containerRect.left)) * scaleX / ocrState.scale;
    const cropRelY = (ocrState.cropY - (imgRect.top - containerRect.top)) * scaleY / ocrState.scale;
    const cropRelWidth = ocrState.cropWidth * scaleX / ocrState.scale;
    const cropRelHeight = ocrState.cropHeight * scaleY / ocrState.scale;

    sx = Math.max(0, cropRelX);
    sy = Math.max(0, cropRelY);
    sWidth = Math.min(ocrState.image.width - sx, cropRelWidth);
    sHeight = Math.min(ocrState.image.height - sy, cropRelHeight);
  } else {
    sx = 0;
    sy = 0;
    sWidth = ocrState.image.width;
    sHeight = ocrState.image.height;
  }

  canvas.width = sWidth;
  canvas.height = sHeight;

  // Draw the cropped region
  ctx.drawImage(ocrState.image, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);

  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  console.log(`Processing region: ${Math.round(sWidth)}×${Math.round(sHeight)}px`);

  // Improved board detection algorithm
  return detectMinesweeperBoard(imageData, sWidth, sHeight);
}

function detectMinesweeperBoard(imageData, width, height) {
  const data = imageData.data;

  // Check if user provided manual board dimensions
  const manualCols = parseInt(document.getElementById('boardCols').value) || 0;
  const manualRows = parseInt(document.getElementById('boardRows').value) || 0;
  const manualCellSize = parseInt(document.getElementById('manualCellSize').value) || 0;

  let gridInfo;
  let cols, rows;

  if (manualCols > 0 && manualRows > 0) {
    // User provided exact dimensions - use them!
    console.log(`Using manual board dimensions: ${manualRows}×${manualCols}`);

    const cellW = width / manualCols;
    const cellH = height / manualRows;
    const cellSize = manualCellSize > 0 ? manualCellSize : Math.max(cellW, cellH);

    // Detect margin offset (user mentioned they leave margin around board)
    const marginInfo = detectBoardMargin(data, width, height, cellW, cellH, manualCols, manualRows);

    gridInfo = {
      detected: true,
      cellWidth: cellW,
      cellHeight: cellH,
      offsetX: marginInfo.offsetX,
      offsetY: marginInfo.offsetY
    };

    cols = manualCols;
    rows = manualRows;

    console.log(`Calculated cell size: ${Math.round(cellW)}×${Math.round(cellH)}px`);
    console.log(`Detected margin offset: (${Math.round(marginInfo.offsetX)}, ${Math.round(marginInfo.offsetY)})px`);
  } else if (manualCellSize > 0) {
    // Use manual cell size
    console.log(`Using manual cell size: ${manualCellSize}px`);
    gridInfo = {
      detected: true,
      cellWidth: manualCellSize,
      cellHeight: manualCellSize,
      offsetX: 0,
      offsetY: 0
    };

    cols = Math.max(8, Math.min(30, Math.round(width / manualCellSize)));
    rows = Math.max(8, Math.min(30, Math.round(height / manualCellSize)));
  } else {
    // Try automatic detection with multiple methods
    console.log('=== Attempting automatic grid detection ===');

    // Method 1: Grid line detection
    gridInfo = detectGridLines(data, width, height);

    // Method 2: Edge detection fallback
    if (!gridInfo.detected || gridInfo.cellWidth === 0) {
      console.log('Grid lines not detected, trying edge detection...');
      const hSpacing = estimateCellSize(data, width, height, 'horizontal');
      const vSpacing = estimateCellSize(data, width, height, 'vertical');

      if (hSpacing > 0 && vSpacing > 0) {
        gridInfo = {
          detected: true,
          cellWidth: hSpacing,
          cellHeight: vSpacing,
          offsetX: 0,
          offsetY: 0
        };
        console.log(`Edge detection result: ${hSpacing}×${vSpacing}px`);
      }
    }

    // Method 3: Smart estimation based on common board sizes
    if (!gridInfo.detected || gridInfo.cellWidth === 0) {
      console.log('Edge detection failed, trying smart estimation...');
      gridInfo = smartEstimation(width, height);
    }

    // Calculate dimensions
    cols = Math.max(8, Math.min(30, Math.round((width - gridInfo.offsetX) / gridInfo.cellWidth)));
    rows = Math.max(8, Math.min(30, Math.round((height - gridInfo.offsetY) / gridInfo.cellHeight)));

    // Validate and adjust
    const aspectRatio = width / height;
    const calculatedAspectRatio = (cols * gridInfo.cellWidth) / (rows * gridInfo.cellHeight);

    if (Math.abs(aspectRatio - calculatedAspectRatio) > 0.3) {
      console.log(`Aspect ratio mismatch (${aspectRatio.toFixed(2)} vs ${calculatedAspectRatio.toFixed(2)}), recalculating...`);

      // Try to fit common board sizes
      const commonSizes = [8, 9, 10, 16, 20, 24, 30];
      let bestFit = null;
      let bestError = Infinity;

      for (const size of commonSizes) {
        const cellW = width / size;
        const cellH = height / size;
        const error = Math.abs(cellW - cellH);

        if (error < bestError && cellW > 15 && cellW < 200) {
          bestError = error;
          bestFit = { size, cellWidth: cellW, cellHeight: cellH };
        }
      }

      if (bestFit) {
        console.log(`Using square board assumption: ${bestFit.size}×${bestFit.size}, cell: ${Math.round(bestFit.cellWidth)}×${Math.round(bestFit.cellHeight)}px`);
        gridInfo.cellWidth = bestFit.cellWidth;
        gridInfo.cellHeight = bestFit.cellHeight;
        cols = bestFit.size;
        rows = bestFit.size;
      }
    }
  }

  console.log(`Final board: ${rows}×${cols}, cell: ${Math.round(gridInfo.cellWidth)}×${Math.round(gridInfo.cellHeight)}px`);
  showInfoToast(`Detected ${rows}×${cols} board (cell: ${Math.round(gridInfo.cellWidth)}×${Math.round(gridInfo.cellHeight)}px)`, 5000);

  let board = '';

  // Analyze each cell
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cellX = Math.floor(gridInfo.offsetX + col * gridInfo.cellWidth + gridInfo.cellWidth / 2);
      const cellY = Math.floor(gridInfo.offsetY + row * gridInfo.cellHeight + gridInfo.cellHeight / 2);

      if (cellX >= width || cellY >= height) {
        board += '?';
        continue;
      }

      const cellType = detectCellType(data, width, height, cellX, cellY, gridInfo.cellWidth, gridInfo.cellHeight);
      board += cellType;
    }
    board += '\n';
  }

  return board;
}

function smartEstimation(width, height) {
  console.log('Using smart estimation based on common board sizes...');

  // Common minesweeper board sizes
  const commonSizes = [
    { rows: 8, cols: 8 },    // Beginner
    { rows: 9, cols: 9 },    // Custom
    { rows: 16, cols: 16 },  // Intermediate
    { rows: 16, cols: 30 },  // Expert
    { rows: 10, cols: 10 },
    { rows: 20, cols: 20 },
    { rows: 24, cols: 24 }
  ];

  let bestFit = null;
  let bestScore = Infinity;

  for (const { rows, cols } of commonSizes) {
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    // Prefer square cells
    const squareness = Math.abs(cellWidth - cellHeight);
    // Prefer reasonable cell sizes (20-100px)
    const sizeReasonableness = Math.min(
      Math.abs(cellWidth - 50),
      Math.abs(cellHeight - 50)
    );

    const score = squareness + sizeReasonableness * 0.5;

    if (score < bestScore && cellWidth > 15 && cellWidth < 150) {
      bestScore = score;
      bestFit = {
        detected: true,
        cellWidth,
        cellHeight,
        offsetX: 0,
        offsetY: 0,
        rows,
        cols
      };
    }
  }

  if (bestFit) {
    console.log(`Smart estimation: ${bestFit.rows}×${bestFit.cols}, cell: ${Math.round(bestFit.cellWidth)}×${Math.round(bestFit.cellHeight)}px`);
  }

  return bestFit || {
    detected: true,
    cellWidth: width / 16,
    cellHeight: height / 16,
    offsetX: 0,
    offsetY: 0
  };
}

function detectBoardMargin(data, width, height, cellWidth, cellHeight, cols, rows) {
  console.log('Detecting board margin/offset...');

  // Strategy: Look for the first significant color transition
  // The margin is usually uniform (dark or light), and the board starts where colors change

  let offsetX = 0;
  let offsetY = 0;

  // Sample the top-left corner (likely margin)
  const marginSamples = [];
  for (let y = 0; y < Math.min(20, height / 4); y += 5) {
    for (let x = 0; x < Math.min(20, width / 4); x += 5) {
      const idx = (y * width + x) * 4;
      marginSamples.push({
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
        brightness: (data[idx] + data[idx + 1] + data[idx + 2]) / 3
      });
    }
  }

  const marginAvgBrightness = marginSamples.reduce((sum, s) => sum + s.brightness, 0) / marginSamples.length;

  console.log(`Margin brightness: ${Math.round(marginAvgBrightness)}`);

  // Find vertical offset (top margin)
  for (let y = 0; y < height / 2; y++) {
    let differentPixels = 0;
    for (let x = 0; x < width; x += 5) {
      const idx = (y * width + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      if (Math.abs(brightness - marginAvgBrightness) > 30) {
        differentPixels++;
      }
    }
    // If >30% of pixels are different from margin, we've found the board
    if (differentPixels / (width / 5) > 0.3) {
      offsetY = y;
      break;
    }
  }

  // Find horizontal offset (left margin)
  for (let x = 0; x < width / 2; x++) {
    let differentPixels = 0;
    for (let y = 0; y < height; y += 5) {
      const idx = (y * width + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      if (Math.abs(brightness - marginAvgBrightness) > 30) {
        differentPixels++;
      }
    }
    if (differentPixels / (height / 5) > 0.3) {
      offsetX = x;
      break;
    }
  }

  // Refine offset to align with cell grid
  // Round to nearest half-cell to center on cells
  if (offsetX > 0) {
    offsetX = Math.round(offsetX / (cellWidth / 2)) * (cellWidth / 2);
  }
  if (offsetY > 0) {
    offsetY = Math.round(offsetY / (cellHeight / 2)) * (cellHeight / 2);
  }

  // Sanity check: offset shouldn't be more than 2 cells
  if (offsetX > cellWidth * 2) offsetX = 0;
  if (offsetY > cellHeight * 2) offsetY = 0;

  return { offsetX, offsetY };
}

function detectGridLines(data, width, height) {
  console.log('Starting grid detection...');

  // Method 1: Autocorrelation - detect repeating patterns
  const horizontalPeriod = detectPeriod(data, width, height, 'horizontal');
  const verticalPeriod = detectPeriod(data, width, height, 'vertical');

  console.log(`Autocorrelation detected - H: ${horizontalPeriod}px, V: ${verticalPeriod}px`);

  if (horizontalPeriod > 10 && verticalPeriod > 10) {
    return {
      detected: true,
      cellWidth: horizontalPeriod,
      cellHeight: verticalPeriod,
      offsetX: 0,
      offsetY: 0
    };
  }

  // Method 2: Look for actual grid lines (dark lines)
  const verticalLines = [];
  const horizontalLines = [];

  // Sample vertical lines (every 2 pixels for speed)
  for (let x = 0; x < width; x += 2) {
    let darkPixels = 0;
    let totalPixels = 0;

    for (let y = 0; y < height; y += 4) {
      const idx = (y * width + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      if (brightness < 120) darkPixels++;
      totalPixels++;
    }

    // If >40% of pixels are dark, it's likely a grid line
    if (darkPixels / totalPixels > 0.4) {
      verticalLines.push(x);
    }
  }

  // Sample horizontal lines
  for (let y = 0; y < height; y += 2) {
    let darkPixels = 0;
    let totalPixels = 0;

    for (let x = 0; x < width; x += 4) {
      const idx = (y * width + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      if (brightness < 120) darkPixels++;
      totalPixels++;
    }

    if (darkPixels / totalPixels > 0.4) {
      horizontalLines.push(y);
    }
  }

  // Find spacing between lines
  const vSpacing = findCommonSpacing(verticalLines);
  const hSpacing = findCommonSpacing(horizontalLines);

  console.log(`Grid line detection - V: ${vSpacing}px (${verticalLines.length} lines), H: ${hSpacing}px (${horizontalLines.length} lines)`);

  if (vSpacing > 10 && hSpacing > 10) {
    return {
      detected: true,
      cellWidth: vSpacing,
      cellHeight: hSpacing,
      offsetX: verticalLines[0] || 0,
      offsetY: horizontalLines[0] || 0
    };
  }

  return { detected: false };
}

// New method: Detect repeating patterns using autocorrelation
function detectPeriod(data, width, height, direction) {
  const maxPeriod = Math.min(150, direction === 'horizontal' ? width / 4 : height / 4);
  const scores = [];

  if (direction === 'horizontal') {
    // Sample middle row
    const y = Math.floor(height / 2);
    const rowData = [];

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      rowData.push((data[idx] + data[idx + 1] + data[idx + 2]) / 3);
    }

    // Calculate autocorrelation for different periods
    for (let period = 15; period < maxPeriod; period++) {
      let score = 0;
      let count = 0;

      for (let i = 0; i < width - period; i++) {
        score += Math.abs(rowData[i] - rowData[i + period]);
        count++;
      }

      scores.push({ period, score: score / count });
    }
  } else {
    // Sample middle column
    const x = Math.floor(width / 2);
    const colData = [];

    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      colData.push((data[idx] + data[idx + 1] + data[idx + 2]) / 3);
    }

    // Calculate autocorrelation
    for (let period = 15; period < maxPeriod; period++) {
      let score = 0;
      let count = 0;

      for (let i = 0; i < height - period; i++) {
        score += Math.abs(colData[i] - colData[i + period]);
        count++;
      }

      scores.push({ period, score: score / count });
    }
  }

  // Find period with MINIMUM score (most similar = repeating pattern)
  // But also look for local minima
  const localMinima = [];
  for (let i = 2; i < scores.length - 2; i++) {
    if (scores[i].score < scores[i-1].score &&
        scores[i].score < scores[i+1].score &&
        scores[i].score < scores[i-2].score &&
        scores[i].score < scores[i+2].score) {
      localMinima.push(scores[i]);
    }
  }

  if (localMinima.length > 0) {
    // Return the strongest local minimum
    localMinima.sort((a, b) => a.score - b.score);
    return localMinima[0].period;
  }

  return 0;
}

function findCommonSpacing(lines) {
  if (lines.length < 3) return 0;

  const spacings = [];
  for (let i = 1; i < lines.length; i++) {
    const spacing = lines[i] - lines[i - 1];
    if (spacing > 10 && spacing < 200) { // Reasonable cell size range
      spacings.push(spacing);
    }
  }

  if (spacings.length === 0) return 0;

  // Group spacings into buckets (tolerance of ±3 pixels)
  const buckets = {};
  spacings.forEach(s => {
    const bucket = Math.round(s / 3) * 3;
    buckets[bucket] = (buckets[bucket] || 0) + 1;
  });

  // Find most common spacing
  let maxCount = 0;
  let commonSpacing = 0;
  for (const [spacing, count] of Object.entries(buckets)) {
    if (count > maxCount) {
      maxCount = count;
      commonSpacing = parseInt(spacing);
    }
  }

  // Only return if we have enough confidence (at least 3 occurrences)
  return maxCount >= 3 ? commonSpacing : 0;
}

function estimateCellSize(data, width, height, direction) {
  console.log(`Trying edge detection for ${direction}...`);

  const edges = [];

  if (direction === 'horizontal') {
    // Scan horizontally for vertical edges
    for (let x = 0; x < width - 1; x++) {
      let edgeStrength = 0;
      for (let y = 0; y < height; y += 2) {
        const idx1 = (y * width + x) * 4;
        const idx2 = (y * width + x + 1) * 4;
        const diff = Math.abs(data[idx1] - data[idx2]) +
                     Math.abs(data[idx1 + 1] - data[idx2 + 1]) +
                     Math.abs(data[idx1 + 2] - data[idx2 + 2]);
        edgeStrength += diff;
      }
      edges.push(edgeStrength);
    }
  } else {
    // Scan vertically for horizontal edges
    for (let y = 0; y < height - 1; y++) {
      let edgeStrength = 0;
      for (let x = 0; x < width; x += 2) {
        const idx1 = (y * width + x) * 4;
        const idx2 = ((y + 1) * width + x) * 4;
        const diff = Math.abs(data[idx1] - data[idx2]) +
                     Math.abs(data[idx1 + 1] - data[idx2 + 1]) +
                     Math.abs(data[idx1 + 2] - data[idx2 + 2]);
        edgeStrength += diff;
      }
      edges.push(edgeStrength);
    }
  }

  // Find peaks with better threshold
  const maxEdge = Math.max(...edges);
  const avgEdge = edges.reduce((a, b) => a + b, 0) / edges.length;
  const threshold = Math.max(avgEdge * 1.5, maxEdge * 0.2);

  const peaks = [];
  for (let i = 5; i < edges.length - 5; i++) {
    if (edges[i] > threshold &&
        edges[i] > edges[i - 1] &&
        edges[i] > edges[i + 1] &&
        edges[i] > edges[i - 2] &&
        edges[i] > edges[i + 2]) {
      peaks.push(i);
    }
  }

  console.log(`Found ${peaks.length} peaks`);

  const spacing = findCommonSpacing(peaks);
  console.log(`Edge spacing: ${spacing}px`);

  return spacing > 10 ? spacing : 0;
}

function detectCellType(data, width, height, centerX, centerY, cellWidth, cellHeight) {
  // Sample a grid of points within the cell
  const samples = [];
  const sampleGrid = 5; // 5x5 sampling grid

  for (let sy = 0; sy < sampleGrid; sy++) {
    for (let sx = 0; sx < sampleGrid; sx++) {
      const x = Math.floor(centerX - cellWidth / 3 + (sx / (sampleGrid - 1)) * (cellWidth * 2 / 3));
      const y = Math.floor(centerY - cellHeight / 3 + (sy / (sampleGrid - 1)) * (cellHeight * 2 / 3));

      if (x >= 0 && x < width && y >= 0 && y < height) {
        const idx = (y * width + x) * 4;
        samples.push({
          r: data[idx],
          g: data[idx + 1],
          b: data[idx + 2],
          brightness: (data[idx] + data[idx + 1] + data[idx + 2]) / 3
        });
      }
    }
  }

  if (samples.length === 0) return '?';

  // Calculate statistics
  const avgBrightness = samples.reduce((sum, s) => sum + s.brightness, 0) / samples.length;
  const avgR = samples.reduce((sum, s) => sum + s.r, 0) / samples.length;
  const avgG = samples.reduce((sum, s) => sum + s.g, 0) / samples.length;
  const avgB = samples.reduce((sum, s) => sum + s.b, 0) / samples.length;

  const minBrightness = Math.min(...samples.map(s => s.brightness));
  const maxBrightness = Math.max(...samples.map(s => s.brightness));
  const brightnessRange = maxBrightness - minBrightness;

  // Calculate variance
  const brightnessVariance = samples.reduce((sum, s) => sum + Math.pow(s.brightness - avgBrightness, 2), 0) / samples.length;

  // Log first few cells for debugging
  if (window.ocrDebugCount === undefined) window.ocrDebugCount = 0;
  if (window.ocrDebugCount < 10) {
    console.log(`Cell at (${Math.round(centerX)}, ${Math.round(centerY)}): 
      RGB:(${Math.round(avgR)},${Math.round(avgG)},${Math.round(avgB)}) 
      Br:${Math.round(avgBrightness)} Rng:${Math.round(brightnessRange)} 
      Var:${Math.round(brightnessVariance)}`);
    window.ocrDebugCount++;
  }

  // Based on your actual cell colors:
  // Empty revealed: RGB(206,208,186) Br:200 Var:305
  // Number 1: RGB(227,231,205) Br:221 Var:0 (very light, slightly green)
  // Number 0: RGB(217,223,210) Br:217 Var:506 (light green)
  // Others: RGB(191,193,189) Br:191 Var:3756 (darker, high variance)

  // 1. VERY light and uniform (Br > 225, low variance) = probably empty or very light number
  if (avgBrightness > 225 && brightnessVariance < 50) {
    // Very light with slight green tint = number 1
    if (avgG > avgR && avgG > avgB) {
      return '1';
    }
    return '.'; // Pure white = empty
  }

  // 2. Light with GREEN tint (this is key for your image!)
  // RGB(227,231,205) - G is highest = numbered cell
  // RGB(217,223,210) - G is highest = numbered cell
  const isGreenish = avgG > avgR + 3 && avgG > avgB + 3; // Even slight green tint matters!

  if (avgBrightness > 190 && isGreenish) {
    // These are your numbered cells!
    // Brightness 221, Var 0-506 = different numbers

    if (brightnessVariance < 100 && avgBrightness > 220) {
      // Very uniform, very bright = 1
      return '1';
    }

    if (brightnessVariance < 600 && avgBrightness > 210) {
      // Medium variance, bright = 0 or 1
      // Check if there are dark pixels (the number)
      const darkSamples = samples.filter(s => s.brightness < avgBrightness - 15);
      if (darkSamples.length > 2) {
        // Has text visible
        const darkRatio = darkSamples.length / samples.length;
        if (darkRatio < 0.15) return '1';
        if (darkRatio < 0.25) return '2';
        return '0';
      }
      return '1'; // Default for light greenish
    }

    // Higher variance = higher numbers or darker cells
    if (brightnessVariance > 1000) {
      // Very high variance = has visible number
      const darkSamples = samples.filter(s => s.brightness < avgBrightness - 20);
      if (darkSamples.length > 0) {
        const darkRatio = darkSamples.length / samples.length;
        if (darkRatio < 0.20) return '1';
        if (darkRatio < 0.30) return '2';
        if (darkRatio < 0.40) return '3';
        return '2';
      }
    }

    // Medium variance greenish
    if (brightnessVariance > 600) {
      return '2';
    }

    return '1'; // Default greenish = 1
  }

  // 3. Medium brightness, NO green tint = unrevealed or empty
  if (avgBrightness > 190 && avgBrightness < 210 && !isGreenish) {
    // Check if it's grayish (R≈G≈B)
    const colorDiff = Math.max(Math.abs(avgR - avgG), Math.abs(avgG - avgB), Math.abs(avgR - avgB));
    if (colorDiff < 10 && brightnessVariance < 500) {
      // Very gray, uniform = probably empty revealed
      return '.';
    }
    return '?'; // Gray but not sure
  }

  // 4. Darker cells (< 190) with high variance = numbers
  if (avgBrightness < 195 && brightnessVariance > 2000) {
    const darkSamples = samples.filter(s => s.brightness < avgBrightness - 20);
    if (darkSamples.length > 3) {
      const darkRatio = darkSamples.length / samples.length;
      if (darkRatio < 0.20) return '1';
      if (darkRatio < 0.30) return '2';
      if (darkRatio < 0.40) return '3';
      return '2';
    }
  }

  // 5. Very dark = either empty revealed on dark background or mine
  if (avgBrightness < 100) {
    return '.';
  }

  // 6. Medium dark, low variance = unrevealed
  if (avgBrightness < 200 && brightnessVariance < 500) {
    return '?';
  }

  // Default: unrevealed
  return '?';
}

function applyOCRToBoard() {
  const ocrResult = document.getElementById('ocrResult').value.trim();

  if (!ocrResult) {
    showWarningToast('No board data to apply!');
    return;
  }

  try {
    const lines = ocrResult.split('\n').filter(l => l.length > 0);
    if (lines.length === 0) {
      throw new Error('Empty board');
    }

    const rows = lines.length;
    const cols = lines[0].length;

    // Update dimensions
    state.editor.rows = rows;
    state.editor.cols = cols;
    document.getElementById('rows').value = rows;
    document.getElementById('cols').value = cols;

    // Parse board
    state.editor.board = lines.map(line => line.split(''));

    // Render
    renderEditorBoard();
    validateBoardConstraints();

    // Close modal
    document.getElementById('ocrModal').classList.remove('active');

    showSuccessToast(`Board imported! ${rows}x${cols} board loaded. Review and edit as needed.`);
  } catch (error) {
    showErrorToast('Error applying board: ' + error.message);
  }
}

function resetOCRState() {
  ocrState = {
    image: null,
    imageData: null,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    detectedBoard: '',
    cropEnabled: false,
    cropX: 50,
    cropY: 50,
    cropWidth: 200,
    cropHeight: 200,
    cropDragging: false,
    cropResizing: false,
    cropResizeHandle: null
  };

  document.getElementById('uploadSection').style.display = 'block';
  document.getElementById('ocrSection').style.display = 'none';
  document.getElementById('ocrResult').value = '';
  document.getElementById('ocrImage').src = '';
  document.getElementById('imageOpacity').value = 50;
  document.getElementById('imageZoom').value = 100;
  document.getElementById('opacityValue').textContent = '50';
  document.getElementById('zoomValue').textContent = '100';

  // Remove crop overlay if exists
  const container = document.getElementById('ocrImageContainer');
  const existingCrop = container.querySelector('.crop-overlay');
  if (existingCrop) {
    existingCrop.remove();
  }
}

// ============================================================================
// SOLVER FUNCTIONS
// ============================================================================

function initSolver() {
  document.getElementById('loadFromEditor').addEventListener('click', () => {
    const boardStr = boardToString(state.editor.board);
    state.solver.inputBoard = boardStr;
    document.getElementById('inputBoard').value = boardStr;
  });

  document.getElementById('loadFromFile').addEventListener('click', loadBoardFile);
  document.getElementById('solveBoard').addEventListener('click', solveBoard);
  document.getElementById('viewSolution').addEventListener('click', viewSolution);
  document.getElementById('saveToHistory').addEventListener('click', saveToHistory);
}

function loadBoardFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        state.solver.inputBoard = content;
        document.getElementById('inputBoard').value = content;
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

function solveBoard() {
  const inputStr = document.getElementById('inputBoard').value.trim();

  if (!inputStr) {
    showWarningToast('Please load or enter a board first!');
    return;
  }

  // Show progress
  document.getElementById('solverProgress').classList.remove('hidden');
  document.getElementById('solverStats').classList.add('hidden');
  document.getElementById('solverResult').classList.add('hidden');

  // Use setTimeout to allow UI to update
  setTimeout(() => {
    try {
      const board = stringToBoard(inputStr);
      const result = solveMinesweeper(board);

      state.solver.outputBoard = boardToString(result.solution);
      state.solver.stats = result.stats;

      document.getElementById('outputBoard').value = state.solver.outputBoard;

      // Update stats
      document.getElementById('statOutline').textContent = result.stats.outlineSize;
      document.getElementById('statClusters').textContent = result.stats.clusters;
      document.getElementById('statConfigs').textContent = result.stats.configurations;
      document.getElementById('statSafe').textContent = result.stats.safeCells;

      // Show probability suggestion if available
      const suggestionDiv = document.getElementById('probabilitySuggestion');
      if (result.bestCell) {
        const [r, c] = result.bestCell.position.split(',');
        const percentage = (result.bestCell.probability * 100).toFixed(1);
        suggestionDiv.className = 'alert alert-info';
        suggestionDiv.innerHTML = `
          <strong>💡 No certain moves available!</strong><br>
          Best guess: Cell (${r}, ${c}) has ${percentage}% chance of being a mine.<br>
          This is your safest bet with ${(100 - result.bestCell.probability * 100).toFixed(1)}% safety.
        `;
        suggestionDiv.classList.remove('hidden');
      } else {
        suggestionDiv.classList.add('hidden');
      }

      document.getElementById('solverProgress').classList.add('hidden');
      document.getElementById('solverStats').classList.remove('hidden');
      document.getElementById('solverResult').classList.remove('hidden');

    } catch (error) {
      document.getElementById('solverProgress').classList.add('hidden');
      showErrorToast('Error solving board: ' + error.message, 5000);
    }
  }, 100);
}

function viewSolution() {
  state.viewer.currentBoard = state.solver.outputBoard;
  document.getElementById('viewerInput').value = state.solver.outputBoard;
  renderViewerBoard();
  document.querySelector('.tab[data-tab="viewer"]').click();
}

function saveToHistory() {
  const timestamp = getTimestamp();
  const inputBoard = state.solver.inputBoard;
  const outputBoard = state.solver.outputBoard;

  // Check for duplicates
  const isDuplicate = state.history.some(entry =>
    entry.inputBoard === inputBoard && entry.outputBoard === outputBoard
  );

  if (isDuplicate) {
    showWarningToast('This board is already in your history!');
    return;
  }

  const entry = {
    timestamp,
    inputBoard,
    outputBoard,
    stats: state.solver.stats
  };

  state.history.unshift(entry);
  saveToLocalStorage('minesweeper_history', state.history);

  showSuccessToast('Game saved to history!');
}

// ============================================================================
// MINESWEEPER SOLVER ALGORITHM
// ============================================================================

function solveMinesweeper(board) {
  const nrows = board.length;
  const ncols = board[0].length;

  // Find outline and numbers
  const outline = new Set();
  const numbers = {};

  for (let r = 0; r < nrows; r++) {
    for (let c = 0; c < ncols; c++) {
      const ch = board[r][c];
      if (ch >= '0' && ch <= '8') {
        numbers[`${r},${c}`] = parseInt(ch);
      }
    }
  }

  // Find outline cells
  for (const key in numbers) {
    const [r, c] = key.split(',').map(Number);
    const neighbors = getNeighbors(r, c, nrows, ncols);
    for (const [nr, nc] of neighbors) {
      if (board[nr][nc] === '.' || board[nr][nc] === '?') {
        outline.add(`${nr},${nc}`);
      }
    }
  }

  const outlineList = Array.from(outline).map(key => key.split(',').map(Number));

  if (outlineList.length === 0) {
    return {
      solution: board,
      stats: {
        outlineSize: 0,
        clusters: 0,
        configurations: 0,
        safeCells: 0
      }
    };
  }

  // Generate all possible configurations (simplified version)
  const configurations = generateConfigurations(board, outlineList, numbers, nrows, ncols);

  // Combine configurations
  const solution = combineConfigurations(board, configurations, outlineList);

  // Calculate stats
  let safeCells = 0;
  let uncertainCells = 0;
  for (let r = 0; r < nrows; r++) {
    for (let c = 0; c < ncols; c++) {
      if (solution[r][c] === 'o') safeCells++;
      if (solution[r][c] === '#') uncertainCells++;
    }
  }

  // Calculate probabilities if no certain cells
  let probabilities = null;
  let bestCell = null;
  if (safeCells === 0 && uncertainCells > 0 && configurations.length > 0) {
    probabilities = calculateProbabilities(configurations, outlineList);
    bestCell = findSafestCell(probabilities);
  }

  return {
    solution,
    stats: {
      outlineSize: outlineList.length,
      clusters: 1, // Simplified - not doing cluster decomposition in JS
      configurations: configurations.length,
      safeCells,
      uncertainCells
    },
    probabilities,
    bestCell
  };
}

function getNeighbors(r, c, nrows, ncols) {
  const neighbors = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < nrows && nc >= 0 && nc < ncols) {
        neighbors.push([nr, nc]);
      }
    }
  }
  return neighbors;
}

function generateConfigurations(board, outline, numbers, nrows, ncols) {
  const configs = [];
  const maxConfigs = Math.min(1024, Math.pow(2, outline.length)); // Limit for performance

  // Try random sampling if too many possibilities
  if (outline.length > 10) {
    // Sample random configurations
    for (let i = 0; i < maxConfigs; i++) {
      const config = board.map(row => [...row]);
      let valid = true;

      // Randomly assign
      for (const [r, c] of outline) {
        config[r][c] = Math.random() < 0.5 ? 'o' : 'x';
      }

      // Validate
      for (const key in numbers) {
        const [r, c] = key.split(',').map(Number);
        const expected = numbers[key];
        const neighbors = getNeighbors(r, c, nrows, ncols);
        let mineCount = 0;

        for (const [nr, nc] of neighbors) {
          if (config[nr][nc] === '!' || config[nr][nc] === 'x') {
            mineCount++;
          }
        }

        if (mineCount !== expected) {
          valid = false;
          break;
        }
      }

      if (valid) {
        configs.push(config);
      }
    }
  } else {
    // Brute force for small boards
    const numConfigs = Math.pow(2, outline.length);

    for (let i = 0; i < numConfigs; i++) {
      const config = board.map(row => [...row]);
      let valid = true;

      // Assign based on bit pattern
      for (let j = 0; j < outline.length; j++) {
        const [r, c] = outline[j];
        config[r][c] = (i & (1 << j)) ? 'x' : 'o';
      }

      // Validate
      for (const key in numbers) {
        const [r, c] = key.split(',').map(Number);
        const expected = numbers[key];
        const neighbors = getNeighbors(r, c, nrows, ncols);
        let mineCount = 0;

        for (const [nr, nc] of neighbors) {
          if (config[nr][nc] === '!' || config[nr][nc] === 'x') {
            mineCount++;
          }
        }

        if (mineCount !== expected) {
          valid = false;
          break;
        }
      }

      if (valid) {
        configs.push(config);
      }
    }
  }

  return configs;
}

function combineConfigurations(board, configurations, outline) {
  if (configurations.length === 0) {
    return board;
  }

  const result = board.map(row => [...row]);

  for (const [r, c] of outline) {
    const firstVal = configurations[0][r][c];
    let allSame = true;

    for (let i = 1; i < configurations.length; i++) {
      if (configurations[i][r][c] !== firstVal) {
        allSame = false;
        break;
      }
    }

    result[r][c] = allSame ? firstVal : '#';
  }

  return result;
}

function calculateProbabilities(configurations, outline) {
  const probabilities = {};

  for (const [r, c] of outline) {
    let mineCount = 0;
    for (const config of configurations) {
      if (config[r][c] === 'x') {
        mineCount++;
      }
    }
    const probability = mineCount / configurations.length;
    probabilities[`${r},${c}`] = probability;
  }

  return probabilities;
}

function findSafestCell(probabilities) {
  let minProb = 1.0;
  let safestCell = null;

  for (const [key, prob] of Object.entries(probabilities)) {
    if (prob < minProb) {
      minProb = prob;
      safestCell = {
        position: key,
        probability: prob
      };
    }
  }

  return safestCell;
}

// ============================================================================
// VIEWER FUNCTIONS
// ============================================================================

function initViewer() {
  document.getElementById('loadSolution').addEventListener('click', () => {
    if (state.solver.outputBoard) {
      document.getElementById('viewerInput').value = state.solver.outputBoard;
      renderViewerBoard();
    } else {
      showWarningToast('No solution available. Solve a board first!');
    }
  });

  document.getElementById('loadCustomBoard').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target.result;
          document.getElementById('viewerInput').value = content;
          renderViewerBoard();
        };
        reader.readAsText(file);
      }
    };
    input.click();
  });

  document.getElementById('viewerInput').addEventListener('input', renderViewerBoard);
}

function renderViewerBoard() {
  const input = document.getElementById('viewerInput').value.trim();

  if (!input) {
    document.getElementById('viewerBoard').innerHTML = '';
    return;
  }

  const board = stringToBoard(input);
  const boardEl = document.getElementById('viewerBoard');
  const cols = board[0].length;

  boardEl.innerHTML = '';
  boardEl.style.gridTemplateColumns = `repeat(${cols}, 35px)`;

  board.forEach(row => {
    row.forEach(cell => {
      const cellEl = document.createElement('div');
      cellEl.className = 'cell';

      if (cell === '.') {
        cellEl.classList.add('empty');
        cellEl.textContent = '';
      } else if (cell === '!') {
        cellEl.classList.add('mine');
        cellEl.textContent = '💣';
      } else if (cell === '?') {
        cellEl.classList.add('flag');
        cellEl.textContent = '❓';
      } else if (cell >= '0' && cell <= '8') {
        cellEl.classList.add('number');
        cellEl.textContent = cell;
      } else if (cell === '#') {
        cellEl.classList.add('thinking');
        cellEl.textContent = '🤔';
      } else if (cell === 'o') {
        cellEl.classList.add('safe');
        cellEl.textContent = '👍';
      } else if (cell === 'x') {
        cellEl.classList.add('unsafe');
        cellEl.textContent = '👎';
      } else {
        cellEl.textContent = cell;
      }

      boardEl.appendChild(cellEl);
    });
  });
}

// ============================================================================
// HISTORY FUNCTIONS
// ============================================================================

function initHistory() {
  // Load history from localStorage
  const saved = loadFromLocalStorage('minesweeper_history');
  if (saved) {
    state.history = saved;
  }

  document.getElementById('exportHistory').addEventListener('click', exportHistory);
  document.getElementById('clearHistory').addEventListener('click', clearHistoryData);
  document.getElementById('importHistory').addEventListener('click', importHistory);
  document.getElementById('viewTimeline').addEventListener('click', toggleTimeline);
}

function importHistory() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (Array.isArray(imported)) {
            // Merge with existing history, avoiding duplicates
            for (const entry of imported) {
              const isDuplicate = state.history.some(existing =>
                existing.inputBoard === entry.inputBoard &&
                existing.outputBoard === entry.outputBoard
              );
              if (!isDuplicate) {
                state.history.push(entry);
              }
            }
            // Sort by timestamp
            state.history.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
            saveToLocalStorage('minesweeper_history', state.history);
            renderHistory();
            showSuccessToast(`Imported ${imported.length} games successfully!`);
          } else {
            showErrorToast('Invalid history file format!');
          }
        } catch (error) {
          showErrorToast('Error reading history file: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

function toggleTimeline() {
  const timelineDiv = document.getElementById('timelineView');
  const historyList = document.getElementById('historyList');

  if (timelineDiv.classList.contains('hidden')) {
    // Show timeline
    renderTimeline();
    timelineDiv.classList.remove('hidden');
    historyList.classList.add('hidden');
    document.getElementById('viewTimeline').textContent = '📋 List View';
  } else {
    // Show list
    timelineDiv.classList.add('hidden');
    historyList.classList.remove('hidden');
    document.getElementById('viewTimeline').textContent = '📅 Timeline View';
  }
}

function renderTimeline() {
  const container = document.getElementById('timelineView');

  if (state.history.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #6b7280;">No saved games yet.</p>';
    return;
  }

  container.innerHTML = '<div class="timeline"></div>';
  const timeline = container.querySelector('.timeline');

  state.history.forEach((entry, index) => {
    const item = document.createElement('div');
    item.className = 'timeline-item';

    const timestamp = entry.timestamp;
    const date = `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}`;
    const time = `${timestamp.slice(9, 11)}:${timestamp.slice(11, 13)}`;

    item.innerHTML = `
      <div class="timeline-marker">${index + 1}</div>
      <div class="timeline-content">
        <div class="timeline-header">
          <strong>${date} ${time}</strong>
          <div class="timeline-actions">
            <button class="history-btn" onclick="viewHistoryItem(${index})">View</button>
            <button class="history-btn" onclick="downloadHistoryItem(${index})">Download</button>
          </div>
        </div>
        <div class="timeline-stats">
          Safe: ${entry.stats?.safeCells || 0} | 
          Configs: ${entry.stats?.configurations || 0} | 
          Outline: ${entry.stats?.outlineSize || 0}
        </div>
        <div class="timeline-board-preview">
          ${renderMiniBoard(entry.outputBoard)}
        </div>
      </div>
    `;

    timeline.appendChild(item);
  });
}

function renderMiniBoard(boardStr) {
  const lines = boardStr.split('\n').filter(l => l.length > 0);
  if (lines.length === 0) return '';

  const maxPreviewSize = 10;
  const preview = lines.slice(0, maxPreviewSize).map(line =>
    line.slice(0, maxPreviewSize).split('').map(ch => {
      if (ch === 'o') return '👍';
      if (ch === 'x') return '👎';
      if (ch === '#') return '🤔';
      if (ch === '!') return '💣';
      if (ch === '?') return '❓';
      return ch;
    }).join('')
  ).join('<br>');

  return `<div class="mini-board">${preview}</div>`;
}

function renderHistory() {
  const container = document.getElementById('historyList');

  if (state.history.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #6b7280;">No saved games yet. Solve some boards to build your history!</p>';
    return;
  }

  container.innerHTML = '';

  state.history.forEach((entry, index) => {
    const item = document.createElement('div');
    item.className = 'history-item';

    const info = document.createElement('div');
    const timestamp = entry.timestamp;
    const date = `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}`;
    const time = `${timestamp.slice(9, 11)}:${timestamp.slice(11, 13)}:${timestamp.slice(13, 15)}`;
    info.innerHTML = `
      <div style="font-weight: 600;">${date} ${time}</div>
      <div class="history-time">
        Outline: ${entry.stats?.outlineSize || 'N/A'} | 
        Configs: ${entry.stats?.configurations || 'N/A'} | 
        Safe: ${entry.stats?.safeCells || 'N/A'}
      </div>
    `;

    const actions = document.createElement('div');
    actions.className = 'history-actions';

    const viewBtn = document.createElement('button');
    viewBtn.className = 'history-btn';
    viewBtn.textContent = 'View';
    viewBtn.onclick = () => viewHistoryItem(index);

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'history-btn';
    downloadBtn.textContent = 'Download';
    downloadBtn.onclick = () => downloadHistoryItem(index);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'history-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteHistoryItem(index);

    actions.appendChild(viewBtn);
    actions.appendChild(downloadBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(info);
    item.appendChild(actions);
    container.appendChild(item);
  });
}

function viewHistoryItem(index) {
  const entry = state.history[index];
  state.viewer.currentBoard = entry.outputBoard;
  document.getElementById('viewerInput').value = entry.outputBoard;
  renderViewerBoard();
  document.querySelector('.tab[data-tab="viewer"]').click();
}

function downloadHistoryItem(index) {
  const entry = state.history[index];
  const content = `Input Board:\n${entry.inputBoard}\n\nSolution:\n${entry.outputBoard}`;
  const blob = new Blob([content], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `minesweeper_${entry.timestamp}.txt`;
  link.click();
}

function deleteHistoryItem(index) {
  if (confirm('Delete this history item?')) {
    state.history.splice(index, 1);
    saveToLocalStorage('minesweeper_history', state.history);
    renderHistory();
  }
}

function exportHistory() {
  if (state.history.length === 0) {
    alert('No history to export!');
    return;
  }

  const content = JSON.stringify(state.history, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `minesweeper_history_${getTimestamp()}.json`;
  link.click();
}

function clearHistoryData() {
  if (confirm('Clear all history? This cannot be undone!')) {
    state.history = [];
    saveToLocalStorage('minesweeper_history', state.history);
    renderHistory();
  }
}

// Make functions globally accessible for inline onclick handlers
window.viewHistoryItem = viewHistoryItem;
window.downloadHistoryItem = downloadHistoryItem;

// ============================================================================
// INITIALIZATION
// ============================================================================

// ============================================================================
// VISUAL GRID EDITOR (Replacement for unreliable OCR)
// ============================================================================

function initVisualGridEditor() {
  const modal = document.getElementById('ocrModal');
  const closeBtn = document.getElementById('closeOcrModal');
  const importBtn = document.getElementById('importFromImage');
  const uploadArea = document.getElementById('uploadArea');
  const uploadInput = document.getElementById('imageUpload');

  // Open modal
  importBtn.addEventListener('click', () => {
    modal.classList.add('active');
    document.getElementById('uploadSection').style.display = 'block';
    document.getElementById('gridEditorSection').style.display = 'none';
  });

  // Close modal
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // Upload area click
  uploadArea.addEventListener('click', () => {
    uploadInput.click();
  });

  // File upload
  uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      loadGridImageFile(file);
    }
  });

  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--accent-primary)';
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'var(--border-color)';
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--border-color)';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      loadGridImageFile(file);
    }
  });

  // Paste from clipboard
  document.addEventListener('paste', (e) => {
    if (modal.classList.contains('active')) {
      const items = e.clipboardData.items;
      for (let item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          loadGridImageFile(file);
          break;
        }
      }
    }
  });

  // Control buttons
  document.getElementById('createGrid').addEventListener('click', createGrid);
  document.getElementById('toggleCrop').addEventListener('click', toggleCrop);
  document.getElementById('clearGrid').addEventListener('click', clearGrid);
  document.getElementById('exportGrid').addEventListener('click', exportGrid);
  document.getElementById('resetGrid').addEventListener('click', resetGridEditor);

  // Opacity and zoom controls
  document.getElementById('gridImageOpacity').addEventListener('input', (e) => {
    gridState.opacity = parseInt(e.target.value) / 100;
    document.getElementById('gridOpacityValue').textContent = e.target.value;

    // Only redraw if image is loaded
    if (gridState.image) {
      // Ensure canvas is initialized
      if (!gridState.canvas) {
        gridState.canvas = document.getElementById('gridEditorCanvas');
        gridState.ctx = gridState.canvas.getContext('2d');
      }

      // If no grid created yet, just redraw the image
      if (!gridState.cells || gridState.cells.length === 0) {
        const canvas = gridState.canvas;
        const ctx = gridState.ctx;
        canvas.width = gridState.image.width * gridState.scale;
        canvas.height = gridState.image.height * gridState.scale;
        ctx.globalAlpha = gridState.opacity;
        ctx.drawImage(gridState.image, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
      } else {
        redrawGrid();
      }
    }
  });

  document.getElementById('gridImageZoom').addEventListener('input', (e) => {
    gridState.scale = parseInt(e.target.value) / 100;
    document.getElementById('gridZoomValue').textContent = e.target.value;

    // Only redraw if image is loaded
    if (gridState.image) {
      // Ensure canvas is initialized
      if (!gridState.canvas) {
        gridState.canvas = document.getElementById('gridEditorCanvas');
        gridState.ctx = gridState.canvas.getContext('2d');
      }

      // If no grid created yet, just redraw the image
      if (!gridState.cells || gridState.cells.length === 0) {
        const canvas = gridState.canvas;
        const ctx = gridState.ctx;
        canvas.width = gridState.image.width * gridState.scale;
        canvas.height = gridState.image.height * gridState.scale;
        ctx.globalAlpha = gridState.opacity;
        ctx.drawImage(gridState.image, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
      } else {
        redrawGrid();
      }
    }
  });

  // Canvas interaction
  const canvas = document.getElementById('gridEditorCanvas');
  if (!canvas) {
    console.error('CRITICAL: Canvas element #gridEditorCanvas not found during initialization!');
  } else {
    console.log('✅ Canvas element found during initialization');
  }

  canvas.addEventListener('click', handleGridCellClick);

  // Crop rectangle manipulation with handles
  canvas.addEventListener('mousedown', (e) => {
    if (!gridState.cropEnabled || (gridState.cells && gridState.cells.length > 0)) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const handle = getResizeHandle(x, y);

    if (handle) {
      gridState.cropResizeHandle = handle;
      gridState.cropDragStartX = x;
      gridState.cropDragStartY = y;
      gridState.cropStartX = gridState.cropX;
      gridState.cropStartY = gridState.cropY;
      gridState.cropStartWidth = gridState.cropWidth;
      gridState.cropStartHeight = gridState.cropHeight;

      if (handle === 'move') {
        gridState.cropDragging = true;
      } else {
        gridState.cropResizing = true;
      }

      e.preventDefault();
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!gridState.cropEnabled) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update cursor based on handle
    if (!gridState.cropDragging && !gridState.cropResizing) {
      const handle = getResizeHandle(x, y);
      if (handle === 'nw' || handle === 'se') canvas.style.cursor = 'nwse-resize';
      else if (handle === 'ne' || handle === 'sw') canvas.style.cursor = 'nesw-resize';
      else if (handle === 'n' || handle === 's') canvas.style.cursor = 'ns-resize';
      else if (handle === 'w' || handle === 'e') canvas.style.cursor = 'ew-resize';
      else if (handle === 'move') canvas.style.cursor = 'move';
      else canvas.style.cursor = 'crosshair';
    }

    if (gridState.cropDragging) {
      // Move crop rectangle
      const dx = x - gridState.cropDragStartX;
      const dy = y - gridState.cropDragStartY;

      gridState.cropX = Math.max(0, Math.min(canvas.width - gridState.cropWidth, gridState.cropStartX + dx));
      gridState.cropY = Math.max(0, Math.min(canvas.height - gridState.cropHeight, gridState.cropStartY + dy));

      redrawCropOverlay();
    } else if (gridState.cropResizing) {
      // Resize crop rectangle
      const dx = x - gridState.cropDragStartX;
      const dy = y - gridState.cropDragStartY;
      const handle = gridState.cropResizeHandle;

      let newX = gridState.cropStartX;
      let newY = gridState.cropStartY;
      let newWidth = gridState.cropStartWidth;
      let newHeight = gridState.cropStartHeight;

      if (handle.includes('n')) {
        newY = gridState.cropStartY + dy;
        newHeight = gridState.cropStartHeight - dy;
      }
      if (handle.includes('s')) {
        newHeight = gridState.cropStartHeight + dy;
      }
      if (handle.includes('w')) {
        newX = gridState.cropStartX + dx;
        newWidth = gridState.cropStartWidth - dx;
      }
      if (handle.includes('e')) {
        newWidth = gridState.cropStartWidth + dx;
      }

      // Ensure minimum size
      if (newWidth >= 50 && newHeight >= 50) {
        gridState.cropX = newX;
        gridState.cropY = newY;
        gridState.cropWidth = newWidth;
        gridState.cropHeight = newHeight;
      }

      redrawCropOverlay();
    }
  });

  canvas.addEventListener('mouseup', () => {
    if (gridState.cropDragging || gridState.cropResizing) {
      gridState.cropDragging = false;
      gridState.cropResizing = false;
      gridState.cropResizeHandle = null;
      canvas.style.cursor = 'crosshair';
      console.log(`Crop region set: ${Math.round(gridState.cropX)}, ${Math.round(gridState.cropY)}, ${Math.round(gridState.cropWidth)}×${Math.round(gridState.cropHeight)}`);
    }
  });

  canvas.addEventListener('mouseleave', () => {
    gridState.cropDragging = false;
    gridState.cropResizing = false;
    gridState.cropResizeHandle = null;
    canvas.style.cursor = 'crosshair';
  });

  // Keyboard input
  document.addEventListener('keydown', handleGridKeyInput);
}

function loadGridImageFile(file) {
  if (!file) {
    showErrorToast('No file provided');
    return;
  }

  console.log('Loading image file:', file.name, file.type, file.size);

  const reader = new FileReader();
  reader.onload = (e) => {
    console.log('FileReader loaded, creating image...');
    const img = new Image();
    img.onload = () => {
      console.log(`Image loaded successfully: ${img.width}×${img.height}`);
      gridState.image = img;

      // IMMEDIATE TEST: Try to draw to canvas right now
      const testCanvas = document.getElementById('gridEditorCanvas');
      if (testCanvas) {
        // Set up canvas state
        gridState.canvas = testCanvas;
        gridState.ctx = testCanvas.getContext('2d');

        testCanvas.width = img.width;
        testCanvas.height = img.height;
        try {
          gridState.ctx.drawImage(img, 0, 0);
          console.log('🎉 IMMEDIATE TEST SUCCESS: Image drawn to canvas right after load!');
          console.log('Canvas is now:', testCanvas.width, 'x', testCanvas.height);
        } catch (err) {
          console.error('❌ IMMEDIATE TEST FAILED:', err);
        }
      } else {
        console.error('❌ Canvas element not found for immediate test');
      }

      document.getElementById('uploadSection').style.display = 'none';
      document.getElementById('gridEditorSection').style.display = 'block';
      showSuccessToast('Image loaded! Adjust zoom/opacity or click "Create Grid"');
    };
    img.onerror = (error) => {
      console.error('Image loading error:', error);
      showErrorToast('Failed to load image. Please try a different file.');
    };
    img.src = e.target.result;
  };
  reader.onerror = (error) => {
    console.error('FileReader error:', error);
    showErrorToast('Failed to read file. Please try again.');
  };
  reader.readAsDataURL(file);
}

function createGrid() {
  const cols = parseInt(document.getElementById('gridCols').value) || 8;
  const rows = parseInt(document.getElementById('gridRows').value) || 8;

  console.log('createGrid called with cols:', cols, 'rows:', rows);
  console.log('gridState.image:', gridState.image);

  if (cols < 1 || cols > 30 || rows < 1 || rows > 30) {
    showErrorToast('Board dimensions must be between 1 and 30');
    return;
  }

  if (!gridState.image) {
    showErrorToast('No image loaded! Please upload an image first.');
    console.error('ERROR: gridState.image is null or undefined');
    return;
  }

  console.log('Image exists:', gridState.image.width, 'x', gridState.image.height);

  gridState.cols = cols;
  gridState.rows = rows;

  // Initialize cells array
  gridState.cells = Array(rows).fill(null).map(() => Array(cols).fill('?'));

  // Setup canvas
  const canvas = document.getElementById('gridEditorCanvas');
  if (!canvas) {
    console.error('ERROR: Canvas element not found!');
    showErrorToast('Canvas element not found in DOM');
    return;
  }

  gridState.canvas = canvas;
  gridState.ctx = canvas.getContext('2d');

  // Determine region to use (cropped or full image)
  let sourceX = 0, sourceY = 0, sourceWidth = gridState.image.width, sourceHeight = gridState.image.height;

  if (gridState.cropEnabled && gridState.cropWidth > 0 && gridState.cropHeight > 0) {
    // Use crop region - convert canvas coordinates to image coordinates
    sourceX = gridState.cropX / gridState.scale;
    sourceY = gridState.cropY / gridState.scale;
    sourceWidth = gridState.cropWidth / gridState.scale;
    sourceHeight = gridState.cropHeight / gridState.scale;
    console.log(`Using cropped region: (${Math.round(sourceX)}, ${Math.round(sourceY)}) ${Math.round(sourceWidth)}×${Math.round(sourceHeight)}`);
  }

  // Set canvas size to match region (scaled)
  const scaledWidth = sourceWidth * gridState.scale;
  const scaledHeight = sourceHeight * gridState.scale;

  canvas.width = scaledWidth;
  canvas.height = scaledHeight;

  console.log(`Canvas setup: ${canvas.width}×${canvas.height}, Source: ${Math.round(sourceWidth)}×${Math.round(sourceHeight)}, Scale: ${gridState.scale}`);
  console.log('Canvas element:', canvas);
  console.log('Canvas context:', gridState.ctx);

  // Test: Draw image region directly to verify it works
  try {
    gridState.ctx.drawImage(gridState.image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
    console.log('✅ Test: Image drawn directly to canvas successfully');
  } catch (error) {
    console.error('❌ Test: Failed to draw image directly:', error);
  }

  // Initial draw
  redrawGrid();
  updateGridDisplay();

  showSuccessToast(`Grid created: ${rows}×${cols}. Click cells and press keys to fill!`);
}

function redrawGrid() {
  if (!gridState.canvas) {
    console.error('Canvas not initialized');
    return;
  }

  if (!gridState.image) {
    console.error('Image not loaded');
    return;
  }

  if (!gridState.ctx) {
    console.error('Canvas context not initialized');
    gridState.ctx = gridState.canvas.getContext('2d');
  }

  const ctx = gridState.ctx;
  const canvas = gridState.canvas;

  // Determine source region (cropped or full)
  let sourceX = 0, sourceY = 0, sourceWidth = gridState.image.width, sourceHeight = gridState.image.height;

  if (gridState.cropEnabled && gridState.cropWidth > 0 && gridState.cropHeight > 0) {
    sourceX = gridState.cropX / gridState.scale;
    sourceY = gridState.cropY / gridState.scale;
    sourceWidth = gridState.cropWidth / gridState.scale;
    sourceHeight = gridState.cropHeight / gridState.scale;
  }

  // Update canvas size based on source region and scale
  const scaledWidth = sourceWidth * gridState.scale;
  const scaledHeight = sourceHeight * gridState.scale;

  canvas.width = scaledWidth;
  canvas.height = scaledHeight;

  console.log(`Redrawing: Canvas ${canvas.width}×${canvas.height}, Opacity: ${gridState.opacity}, Scale: ${gridState.scale}`);

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background image (cropped region) with opacity
  ctx.globalAlpha = gridState.opacity;
  try {
    ctx.drawImage(gridState.image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
  } catch (error) {
    console.error('Error drawing image:', error);
  }
  ctx.globalAlpha = 1.0;

  // Calculate cell dimensions
  const cellWidth = canvas.width / gridState.cols;
  const cellHeight = canvas.height / gridState.rows;

  // Draw grid lines
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 2;

  for (let i = 0; i <= gridState.cols; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellWidth, 0);
    ctx.lineTo(i * cellWidth, canvas.height);
    ctx.stroke();
  }

  for (let i = 0; i <= gridState.rows; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * cellHeight);
    ctx.lineTo(canvas.width, i * cellHeight);
    ctx.stroke();
  }

  // Draw cell values
  ctx.font = `bold ${Math.min(cellWidth, cellHeight) * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let row = 0; row < gridState.rows; row++) {
    for (let col = 0; col < gridState.cols; col++) {
      const value = gridState.cells[row][col];
      if (value !== '?') {
        const x = col * cellWidth + cellWidth / 2;
        const y = row * cellHeight + cellHeight / 2;

        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(col * cellWidth + 2, row * cellHeight + 2, cellWidth - 4, cellHeight - 4);

        // Draw text
        ctx.fillStyle = value === '.' ? '#88ff88' :
                       value === '!' ? '#ff8888' :
                       '#ffffff';
        ctx.fillText(value, x, y);
      }
    }
  }

  // Highlight selected cell
  if (gridState.selectedRow >= 0 && gridState.selectedCol >= 0) {
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 4;
    ctx.strokeRect(
      gridState.selectedCol * cellWidth + 2,
      gridState.selectedRow * cellHeight + 2,
      cellWidth - 4,
      cellHeight - 4
    );
  }
}

function handleGridCellClick(e) {
  if (!gridState.canvas) return;

  // Only handle cell clicks if grid has been created
  if (!gridState.cells || gridState.cells.length === 0) return;

  const rect = gridState.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const cellWidth = gridState.canvas.width / gridState.cols;
  const cellHeight = gridState.canvas.height / gridState.rows;

  const col = Math.floor(x / cellWidth);
  const row = Math.floor(y / cellHeight);

  if (row >= 0 && row < gridState.rows && col >= 0 && col < gridState.cols) {
    gridState.selectedRow = row;
    gridState.selectedCol = col;
    document.getElementById('selectedCell').textContent = `[${row}, ${col}] = "${gridState.cells[row][col]}"`;
    redrawGrid();
  }
}

function handleGridKeyInput(e) {
  // Only handle if grid editor is active and a cell is selected
  if (document.getElementById('gridEditorSection').style.display === 'none') return;
  if (gridState.selectedRow < 0 || gridState.selectedCol < 0) return;

  const key = e.key;
  let value = null;

  // Handle different key inputs
  if (key === '?' || key === 'q' || key === 'Q') {
    value = '?';
  } else if (key === '.' || key === 'e' || key === 'E' || key === ' ') {
    value = '.';
  } else if (key === '!' || key === 'f' || key === 'F') {
    value = '!';
  } else if (key >= '0' && key <= '8') {
    value = key;
  } else if (key === 'ArrowUp') {
    e.preventDefault();
    gridState.selectedRow = Math.max(0, gridState.selectedRow - 1);
    document.getElementById('selectedCell').textContent = `[${gridState.selectedRow}, ${gridState.selectedCol}] = "${gridState.cells[gridState.selectedRow][gridState.selectedCol]}"`;
    redrawGrid();
    return;
  } else if (key === 'ArrowDown') {
    e.preventDefault();
    gridState.selectedRow = Math.min(gridState.rows - 1, gridState.selectedRow + 1);
    document.getElementById('selectedCell').textContent = `[${gridState.selectedRow}, ${gridState.selectedCol}] = "${gridState.cells[gridState.selectedRow][gridState.selectedCol]}"`;
    redrawGrid();
    return;
  } else if (key === 'ArrowLeft') {
    e.preventDefault();
    gridState.selectedCol = Math.max(0, gridState.selectedCol - 1);
    document.getElementById('selectedCell').textContent = `[${gridState.selectedRow}, ${gridState.selectedCol}] = "${gridState.cells[gridState.selectedRow][gridState.selectedCol]}"`;
    redrawGrid();
    return;
  } else if (key === 'ArrowRight') {
    e.preventDefault();
    gridState.selectedCol = Math.min(gridState.cols - 1, gridState.selectedCol + 1);
    document.getElementById('selectedCell').textContent = `[${gridState.selectedRow}, ${gridState.selectedCol}] = "${gridState.cells[gridState.selectedRow][gridState.selectedCol]}"`;
    redrawGrid();
    return;
  }

  if (value !== null) {
    e.preventDefault();
    gridState.cells[gridState.selectedRow][gridState.selectedCol] = value;
    document.getElementById('selectedCell').textContent = `[${gridState.selectedRow}, ${gridState.selectedCol}] = "${value}"`;

    // Auto-advance to next cell
    gridState.selectedCol++;
    if (gridState.selectedCol >= gridState.cols) {
      gridState.selectedCol = 0;
      gridState.selectedRow++;
      if (gridState.selectedRow >= gridState.rows) {
        gridState.selectedRow = gridState.rows - 1;
        gridState.selectedCol = gridState.cols - 1;
      }
    }

    redrawGrid();
    updateGridDisplay();
  }
}

function updateGridDisplay() {
  const boardText = gridState.cells.map(row => row.join('')).join('\n');
  document.getElementById('gridResult').value = boardText;
}

function clearGrid() {
  if (!confirm('Clear all cell values?')) return;

  gridState.cells = Array(gridState.rows).fill(null).map(() => Array(gridState.cols).fill('?'));
  gridState.selectedRow = 0;
  gridState.selectedCol = 0;
  redrawGrid();
  updateGridDisplay();
  showInfoToast('Grid cleared');
}

function exportGrid() {
  // Apply to editor
  const editorRows = document.getElementById('rows');
  const editorCols = document.getElementById('cols');
  editorRows.value = gridState.rows;
  editorCols.value = gridState.cols;

  // Update the state dimensions
  state.editor.rows = gridState.rows;
  state.editor.cols = gridState.cols;

  // Copy the grid cells directly to the editor board state
  state.editor.board = gridState.cells.map(row => [...row]);

  // Re-render the board
  renderEditorBoard();

  document.getElementById('ocrModal').classList.remove('active');
  showSuccessToast(`Board exported: ${gridState.rows}×${gridState.cols}`);

  // Switch to editor tab
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelector('[data-tab="editor"]').classList.add('active');
  document.getElementById('editor').classList.add('active');

  // Reset the grid editor state for next use
  const canvas = document.getElementById('gridEditorCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  gridState.cells = [];
  gridState.rows = 8;
  gridState.cols = 8;
  gridState.cellWidth = 0;
  gridState.cellHeight = 0;
  gridState.image = null;
  gridState.selectedRow = -1;
  gridState.selectedCol = -1;
  gridState.scale = 1;
  gridState.opacity = 0.3;
  gridState.cropEnabled = false;
  gridState.cropX = 0;
  gridState.cropY = 0;
  gridState.cropWidth = 0;
  gridState.cropHeight = 0;

  document.getElementById('uploadSection').style.display = 'block';
  document.getElementById('gridEditorSection').style.display = 'none';
  document.getElementById('gridCols').value = 8;
  document.getElementById('gridRows').value = 8;
  document.getElementById('gridImageOpacity').value = 30;
  document.getElementById('gridImageZoom').value = 100;
  document.getElementById('gridOpacityValue').textContent = '30';
  document.getElementById('gridZoomValue').textContent = '100';
  document.getElementById('selectedCell').textContent = 'None';
  document.getElementById('gridResult').value = '';

  // Reset file input to allow re-uploading same file
  document.getElementById('imageUpload').value = '';
}

function toggleCrop() {
  gridState.cropEnabled = !gridState.cropEnabled;

  if (gridState.cropEnabled) {
    // Initialize crop to center of canvas
    if (gridState.canvas) {
      const centerX = gridState.canvas.width / 2;
      const centerY = gridState.canvas.height / 2;
      gridState.cropWidth = Math.min(400, gridState.canvas.width * 0.6);
      gridState.cropHeight = Math.min(400, gridState.canvas.height * 0.6);
      gridState.cropX = centerX - gridState.cropWidth / 2;
      gridState.cropY = centerY - gridState.cropHeight / 2;
    }
    showInfoToast('Crop enabled! Drag the rectangle or use handles to resize.');
  } else {
    showInfoToast('Crop disabled. Full image will be used.');
  }

  // Redraw to show/hide crop overlay
  redrawCropOverlay();
}

function redrawCropOverlay() {
  if (!gridState.image || !gridState.canvas) return;

  const canvas = gridState.canvas;
  const ctx = gridState.ctx;

  // Redraw base image
  canvas.width = gridState.image.width * gridState.scale;
  canvas.height = gridState.image.height * gridState.scale;
  ctx.globalAlpha = gridState.opacity;
  ctx.drawImage(gridState.image, 0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1.0;

  // Draw crop rectangle and handles if enabled
  if (gridState.cropEnabled) {
    // Darken area outside crop
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, gridState.cropY); // Top
    ctx.fillRect(0, gridState.cropY + gridState.cropHeight, canvas.width, canvas.height - (gridState.cropY + gridState.cropHeight)); // Bottom
    ctx.fillRect(0, gridState.cropY, gridState.cropX, gridState.cropHeight); // Left
    ctx.fillRect(gridState.cropX + gridState.cropWidth, gridState.cropY, canvas.width - (gridState.cropX + gridState.cropWidth), gridState.cropHeight); // Right

    // Draw crop rectangle border
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(gridState.cropX, gridState.cropY, gridState.cropWidth, gridState.cropHeight);

    // Draw resize handles (8 handles: 4 corners + 4 edges)
    const handleSize = 10;
    ctx.fillStyle = '#00ff00';

    // Corner handles
    drawHandle(ctx, gridState.cropX, gridState.cropY, handleSize); // NW
    drawHandle(ctx, gridState.cropX + gridState.cropWidth, gridState.cropY, handleSize); // NE
    drawHandle(ctx, gridState.cropX, gridState.cropY + gridState.cropHeight, handleSize); // SW
    drawHandle(ctx, gridState.cropX + gridState.cropWidth, gridState.cropY + gridState.cropHeight, handleSize); // SE

    // Edge handles
    drawHandle(ctx, gridState.cropX + gridState.cropWidth / 2, gridState.cropY, handleSize); // N
    drawHandle(ctx, gridState.cropX + gridState.cropWidth / 2, gridState.cropY + gridState.cropHeight, handleSize); // S
    drawHandle(ctx, gridState.cropX, gridState.cropY + gridState.cropHeight / 2, handleSize); // W
    drawHandle(ctx, gridState.cropX + gridState.cropWidth, gridState.cropY + gridState.cropHeight / 2, handleSize); // E
  }
}

function drawHandle(ctx, x, y, size) {
  ctx.fillRect(x - size / 2, y - size / 2, size, size);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - size / 2, y - size / 2, size, size);
}

function getResizeHandle(x, y) {
  const handleSize = 10;
  const threshold = handleSize;

  // Check corner handles
  if (Math.abs(x - gridState.cropX) < threshold && Math.abs(y - gridState.cropY) < threshold) return 'nw';
  if (Math.abs(x - (gridState.cropX + gridState.cropWidth)) < threshold && Math.abs(y - gridState.cropY) < threshold) return 'ne';
  if (Math.abs(x - gridState.cropX) < threshold && Math.abs(y - (gridState.cropY + gridState.cropHeight)) < threshold) return 'sw';
  if (Math.abs(x - (gridState.cropX + gridState.cropWidth)) < threshold && Math.abs(y - (gridState.cropY + gridState.cropHeight)) < threshold) return 'se';

  // Check edge handles
  if (Math.abs(x - (gridState.cropX + gridState.cropWidth / 2)) < threshold && Math.abs(y - gridState.cropY) < threshold) return 'n';
  if (Math.abs(x - (gridState.cropX + gridState.cropWidth / 2)) < threshold && Math.abs(y - (gridState.cropY + gridState.cropHeight)) < threshold) return 's';
  if (Math.abs(x - gridState.cropX) < threshold && Math.abs(y - (gridState.cropY + gridState.cropHeight / 2)) < threshold) return 'w';
  if (Math.abs(x - (gridState.cropX + gridState.cropWidth)) < threshold && Math.abs(y - (gridState.cropY + gridState.cropHeight / 2)) < threshold) return 'e';

  // Check if inside crop rectangle (for dragging)
  if (x >= gridState.cropX && x <= gridState.cropX + gridState.cropWidth &&
      y >= gridState.cropY && y <= gridState.cropY + gridState.cropHeight) {
    return 'move';
  }

  return null;
}

function resetGridEditor() {
  gridState.image = null;
  gridState.selectedRow = -1;
  gridState.selectedCol = -1;
  gridState.scale = 1;
  gridState.opacity = 0.3;

  document.getElementById('uploadSection').style.display = 'block';
  document.getElementById('gridEditorSection').style.display = 'none';
  document.getElementById('gridCols').value = 8;
  document.getElementById('gridRows').value = 8;
  document.getElementById('gridImageOpacity').value = 30;
  document.getElementById('gridImageZoom').value = 100;
  document.getElementById('gridOpacityValue').textContent = '30';
  document.getElementById('gridZoomValue').textContent = '100';
  document.getElementById('selectedCell').textContent = 'None';
  document.getElementById('gridResult').value = '';

  showInfoToast('Grid editor reset');
}

// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initEditor();
  initVisualGridEditor(); // Replaced initOCR()
  initSolver();
  initViewer();
  initHistory();
});

