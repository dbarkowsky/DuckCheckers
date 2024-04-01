import { writable } from "svelte/store";
import type { ITile } from "./gameStore";

export enum PlayerNumber {
  ONE,
  TWO,
  DUCK,
}

export interface ILocal {
  possibleMoves: {
    x: number;
    y: number;
  }[],
  isHovered?: { x: number, y: number } | undefined;
  selectedTile?: ITile;
  playerName?: string;
  playerNumber?: PlayerNumber;
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
        if (!tile) {
          // Clear possible moves
          original.possibleMoves = [];
        }
        return original;
      })
    },
    setPossibleMoves: (moves: { x: number, y: number }[]) =>
      update((original) => ({
        ...original,
        possibleMoves: moves
      })),
    setIsHovered: (coords: { x: number, y: number } | undefined) =>
      update((original) => ({
        ...original,
        isHovered: coords,
      })),
    setPlayer: (name: string, number: PlayerNumber) =>
      update((original) => ({
        ...original,
        playerName: name,
        playerNumber: number,
      }))

  };
}

const localStore = createLocal();
export default localStore;
