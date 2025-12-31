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

  document.addEventListener('mouseup', () => {
    state.editor.isDrawing = false;
  });

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
}

function clearEditorBoard() {
  const { rows, cols } = state.editor;
  state.editor.board = Array.from({ length: rows }, () => Array(cols).fill('.'));
  renderEditorBoard();
}

function renderEditorBoard() {
  const boardEl = document.getElementById('editorBoard');
  const { board, cols } = state.editor;

  boardEl.innerHTML = '';
  boardEl.style.gridTemplateColumns = `repeat(${cols}, 35px)`;

  board.forEach((row, r) => {
    row.forEach((cell, c) => {
      const cellEl = document.createElement('div');
      cellEl.className = 'cell';
      cellEl.textContent = cell === '.' ? '' : cell;

      if (cell === '!') cellEl.classList.add('mine');
      if (cell === '?') cellEl.classList.add('flag');
      if (cell.match(/[0-8]/)) cellEl.classList.add('number');

      cellEl.onmousedown = (e) => {
        e.preventDefault();
        state.editor.isDrawing = true;
        handleCellChange(r, c);
      };

      cellEl.onmouseenter = () => {
        if (state.editor.isDrawing) {
          handleCellChange(r, c);
        }
      };

      cellEl.onmouseup = () => {
        state.editor.isDrawing = false;
      };

      boardEl.appendChild(cellEl);
    });
  });
}

function handleCellChange(r, c) {
  state.editor.board[r][c] = state.editor.pen;
  renderEditorBoard();
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
  const entry = {
    timestamp,
    inputBoard: state.solver.inputBoard,
    outputBoard: state.solver.outputBoard,
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
  for (let r = 0; r < nrows; r++) {
    for (let c = 0; c < ncols; c++) {
      if (solution[r][c] === 'o') safeCells++;
    }
  }

  return {
    solution,
    stats: {
      outlineSize: outlineList.length,
      clusters: 1, // Simplified - not doing cluster decomposition in JS
      configurations: configurations.length,
      safeCells
    }
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

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initEditor();
  initSolver();
  initViewer();
  initHistory();
});

