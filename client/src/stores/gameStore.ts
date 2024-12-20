import { get, writable } from 'svelte/store';
import { PlayerPosition } from './localStore';
import type { Location } from '$lib/messages';

export enum GameState {
	PLAYER_MOVE,
	PLAYER_CONTINUE,
	PLAYER_DUCK,
	GAME_END
}

export interface DuckSocket extends WebSocket {
	gameId: string;
	uuid: string;
	playerName: string;
}

export interface IGame {
	state: GameState;
	players: Record<number, DuckSocket | undefined>;
	playerTurn: PlayerPosition;
	tiles: ITile[][];
	gameName: string | undefined;
	winner?: PlayerPosition;
	winReason?: string;
	forcedJumps?: Location[];
	// Not all of these are actually optional when received...
	_id?: string;
	created?: Date;
	observers?: DuckSocket[];
}

export interface ITile {
	isRed: boolean;
	x: number;
	y: number;
	chip: IChip | undefined;
}

export interface IChip {
	player: PlayerPosition;
	colour: string;
	isKinged: boolean;
}

export const BOARD_SIZE = 8;

const createGame = () => {
	const CHIP_RED = '#eb1e1e';
	const CHIP_BLACK = '#262626';

	// Setting starting positions
	const blackChipLocations = [
		[0, 1],
		[0, 3],
		[0, 5],
		[0, 7],
		[1, 0],
		[1, 2],
		[1, 4],
		[1, 6],
		[2, 1],
		[2, 3],
		[2, 5],
		[2, 7]
	];

	const redChipLocations = [
		[5, 0],
		[5, 2],
		[5, 4],
		[5, 6],
		[6, 1],
		[6, 3],
		[6, 5],
		[6, 7],
		[7, 0],
		[7, 2],
		[7, 4],
		[7, 6]
	];

	const createChip = (x: number, y: number) => {
		const isRed = redChipLocations.some((coords) => coords[0] === x && coords[1] === y);
		const isBlack = blackChipLocations.some((coords) => coords[0] === x && coords[1] === y);
		if (!isRed && !isBlack) return undefined;
		return {
			player: isRed ? PlayerPosition.ONE : PlayerPosition.TWO,
			colour: isRed ? CHIP_RED : CHIP_BLACK,
			isKinged: false
		} as IChip;
	};

	const makeDefaultTiles = () => {
		// Making blank tiles
		const blankArray = new Array(BOARD_SIZE).fill(new Array(BOARD_SIZE).fill(undefined));
		const tiles = blankArray.map((row: [], rowIndex: number) =>
			row.map(
				(slot, slotIndex) =>
					({
						isRed: (rowIndex + slotIndex) % 2 === 0,
						x: rowIndex,
						y: slotIndex,
						chip: createChip(rowIndex, slotIndex)
					}) as ITile
			)
		);

		return tiles;
	};

	// Setting up the store
	const temporaryGameState = {
		state: GameState.PLAYER_MOVE,
		players: {
			1: undefined,
			2: undefined
		},
		playerTurn: PlayerPosition.ONE,
		tiles: makeDefaultTiles(),
		gameName: '',
		forcedJumps: []
	};

	const { subscribe, set, update } = writable<IGame>(temporaryGameState);
	return {
		subscribe,
		replace: (replacement: IGame) => set(replacement),
		tileExists: (x: number, y: number) => x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE,
		tileHasOpponentChip: (x: number, y: number, movingTile: ITile) =>
			get(gameStore).tiles[x][y].chip &&
			get(gameStore).tiles[x][y].chip?.player !== movingTile.chip?.player &&
			get(gameStore).tiles[x][y].chip?.player !== PlayerPosition.DUCK,
		tileHasChip: (x: number, y: number) =>
			get(gameStore).tiles[x][y].chip && get(gameStore).tiles[x][y].chip !== null,
		updateTiles: (newTiles: ITile[][]) => {
			if (newTiles) {
				update((original) => ({
					...original,
					tiles: newTiles
				}));
			}
		},
		updateState: (newState: GameState) =>
			update((original) => ({
				...original,
				state: newState
			})),
		updateTurn: (newTurn: PlayerPosition) =>
			update((original) => ({
				...original,
				playerTurn: newTurn
			})),
		updatePlayers: (players: Record<number, DuckSocket | undefined>, observers?: DuckSocket[]) =>
			update((original) => ({
				...original,
				players,
				observers
			})),
		updateForcedJumps: (forcedJumps?: Location[]) =>
			update((original) => ({
				...original,
				forcedJumps: forcedJumps ?? []
			})),
		updateGameName: (name: string | undefined) =>
			update((original) => ({
				...original,
				gameName: name
			})),
		setWinner: (winner?: PlayerPosition, reason?: string) =>
			update((original) => ({
				...original,
				winner,
				winReason: reason
			}))
	};
};

const gameStore = createGame();
export default gameStore;
