import { GRID_SIZE } from './ships.js';

// Simple AI that makes random shots
export class SimpleAI {
  constructor() {
    this.shotsFired = new Set();
  }

  // Generate a random shot that hasn't been fired yet
  generateShot() {
    let shot;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      shot = `${row},${col}`;
      attempts++;
    } while (this.shotsFired.has(shot) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      // If we can't find an unshot cell (shouldn't happen in normal play)
      return null;
    }

    this.shotsFired.add(shot);
    const [row, col] = shot.split(',').map(Number);
    return { row, col };
  }

  // Process the result of a shot (for future AI improvements)
  processShotResult(result) {
    // Simple AI doesn't use shot results for strategy
    // This method is here for future AI enhancements
  }

  // Reset AI state for a new game
  reset() {
    this.shotsFired.clear();
  }
}