import { Location } from "../interfaces/IOngoingGame";
import { ITile, PlayerPosition } from "../interfaces/messages";

const BOARD_SIZE = 8;

export const getPossibleMoves = (tile: ITile, tiles: ITile[][], onlyJumps: boolean = false): Location[] => {
  const tileExists = (x: number, y: number) => x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
  const tileHasOpponentChip = (x: number, y: number, movingTile: ITile) => tiles[x][y].chip && tiles[x][y].chip?.player !== movingTile.chip?.player && tiles[x][y].chip?.player !== PlayerPosition.DUCK;
  const tileHasChip = (x: number, y: number) => tiles[x][y].chip && tiles[x][y].chip !== null;
  const relativePositions = [{ x: -1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: -1 }, { x: 1, y: 1 }];
  return relativePositions.map(diff => {
    const { x, y } = diff;
    // If diagonal is occupied by opponent...
    if (tileExists(tile.x + x, tile.y + y) && tileHasOpponentChip(tile.x + x, tile.y + y, tile)) {
      // Add the jump position
      return { x: tile.x + (x * 2), y: tile.y + (y * 2) };
    } else {
      // Add the adjacent diagonal position
      return { x: tile.x + x, y: tile.y + y };
    }
  })
    // filter out values outside board
    .filter(coord => tileExists(coord.x, coord.y))
    // filter out values with chips already
    .filter(coord => !tileHasChip(coord.x, coord.y))
    // filter out reverse moves if the chip isn't kinged
    .filter(coord => {
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
}
