import { writable } from "svelte/store";
import TileClass from '../classes/Tile';

const createGame = () => {
  

  const blankArray = new Array(8).fill(new Array(8).fill(undefined));
  const tiles = blankArray.map((row: [], rowIndex: number) => row.map((slot, slotIndex) => new TileClass((rowIndex + slotIndex) % 2 === 0, rowIndex, slotIndex)));
  const { subscribe, set } = writable(tiles);
  return {  
    print: () => tiles.forEach(row => row.forEach(tile => console.log(tile))),
    subscribe,
    update: (replacement: TileClass[][]) => set(replacement),
  };
}

const game = createGame();
export default game;
