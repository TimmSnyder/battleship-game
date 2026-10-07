<template>
  <div class="placement-controls">
    <h3>Ship Placement</h3>

    <!-- Placement Method Selection -->
    <div class="placement-method">
      <button
        @click="setPlacementMethod('auto')"
        :class="{ active: placementMethod === 'auto' }"
        class="method-btn"
      >
        Auto Placement
      </button>
      <button
        @click="setPlacementMethod('manual')"
        :class="{ active: placementMethod === 'manual' }"
        class="method-btn"
      >
        Manual Placement
      </button>
    </div>

    <!-- Ship Status Panel -->
    <div class="ship-status-panel">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: placementProgress + '%' }"></div>
      </div>
      <div class="progress-text">{{ placedShips.length }} / {{ totalShips }} Ships Placed</div>
    </div>

    <!-- All Ships Overview -->
    <div class="ships-overview">
      <div
        v-for="(ship, index) in SHIP_CONFIGS"
        :key="ship.name"
        :class="['ship-item', { placed: placedShips.includes(index), current: currentShipIndex === index }]"
        @click="selectShip(index)"
        :style="{ cursor: placementMethod === 'manual' && !placedShips.includes(index) ? 'pointer' : 'default' }"
      >
        <div class="ship-icon" :style="{ backgroundColor: ship.color }"></div>
        <div class="ship-info">
          <span class="ship-name">{{ ship.name }}</span>
          <span class="ship-size">{{ ship.size }} cells</span>
        </div>
        <div class="ship-status">
          <span v-if="placedShips.includes(index)" class="status-placed">✓</span>
          <span v-else-if="currentShipIndex === index" class="status-current">⟳</span>
          <span v-else class="status-pending">○</span>
        </div>
      </div>
    </div>

    <!-- Manual Placement Controls -->
    <div v-if="placementMethod === 'manual' && currentShipIndex !== null && !placedShips.includes(currentShipIndex)" class="manual-placement">
      <div class="current-ship">
        <h4>Current Ship: {{ currentShip.name }}</h4>
        <div class="ship-preview-container">
          <div class="ship-preview" :style="{ backgroundColor: currentShip.color, width: (currentShip.size * 20) + 'px' }"></div>
        </div>
        <p class="ship-details">{{ currentShip.size }} cells • {{ isHorizontal ? 'Horizontal' : 'Vertical' }}</p>
      </div>

      <div class="placement-controls-buttons">
        <button
          @click="toggleOrientation"
          class="control-btn orientation-btn"
          title="Rotate ship (R key)"
        >
          <span class="icon-large">🔄</span> {{ isHorizontal ? 'Horizontal' : 'Vertical' }}
        </button>
        <button
          @click="resetPlacement"
          class="control-btn reset-btn"
          title="Clear all placements"
        >
          <span class="icon-large">↺</span> Reset
        </button>
      </div>

      <div class="placement-info">
        <p class="instruction">💡 Click on the grid to place your ship</p>
        <p class="shortcut">Press <kbd>🔄</kbd> to rotate orientation</p>
      </div>
    </div>

    <!-- Auto Placement Controls -->
    <div v-if="placementMethod === 'auto'" class="auto-placement">
      <button
        @click="autoPlaceShips"
        class="auto-btn"
        :disabled="isPlacing"
      >
        {{ isPlacing ? 'Placing...' : 'Auto Place All Ships' }}
      </button>
      <p class="auto-info">Randomly places all ships on your fleet</p>
    </div>

    <!-- Finish Placement Button -->
    <button
      v-if="allShipsPlaced && !placementFinished"
      @click="finishPlacement"
      class="finish-btn"
    >
      Finish Placement
    </button>

    <!-- Reset Button (when ships placed but not finished) -->
    <button
      v-if="allShipsPlaced && !placementFinished"
      @click="resetPlacement"
      class="reset-placement-btn"
    >
      Reset Board
    </button>

    <!-- Start Game Button -->
    <button
      v-if="allShipsPlaced && placementFinished"
      @click="startGame"
      class="start-btn"
    >
      Start Game
    </button>
  </div>
</template>

<script>
import { SHIP_CONFIGS } from '../game/ships.js';

