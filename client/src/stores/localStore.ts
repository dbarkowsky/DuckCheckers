import { writable, get } from "svelte/store";
import TileClass from '../classes/Tile';
import ChipClass from "../classes/Chip";
import type { ITile } from "./gameStore";
import gameStore from "./gameStore";

export interface ILocal {
  possibleMoves: {
    x: number;
    y: number;
  }[],
  isHovered?: {x: number, y: number} | undefined;
  selectedTile?: ITile;
  playerName?: string;
  playerNumber?: number;
}

const createDefaultLocal = () => ({
  possibleMoves: [],
} as ILocal)

const createLocal = () => {
  // Setting up the store
  const local = createDefaultLocal();
  const { subscribe, set, update } = writable<ILocal>(local);

  return {  
    subscribe,
    replace: (replacement: ILocal) => set(replacement),
    setSelectedTile: (tile: ITile | undefined) => {
      update((original) => {
        original.selectedTile = tile;
        if (!tile){
          // Clear possible moves
          original.possibleMoves = [];
        }
        return original;
      })
    },
    setPossibleMoves: (moves: {x: number, y: number}[]) => {
      update((original) => {
        original.possibleMoves = moves;
        return original;
      })
    },
    setIsHovered: (coords: {x:number, y:number} | undefined) => {
      update((original) => {
        original.isHovered = coords;
        return original;
      })
    }
  };
}

const localStore = createLocal();
export default localStore;
