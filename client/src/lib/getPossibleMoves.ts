import type { ITile } from '../stores/gameStore';
import gameStore from '../stores/gameStore';
import { PlayerPosition } from '../stores/localStore';

const getPossibleMoves = (tile: ITile, onlyJumps: boolean = false) => {
	const relativePositions = [
		{ x: -1, y: -1 },
		{ x: -1, y: 1 },
		{ x: 1, y: -1 },
		{ x: 1, y: 1 }
	];
	return (
		relativePositions
			.map((diff) => {
				const { x, y } = diff;
				// If diagonal is occupied by opponent...
				if (
					gameStore.tileExists(tile.x + x, tile.y + y) &&
					gameStore.tileHasOpponentChip(tile.x + x, tile.y + y, tile)
				) {
					// Add the jump position
					return { x: tile.x + x * 2, y: tile.y + y * 2 };
				} else {
					// Add the adjacent diagonal position
					return { x: tile.x + x, y: tile.y + y };
				}
			})
			// filter out values outside board
			.filter((coord) => gameStore.tileExists(coord.x, coord.y))
			// filter out values with chips already
			.filter((coord) => !gameStore.tileHasChip(coord.x, coord.y))
			// filter out reverse moves if the chip isn't kinged
			.filter((coord) => {
				if (!tile.chip?.isKinged) {
					// What is the difference for x coordinate?
					const xDifference = coord.x - tile.x;
					// Player 1 chips can only move negative x
					if (tile.chip?.player === PlayerPosition.ONE && xDifference < 0) {
						return true;
					}
					// Player 2 chips can only move positive x
					else if (tile.chip?.player === PlayerPosition.TWO && xDifference > 0) {
						return true;
					}
					return false;
				}
				return true;
			})
			// filter out non-jumps (adjacent spaces)
			.filter((coord) => (onlyJumps ? Math.abs(tile.x - coord.x) !== 1 : true))
	);
};

export default getPossibleMoves;
