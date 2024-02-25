import TileClass from "../classes/Tile";
import tileStore from "../stores/tileStore";

// TODO: Chips shouldn't be able to move backwards unless king'd
const getPossibleMoves = (tile: TileClass) => {
  const relativePositions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  return relativePositions.map(diff => {
    const [x, y] = diff;
    // If diagonal is occupied by opponent...
    if (tileStore.hasOpponentChip(tile.x + x, tile.y + y, tile)){
      // Add the jump position
      return [tile.x + (x * 2), tile.y + (y * 2)];
    } else {
      // Add the adjacent diagonal position
      return [tile.x + x, tile.y + y];
    }
  })
  // filter out values outside board
  .filter(coord => tileStore.exists(coord[0], coord[1]))
  // filter out values with chips already
  .filter(coord => !tileStore.hasChip(coord[0], coord[1]));
}

export default getPossibleMoves;
