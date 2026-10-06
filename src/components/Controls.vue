<template>
  <div class="controls">
    <h3>Game Controls</h3>

    <div class="game-info">
      <div class="info-item">
        <span class="label">Turn:</span>
        <span class="value">{{ isPlayerTurn ? 'Your Turn' : "AI's Turn" }}</span>
      </div>
      <div class="info-item">
        <span class="label">Your Ships:</span>
        <span class="value">{{ playerShipsRemaining }}/{{ totalShips }}</span>
      </div>
      <div class="info-item">
        <span class="label">AI Ships:</span>
        <span class="value">{{ aiShipsRemaining }}/{{ totalShips }}</span>
      </div>
    </div>

    <div class="message">
      {{ message }}
    </div>

    <div class="control-buttons">
      <button
        @click="resetGame"
        class="control-btn"
      >
        New Game
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Controls',
  props: {
    isPlayerTurn: {
      type: Boolean,
      required: true
    },
    playerShipsRemaining: {
      type: Number,
      required: true
    },
    aiShipsRemaining: {
      type: Number,
      required: true
    },
    totalShips: {
      type: Number,
      required: true
    },
    message: {
      type: String,
      default: 'Click on the AI board to fire!'
    }
  },
  methods: {
    resetGame() {
      this.$emit('reset-game');
    }
  }
}
</script>

<style scoped>
/* Component-specific styles are handled by main.css */
</style>