export default {
  name: 'PlacementControls',
  props: {
    isPlacing: {
      type: Boolean,
      default: false
    },
    placedShips: {
      type: Array,
      default: () => []
    },
    currentShipIndex: {
      type: Number,
      default: null
    },
    placementMethod: {
      type: String,
      default: 'auto'
    }
  },
  data() {
    return {
      isHorizontal: true,
      SHIP_CONFIGS,
      placementFinished: false
    };
  },
  computed: {
    currentShip() {
      return this.currentShipIndex !== null ? SHIP_CONFIGS[this.currentShipIndex] : null;
    },
    totalShips() {
      return SHIP_CONFIGS.length;
    },
    allShipsPlaced() {
      return this.placedShips.length === this.totalShips;
    },
    placementProgress() {
      return (this.placedShips.length / this.totalShips) * 100;
    }
  },
  mounted() {
    window.addEventListener('keydown', this.handleKeyPress);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeyPress);
  },
  methods: {
    setPlacementMethod(method) {
      this.$emit('placement-method-changed', method);
    },
    selectShip(index) {
      if (this.placementMethod === 'manual' && !this.placedShips.includes(index)) {
        this.selectedShipIndex = index;
        this.$emit('ship-selected', index);
      }
    },
    finishPlacement() {
      this.placementFinished = true;
    },
    toggleOrientation() {
      this.isHorizontal = !this.isHorizontal;
      this.$emit('orientation-changed', this.isHorizontal);
    },
    resetPlacement() {
      this.placementFinished = false;
      this.$emit('placement-reset');
    },
    autoPlaceShips() {
      this.$emit('auto-place');
    },
    startGame() {
      this.$emit('start-game');
    },
    handleKeyPress(event) {
      if (this.placementMethod === 'manual' && event.key.toLowerCase() === 'r') {
        this.toggleOrientation();
      }
    }
  }
}
</script>

<style scoped>
.placement-controls {
  min-width: 320px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.placement-method {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.method-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #475569;
  background: #1e293b;
  color: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: all 0.2s;
}

.method-btn:hover {
  background: #334155;
  border-color: #6366f1;
}

.method-btn.active {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
}

/* Ship Status Panel */
.ship-status-panel {
  background: #1e293b;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.progress-bar {
  height: 8px;
  background: #334155;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.85rem;
  color: #cbd5e1;
  text-align: center;
  font-weight: 500;
}

/* Ships Overview */
.ships-overview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.ship-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #1e293b;
  border-radius: 8px;
  border: 1px solid #475569;
  transition: all 0.2s;
}

.ship-item.placed {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
}

.ship-item.current {
  background: rgba(99, 102, 241, 0.5);
  border-color: #6366f1;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.ship-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  flex-shrink: 0;
}

.ship-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ship-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #475569;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.ship-size {
  font-size: 0.75rem;
  color: #64748b;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.ship-status {
  font-size: 1.2rem;
  font-weight: bold;
}

.status-placed {
  color: #10b981;
}

.status-current {
  color: #6366f1;
}

.status-pending {
  color: #94a3b8;
}

/* Manual Placement */
.manual-placement {
  background: #1e293b;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.current-ship h4 {
  margin-bottom: 0.75rem;
  color: #f8fafc;
  font-size: 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  text-align: center;
}

.ship-preview-container {
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.ship-preview {
  height: 20px;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.ship-details {
  text-align: center;
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.placement-controls-buttons {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.control-btn {
  flex: 1;
  padding: 0.625rem 1rem;
  border: 1px solid #475569;
  background: #334155;
  color: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: all 0.2s;
}

.icon-large {
  font-size: 1.2rem;
  margin-right: 0.25rem;
}

.control-btn:hover {
  background: #1e293b;
  border-color: #6366f1;
}

.orientation-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  color: white;
}

.orientation-btn:hover {
  opacity: 0.9;
}

.reset-btn {
  color: #ef4444;
  border-color: #ef4444;
}

.reset-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}

.placement-info {
  text-align: center;
}

.instruction {
  font-size: 0.85rem;
  color: #cbd5e1;
  margin-bottom: 0.5rem;
}

.shortcut {
  font-size: 0.75rem;
  color: #94a3b8;
}

.shortcut kbd {
  background: #334155;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: monospace;
  border: 1px solid #475569;
  font-size: 1.2rem;
}

/* Auto Placement */
.auto-placement {
  text-align: center;
  margin-bottom: 1rem;
}

.auto-btn {
  width: 100%;
  padding: 0.875rem 1.5rem;
  border: 2px solid #6366f1;
  background: #6366f1;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: all 0.2s;
}

.auto-btn:hover:not(:disabled) {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.auto-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auto-info {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: #94a3b8;
}

/* Start Button */
.start-btn {
  width: 100%;
  padding: 0.875rem 1.5rem;
  border: 2px solid #10b981;
  background: #10b981;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: all 0.2s;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.start-btn:hover {
  background: #059669;
  border-color: #059669;
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

/* Finish Button */
.finish-btn {
  width: 100%;
  padding: 0.875rem 1.5rem;
  border: 2px solid #6366f1;
  background: #6366f1;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: all 0.2s;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.finish-btn:hover {
  background: #4f46e5;
  border-color: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

/* Reset Placement Button */
.reset-placement-btn {
  width: 100%;
  padding: 0.875rem 1.5rem;
  border: 2px solid #ef4444;
  background: #ef4444;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: all 0.2s;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  margin-top: 0.5rem;
}

.reset-placement-btn:hover {
  background: #dc2626;
  border-color: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}
</style>