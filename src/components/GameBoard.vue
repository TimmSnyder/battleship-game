<template>
  <div class="game-board">
    <h3 class="board-title">{{ title }}</h3>
    <div class="grid-container">
      <!-- Column labels -->
      <div class="column-labels">
        <div class="corner-cell"></div>
        <div
          v-for="col in 10"
          :key="col"
          class="label-cell"
        >
          {{ String.fromCharCode(64 + col) }}
        </div>
      </div>

      <!-- Grid with row labels and cells -->
      <div class="grid-rows">
        <div
          v-for="(row, rowIndex) in board"
          :key="rowIndex"
          class="grid-row"
        >
          <!-- Row label -->
          <div class="row-label">{{ rowIndex + 1 }}</div>

          <!-- Cells -->
          <div
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            class="cell"
            :class="getCellClass(cell, rowIndex, colIndex)"
            @click="handleCellClick(rowIndex, colIndex)"
          >
            <span v-if="cell && showShips" class="ship-marker" :style="{ backgroundColor: cell.color }"></span>
            <span v-if="cell && cell.isHit" class="hit-marker">×</span>
            <span v-if="!cell && isMissed(rowIndex, colIndex)" class="miss-marker">○</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameBoard',
  props: {
    title: {
      type: String,
      required: true
    },
    board: {
      type: Array,
      required: true
    },
    showShips: {
      type: Boolean,
      default: false
    },
    isInteractive: {
      type: Boolean,
      default: false
    },
    missedShots: {
      type: Set,
      default: () => new Set()
    }
  },

  methods: {
    getCellClass(cell, row, col) {
      const classes = [];
      if (cell && cell.isHit) {
        classes.push('hit');
      }
      if (!cell && this.isMissed(row, col)) {
        classes.push('miss');
      }
      if (this.isInteractive) {
        classes.push('interactive');
      }
      return classes.join(' ');
    },
    isMissed(row, col) {
      return this.missedShots.has(`${row},${col}`);
    },
    handleCellClick(row, col) {
      if (this.isInteractive) {
        this.$emit('cell-click', { row, col });
      }
    }
  }
}
</script>

<style scoped>
/* Component-specific styles are handled by main.css */
</style>