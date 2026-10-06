import { SHIP_CONFIGS, GRID_SIZE, COLUMN_LABELS, ROW_LABELS } from './ships.js';

// Create empty game board
export function createEmptyBoard() {
  return Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null)
  );
}

// Check if ship placement is valid
export function isValidPlacement(board, ship, row, col, isHorizontal) {
  const { size } = ship;

  // Check if ship goes out of bounds
  if (isHorizontal) {
    if (col + size > GRID_SIZE) return false;
  } else {
    if (row + size > GRID_SIZE) return false;
  }

  // Check for overlap with existing ships
  for (let i = 0; i < size; i++) {
    const checkRow = isHorizontal ? row : row + i;
    const checkCol = isHorizontal ? col + i : col;

    if (board[checkRow][checkCol] !== null) {
      return false;
    }
  }

  return true;
}

// Place ship on board
export function placeShip(board, ship, row, col, isHorizontal) {
  const newBoard = board.map(row => [...row]);
  const { size, name, color } = ship;

  for (let i = 0; i < size; i++) {
    const placeRow = isHorizontal ? row : row + i;
    const placeCol = isHorizontal ? col + i : col;

    newBoard[placeRow][placeCol] = {
      shipName: name,
      color: color,
      isHit: false
    };
  }

  return newBoard;
}

// Convert coordinate string (e.g., "A5") to row, col indices
export function coordinateToIndices(coordinate) {
  const colChar = coordinate.charAt(0).toUpperCase();
  const rowStr = coordinate.substring(1);

  const col = COLUMN_LABELS.indexOf(colChar);
  const row = ROW_LABELS.indexOf(rowStr);

  if (col === -1 || row === -1) {
    return null; // Invalid coordinate
  }

  return { row, col };
}

// Convert row, col indices to coordinate string
export function indicesToCoordinate(row, col) {
  return `${COLUMN_LABELS[col]}${ROW_LABELS[row]}`;
}

// Process a shot on a board
export function processShot(board, row, col) {
  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
    return { success: false, message: 'Invalid coordinates' };
  }

  const cell = board[row][col];

  if (cell === null) {
    // Miss
    return {
      success: true,
      isHit: false,
      message: 'Miss!',
      board: board
    };
  }

  if (cell.isHit) {
    return { success: false, message: 'Already targeted this cell' };
  }

  // Hit
  const newBoard = board.map(row => [...row]);
  newBoard[row][col] = { ...cell, isHit: true };

  // Check if ship is sunk
  const shipName = cell.shipName;
  const isSunk = checkIfShipSunk(newBoard, shipName);

  return {
    success: true,
    isHit: true,
    isSunk: isSunk,
    shipName: shipName,
    message: isSunk ? `Hit! You sunk the ${shipName}!` : 'Hit!',
    board: newBoard
  };
}

// Check if a ship is completely sunk
function checkIfShipSunk(board, shipName) {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = board[row][col];
      if (cell && cell.shipName === shipName && !cell.isHit) {
        return false; // Found an unhit part of the ship
      }
    }
  }
  return true; // All parts of the ship are hit
}

// Check if all ships are sunk (game over condition)
export function checkGameOver(board) {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = board[row][col];
      if (cell && !cell.isHit) {
        return false; // Found an unhit ship part
      }
    }
  }
  return true; // All ships are sunk
}

// Get statistics for a board
export function getBoardStats(board) {
  let totalShips = 0;
  let hits = 0;
  let sunkShips = new Set();

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = board[row][col];
      if (cell) {
        totalShips++;
        if (cell.isHit) {
          hits++;
          if (checkIfShipSunk(board, cell.shipName)) {
            sunkShips.add(cell.shipName);
          }
        }
      }
    }
  }

  return {
    totalShipCells: totalShips,
    hits: hits,
    misses: 0, // Will be tracked separately
    sunkShips: sunkShips.size,
    totalShips: SHIP_CONFIGS.length
  };
}

// Random ship placement for AI
export function randomShipPlacement() {
  const board = createEmptyBoard();
  const placedShips = [];

  for (const ship of SHIP_CONFIGS) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!placed && attempts < maxAttempts) {
      const isHorizontal = Math.random() < 0.5;
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);

      if (isValidPlacement(board, ship, row, col, isHorizontal)) {
        const newBoard = placeShip(board, ship, row, col, isHorizontal);
        board.splice(0, board.length, ...newBoard);
        placedShips.push({
          ship: ship,
          row: row,
          col: col,
          isHorizontal: isHorizontal
        });
        placed = true;
      }
      attempts++;
    }

    if (!placed) {
      console.error(`Failed to place ${ship.name} after ${maxAttempts} attempts`);
    }
  }

  return board;
}