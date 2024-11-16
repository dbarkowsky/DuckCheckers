import { get, writable } from 'svelte/store';
import type { ITile } from './gameStore';

export enum PlayerPosition {
	ONE,
	TWO,
	DUCK,
	OBSERVER
}

export interface ILocal {
	possibleMoves: {
		x: number;
		y: number;
	}[];
	isHovered?: { x: number; y: number } | undefined;
	selectedTile?: ITile;
	playerName: string | null;
	playerPosition: PlayerPosition;
	taken: Record<number, number>;
}

const createDefaultLocal = () =>
	({
		possibleMoves: [],
		playerPosition: PlayerPosition.OBSERVER,
		playerName: null,
		taken: {
			1: 0,
			2: 0
		}
	}) as ILocal;

const startingChips = 12;
const countChips = (player: PlayerPosition, tiles: ITile[][]) => {
	if (!tiles) return startingChips;
	let count = 0;
	const localTiles = tiles.flat(1);
	localTiles.forEach((tile) => {
		if (tile.chip?.player === PlayerPosition.ONE && player === PlayerPosition.ONE) count++;
		if (tile.chip?.player === PlayerPosition.TWO && player === PlayerPosition.TWO) count++;
	});
	return count;
};

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
			});
		},
		setPossibleMoves: (moves: { x: number; y: number }[]) =>
			update((original) => ({
				...original,
				possibleMoves: moves
			})),
		setIsHovered: (coords: { x: number; y: number } | undefined) =>
			update((original) => ({
				...original,
				isHovered: coords
			})),
		setPlayerName: (name: string | null) =>
			update((original) => ({
				...original,
				playerName: name
			})),
		setPlayerPosition: (number: PlayerPosition) =>
			update((original) => ({
				...original,
				playerPosition: number
			})),
		updateTaken: (tiles: ITile[][]) => {
			const taken = get(localStore).taken;
			taken[PlayerPosition.ONE] = startingChips - countChips(PlayerPosition.ONE, tiles);
			taken[PlayerPosition.TWO] = startingChips - countChips(PlayerPosition.TWO, tiles);
			update((original) => ({
				...original,
				taken: taken
			}));
		}
	};
};

const localStore = createLocal();
export default localStore;
