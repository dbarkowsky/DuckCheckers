import TileClass from "../classes/Tile";
import tileStore from "../stores/tileStore";

const getPossibleMoves = (tile: TileClass) => {
  const relativePositions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  return relativePositions.map(diff => {
    const [x, y] = diff;
    // If diagonal is occupied by opponent...
    if (tileStore.exists(tile.x + x, tile.y +y) && tileStore.hasOpponentChip(tile.x + x, tile.y + y, tile)){
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
  .filter(coord => !tileStore.hasChip(coord[0], coord[1]))
  // filter out reverse moves if the chip isn't kinged
  .filter(coord => {
    if (!tile.chip?.isKinged){
      // What is the difference for x coordinate?
      const xDifference = coord[0] - tile.x;
      // Player 1 chips can only move negative x
      if (tile.chip?.player === 1 && xDifference < 0){
        return true;
      }
      // Player 2 chips can only move positive x
      else if (tile.chip?.player === 2 && xDifference > 0){
        return true;
      }
      return false;
    }
    return true;
  });
}

export default getPossibleMoves;
