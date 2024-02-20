import { writable } from "svelte/store";
import TileClass from '../classes/Tile';
import ChipClass from "../classes/Chip";

const createTiles = () => {
  // Making blank tiles
  const blankArray = new Array(8).fill(new Array(8).fill(undefined));
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
  };
}

const tileStore = createTiles();
export default tileStore;
