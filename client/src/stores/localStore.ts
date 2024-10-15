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
	playerName: string;
	playerPosition: PlayerPosition;
	taken: {
		'red': number;
		'black': number;
	}
}

const createDefaultLocal = () =>
	({
		possibleMoves: [],
		playerPosition: PlayerPosition.OBSERVER,
		playerName: '',
		taken: {
			'red': 0,
			'black': 0,
		}
	}) as ILocal;

	const startingChips = 12;
	const countChips = (colour: 'red' | 'black', tiles: ITile[][]) => {
		if (!tiles) return startingChips;
		let count = 0;
		const localTiles = tiles.flat(1);
		const red = '#eb1e1e';
		const black = '#262626';
		localTiles.forEach((tile) => {
			if (tile.chip?.colour === red && colour === 'red') count++;
			if (tile.chip?.colour === black && colour === 'black') count++;
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
		setPlayerName: (name: string) =>
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
			taken['red'] = startingChips - countChips('red', tiles);
			taken['black'] = startingChips - countChips('black', tiles);
			update((original) => ({
				...original,
				taken: taken,
			}))
		}
	};
};

const localStore = createLocal();
export default localStore;
