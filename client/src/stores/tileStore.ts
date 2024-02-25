import { writable } from "svelte/store";
import TileClass from '../classes/Tile';
import ChipClass from "../classes/Chip";

const createTiles = () => {
  // Making blank tiles
  const BOARD_SIZE = 8;
  const blankArray = new Array(BOARD_SIZE).fill(new Array(BOARD_SIZE).fill(undefined));
  const tiles = blankArray.map((row: [], rowIndex: number) => row.map((slot, slotIndex) => new TileClass((rowIndex + slotIndex) % 2 === 0, rowIndex, slotIndex)));

  // Setting starting positions
  const blackChipLocations = [
    [0,1],[0,3],[0,5],[0,7],
    [1,0],[1,2],[1,4],[1,6],
    [2,1],[2,3],[2,5],[2,7]
  ];
  blackChipLocations.forEach(coord => tiles[coord[0]][coord[1]].chip = new ChipClass(0, '#262626'));

  const redChipLocations = [
    [5,0],[5,2],[5,4],[5,6],
    [6,1],[6,3],[6,5],[6,7],
    [7,0],[7,2],[7,4],[7,6],
  ];
  redChipLocations.forEach(coord => tiles[coord[0]][coord[1]].chip = new ChipClass(1, '#eb1e1e'));

  // Setting up the store
  const { subscribe, set } = writable(tiles);
  return {  
    print: () => tiles.forEach(row => row.forEach(tile => console.log(tile))),
    subscribe,
    update: (replacement: TileClass[][]) => set(replacement),
    hasChip: (x: number, y: number) => tiles[x][y].hasChip(),
    hasOpponentChip: (x: number, y: number, movingTile: TileClass) => tiles[x][y].hasChip() && tiles[x][y].chip?.player !== movingTile.chip?.player,
    exists: (x: number, y: number) => x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE,
    updateHighlighting: (moves: number[][]) => {
      moves.forEach((move: number[]) => tiles.flat().find((tile: TileClass) => tile.x === move[0] && tile.y === move[1])!.isHighlighted = true)
      set(tiles);
    },
    clearHighlighting: () => {
      tiles.forEach(row => row.forEach((tile: TileClass) => tile.isHighlighted = false));
      set(tiles);
    }
  };
}

const tileStore = createTiles();
export default tileStore;
