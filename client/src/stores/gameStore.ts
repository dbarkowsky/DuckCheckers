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
    setSelectedTile: (tile: TileClass) => game.currentTile = tile,
    moveChip: (tile: TileClass) => {
      console.log(tile)
      // Get chip from existing tile
      const chip: ChipClass = game.currentTile?.chip!;
      // Remove from current tile
      game.currentTile!.chip = undefined;
      // Forget current tile
      game.currentTile = undefined;
      // Put chip on next tile
      tile.chip = chip;
      set(game);
    }
  };
}

const gameStore = createGame();
export default gameStore;
