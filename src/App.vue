<template>
  <div id="app">
    <header>
      <h1>⚓ Battleship</h1>
      <p>Classic Naval Combat Game</p>
    </header>

    <main>
      <!-- Game Setup Phase -->
      <div v-if="gamePhase === 'setup'" class="game-setup">
        <GameBoard
          title="Your Fleet"
          :board="playerBoard"
          :show-ships="true"
          :is-interactive="placementMethod === 'manual' && currentShipIndex < totalShips && gamePhase === 'setup'"
          @cell-click="handleManualPlacement"
        />

        <PlacementControls
          :is-placing="isPlacing"
          :ships-placed-count="placedShips.length"
          :current-ship-index="currentShipIndex"
          :placement-method="placementMethod"
          @placement-method-changed="setPlacementMethod"
          @orientation-changed="setOrientation"
          @placement-reset="resetPlacement"
          @auto-place="autoPlaceShips"
          @start-game="startGame"
          @place-ship="handleManualPlacement"
        />
      </div>

      <!-- Game Playing Phase -->
      <div v-if="gamePhase === 'playing'" class="game-playing">
        <div class="boards-container">
          <GameBoard
            title="Your Fleet"
            :board="playerBoard"
            :show-ships="true"
            :is-interactive="false"
            :missed-shots="aiMissedShots"
          />

          <GameBoard
            title="Enemy Fleet"
            :board="aiBoard"
            :show-ships="false"
            :is-interactive="isPlayerTurn"
            :missed-shots="playerMissedShots"
            @cell-click="handlePlayerShot"
          />
        </div>

        <Controls
          :is-player-turn="isPlayerTurn"
          :player-ships-remaining="playerShipsRemaining"
          :ai-ships-remaining="aiShipsRemaining"
          :total-ships="totalShips"
          :message="gameMessage"
          @reset-game="resetGame"
        />
      </div>

      <!-- Game Over Phase -->
      <div v-if="gamePhase === 'gameover'" class="game-over">
        <h2>{{ gameOverMessage }}</h2>
        <div class="final-stats">
          <div class="stat">
            <span class="stat-label">Your Shots:</span>
            <span class="stat-value">{{ playerShots }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Your Hits:</span>
            <span class="stat-value">{{ playerHits }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Your Accuracy:</span>
            <span class="stat-value">{{ playerAccuracy }}%</span>
          </div>
        </div>
        <button @click="resetGame" class="play-again-btn">Play Again</button>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import GameBoard from './components/GameBoard.vue';
import PlacementControls from './components/PlacementControls.vue';
import Controls from './components/Controls.vue';
import {
  createEmptyBoard,
  isValidPlacement,
  placeShip,
  processShot,
  checkGameOver,
  randomShipPlacement,
  getBoardStats
} from './game/gameLogic.js';
import { SimpleAI } from './game/ai.js';
import { SHIP_CONFIGS } from './game/ships.js';

export default {
  name: 'App',
  components: {
    GameBoard,
    PlacementControls,
    Controls
  },
  setup() {
    // Game state
    const gamePhase = ref('setup'); // 'setup', 'playing', 'gameover'
    const placementMethod = ref('auto');
    const isHorizontal = ref(true);
    const isPlacing = ref(false);

    // Boards
    const playerBoard = ref(createEmptyBoard());
    const aiBoard = ref(createEmptyBoard());

    // AI
    const ai = ref(new SimpleAI());

    // Gameplay state
    const isPlayerTurn = ref(true);
    const currentShipIndex = ref(0);
    const placedShips = ref([]);

    // Tracking
    const aiMissedShots = ref(new Set());
    const playerMissedShots = ref(new Set());
    const playerShots = ref(0);
    const playerHits = ref(0);

    // Computed
    const totalShips = computed(() => SHIP_CONFIGS.length);
    const playerShipsRemaining = computed(() => {
      const stats = getBoardStats(playerBoard.value);
      return totalShips.value - stats.sunkShips;
    });
    const aiShipsRemaining = computed(() => {
      const stats = getBoardStats(aiBoard.value);
      return totalShips.value - stats.sunkShips;
    });
    const playerAccuracy = computed(() => {
      if (playerShots.value === 0) return 0;
      return Math.round((playerHits.value / playerShots.value) * 100);
    });
    const gameMessage = computed(() => {
      if (gamePhase.value === 'setup') {
        return 'Place your ships to begin the game!';
      }
      if (isPlayerTurn.value) {
        return 'Your turn! Click on the enemy fleet to fire!';
      }
      return 'AI is thinking...';
    });
    const gameOverMessage = computed(() => {
      if (playerShipsRemaining.value === 0) {
        return '💥 Game Over! You Lost!';
      }
      return '🎉 Congratulations! You Won!';
    });

    // Methods
    const setPlacementMethod = (method) => {
      placementMethod.value = method;
      // Reset placement state when switching methods
      if (method === 'manual' && placedShips.value.length === 0) {
        currentShipIndex.value = 0;
      } else if (method === 'auto') {
        // Reset current ship index when switching to auto
        currentShipIndex.value = 0;
      }
    };

    const setOrientation = (horizontal) => {
      isHorizontal.value = horizontal;
    };

    const resetPlacement = () => {
      playerBoard.value = createEmptyBoard();
      currentShipIndex.value = 0;
      placedShips.value = [];
      // Also reset AI board for consistency
      aiBoard.value = createEmptyBoard();
    };

    const autoPlaceShips = () => {
      isPlacing.value = true;
      setTimeout(() => {
        playerBoard.value = randomShipPlacement();
        placedShips.value = [...SHIP_CONFIGS];
        currentShipIndex.value = SHIP_CONFIGS.length;
        isPlacing.value = false;
      }, 500);
    };

    const handleManualPlacement = ({ row, col }) => {
      if (placementMethod.value !== 'manual') return;
      if (currentShipIndex.value >= SHIP_CONFIGS.length) return;

      const ship = SHIP_CONFIGS[currentShipIndex.value];
      if (isValidPlacement(playerBoard.value, ship, row, col, isHorizontal.value)) {
        playerBoard.value = placeShip(playerBoard.value, ship, row, col, isHorizontal.value);
        placedShips.value.push(ship);
        currentShipIndex.value++;
      }
    };

    const startGame = () => {
      // Place AI ships
      aiBoard.value = randomShipPlacement();
      ai.value.reset();

      // Reset game state
      isPlayerTurn.value = true;
      aiMissedShots.value.clear();
      playerShots.value = 0;
      playerHits.value = 0;

      gamePhase.value = 'playing';
    };

    const handlePlayerShot = ({ row, col }) => {
      if (!isPlayerTurn.value) return;

      const result = processShot(aiBoard.value, row, col);
      if (result.success) {
        aiBoard.value = result.board;
        playerShots.value++;
        if (result.isHit) {
          playerHits.value++;
        } else {
          // Track missed shots on enemy board
          playerMissedShots.value.add(`${row},${col}`);
        }

        // Check for game over
        if (checkGameOver(aiBoard.value)) {
          gamePhase.value = 'gameover';
          return;
        }

        // Switch to AI turn
        isPlayerTurn.value = false;
        setTimeout(aiTurn, 1000);
      }
    };

    const aiTurn = () => {
      const shot = ai.value.generateShot();
      if (shot) {
        const result = processShot(playerBoard.value, shot.row, shot.col);
        if (result.success) {
          playerBoard.value = result.board;
          if (!result.isHit) {
            aiMissedShots.value.add(`${shot.row},${shot.col}`);
          }

          // Check for game over
          if (checkGameOver(playerBoard.value)) {
            gamePhase.value = 'gameover';
            return;
          }
        }
      }

      // Switch back to player turn
      isPlayerTurn.value = true;
    };

    const resetGame = () => {
      gamePhase.value = 'setup';
      playerBoard.value = createEmptyBoard();
      aiBoard.value = createEmptyBoard();
      currentShipIndex.value = 0;
      placedShips.value = [];
      aiMissedShots.value.clear();
      playerMissedShots.value.clear();
      playerShots.value = 0;
      playerHits.value = 0;
      ai.value.reset();
    };

    return {
      gamePhase,
      placementMethod,
      isHorizontal,
      isPlacing,
      playerBoard,
      aiBoard,
      isPlayerTurn,
      aiMissedShots,
      playerMissedShots,
      playerShots,
      playerHits,
      totalShips,
      playerShipsRemaining,
      aiShipsRemaining,
      playerAccuracy,
      gameMessage,
      gameOverMessage,
      placedShips,
      currentShipIndex,
      setPlacementMethod,
      setOrientation,
      resetPlacement,
      autoPlaceShips,
      handleManualPlacement,
      startGame,
      handlePlayerShot,
      resetGame
    };
  }
};
</script>

<style scoped>
/* Component-specific styles are handled by main.css */
</style>