<template>
  <div class="placement-controls">
    <h3>Ship Placement</h3>
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

    <div v-if="placementMethod === 'manual' && currentShipIndex < totalShips" class="manual-placement">
      <div class="current-ship">
        <h4>Current Ship: {{ currentShip.name }} ({{ currentShip.size }} cells)</h4>
        <div class="ship-preview" :style="{ backgroundColor: currentShip.color }"></div>
      </div>

      <div class="placement-controls-buttons">
        <button
          @click="toggleOrientation"
          class="control-btn"
        >
          Orientation: {{ isHorizontal ? 'Horizontal' : 'Vertical' }}
        </button>
        <button
          @click="resetPlacement"
          class="control-btn"
        >
          Reset
        </button>
      </div>

      <div class="placement-info">
        <p>Click on the board to place your ship</p>
        <p>Ships placed: {{ shipsPlacedCount }} / {{ totalShips }}</p>
      </div>
    </div>

    <div v-if="placementMethod === 'auto'" class="auto-placement">
      <button
        @click="autoPlaceShips"
        class="auto-btn"
        :disabled="isPlacing"
      >
        {{ isPlacing ? 'Placing...' : 'Auto Place All Ships' }}
      </button>
    </div>



    <button
      v-if="allShipsPlaced"
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
    shipsPlacedCount: {
      type: Number,
      default: 0
    },
    currentShipIndex: {
      type: Number,
      default: 0
    },
    placementMethod: {
      type: String,
      default: 'auto'
    }
  },
  data() {
    return {
      isHorizontal: true
    };
  },
  computed: {
    currentShip() {
      return SHIP_CONFIGS[this.currentShipIndex];
    },
    totalShips() {
      return SHIP_CONFIGS.length;
    },
    allShipsPlaced() {
      return this.shipsPlacedCount === this.totalShips;
    }
  },
  methods: {
    setPlacementMethod(method) {
      this.$emit('placement-method-changed', method);
    },
    toggleOrientation() {
      this.isHorizontal = !this.isHorizontal;
      this.$emit('orientation-changed', this.isHorizontal);
    },
    resetPlacement() {
      this.$emit('placement-reset');
    },

    autoPlaceShips() {
      this.$emit('auto-place');
    },
    startGame() {
      this.$emit('start-game');
    },
    advanceToNextShip() {
      if (this.currentShipIndex < this.totalShips - 1) {
        this.currentShipIndex++;
      }
    },
    setCurrentShipIndex(index) {
      this.currentShipIndex = index;
    }
  }
}
</script>

<style scoped>
/* Component-specific styles are handled by main.css */
</style>