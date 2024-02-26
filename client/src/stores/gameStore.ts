import { writable } from "svelte/store";
import TileClass from '../classes/Tile';
import Game from "../classes/Game";
import ChipClass from "../classes/Chip";
import tileStore from "./tileStore";

const createGame = () => {
  const game = new Game();

  // Setting up the store
  const { subscribe, set } = writable(game);
  return {  
    subscribe,
    update: (replacement: Game) => set(replacement),
    setSelectedTile: (tile: TileClass | undefined) => {
      game.currentTile = tile
      if (tile){
        tileStore.updateHighlighting(game.possibleMoves)
      } else {
        tileStore.clearHighlighting();
      }
      set(game);
    },
    moveChip: (tile: TileClass) => {
      console.log(tile)
      // Get chip from existing tile
      const chip: ChipClass = game.currentTile?.chip!;
      // Remove from current tile
      game.currentTile!.chip = undefined;
      // Store original tile
      const originalTile = game.currentTile!;
      // Forget current tile
      game.currentTile = undefined;
      // Put chip on next tile
      tile.chip = chip;
      // Clear highlighting
      tileStore.clearHighlighting();
      // If a piece was jumped, try to remove it
      tileStore.removeJumpedChip(originalTile, tile)
      set(game);
    },
    setPossibleMoves: (moves: number[][]) => {
      game.possibleMoves = moves;
      // Clear existing highlighting
      tileStore.clearHighlighting();
      // Set new highlighting
      tileStore.updateHighlighting(moves);
      set(game);
    },
  };
}

const gameStore = createGame();
export default gameStore;
