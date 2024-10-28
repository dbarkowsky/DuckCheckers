import { sendToEveryone } from "..";
import db from "../db/conn";
import { GameActionProps } from "../interfaces/GameActionProps";
import { IOngoingGame, Location } from "../interfaces/IOngoingGame";
import { DuckMessage, GameState, PlayerPosition, BoardStateMessage, MessageType, GameStateMessage, IChip } from "../interfaces/messages";
import { getPossibleMoves } from "./getPossibleJumps";

const ongoingGames = db.collection<IOngoingGame>('ongoingGames');

const CHIP_YELLOW = '#f5ff13'
const createDuck = () => ({
  player: PlayerPosition.DUCK,
  isKinged: false,
  colour: CHIP_YELLOW,
} as IChip)

export const duckPlacement = async (props: GameActionProps) => {
  const { existingGame, message, gameId } = props;
  const findById = { _id: gameId }

  // Get incoming message data
  const duckData = message as DuckMessage;
  // Can the duck be placed now?
  if (existingGame.state !== GameState.PLAYER_DUCK) return;
  // Is this valid duck placement?
  if (existingGame.tiles[duckData.tile.x][duckData.tile.y].chip) return;
  if ((duckData.tile.x + duckData.tile.y) % 2 === 0) return; // Only on black squares
  // Clear original duck from board
  const coords = {
    x: -1,
    y: -1,
  };
  let chipFound = false;
  for (let xIndex = 0; xIndex < existingGame.tiles.length && !chipFound; xIndex += 1) {
    const row = existingGame.tiles[xIndex];
    for (let yIndex = 0; yIndex < row.length && !chipFound; yIndex += 1) {
      const tile = row[yIndex];
      if (tile.chip?.player === PlayerPosition.DUCK) {
        coords.x = xIndex;
        coords.y = yIndex;
        chipFound = true;
      }
    }
  }
  if (chipFound && coords.x >= 0 && coords.y >= 0) {
    existingGame.tiles[coords.x][coords.y].chip = undefined;
  }
  // Set requested tile with duck
  existingGame.tiles[duckData.tile.x][duckData.tile.y].chip = createDuck();
  // Update state and player turn
  existingGame.state = GameState.PLAYER_MOVE;
  existingGame.playerTurn = existingGame.playerTurn === PlayerPosition.ONE ? PlayerPosition.TWO : PlayerPosition.ONE
  // Deterimine if other player now has mandatory jumps
  const forcedJumps: Location[] = [];
  let possibleMoveCount = 0;
  // Deduce moves and jumps
  // Does the next player even have a move still?
  existingGame.tiles.forEach(row => {
    row.forEach(tile => {
      if (tile.chip?.player === existingGame.playerTurn) {
        // Track forced moves
        if (getPossibleMoves(tile, existingGame.tiles, true).length > 0) {forcedJumps.push({ x: tile.x, y: tile.y });
      possibleMoveCount++;}
        // Otherwise, check for any move to make sure they aren't stuck
        else if (getPossibleMoves(tile, existingGame.tiles, false).length > 0) possibleMoveCount++;
      }
    })
  })
  existingGame.forcedJumps = forcedJumps;
  // Other player wins if no moves are available
  if (possibleMoveCount === 0){
    existingGame.state = GameState.GAME_END;
    existingGame.winReason = 'No available move';
    existingGame.winner = existingGame.playerTurn === PlayerPosition.TWO ? PlayerPosition.ONE : PlayerPosition.TWO;
  }
  // Update database
  await ongoingGames.updateOne(findById, {
    $set: existingGame
  })
  // Send back responses
  const duckResponse: BoardStateMessage = {
    type: MessageType.BOARD_STATE,
    tiles: existingGame.tiles,
    gameId,
  }
  sendToEveryone(JSON.stringify(duckResponse), gameId.toString());
  // Return new game state
  const gameState: GameStateMessage = {
    type: MessageType.GAME_STATE,
    state: existingGame.state,
    playerTurn: existingGame.playerTurn,
    forcedJumps: existingGame.forcedJumps,
    gameId,
  }
  sendToEveryone(JSON.stringify(gameState), gameId.toString());

  // Game could end in this. Delete the game if true;
  if (existingGame.state === GameState.GAME_END) {
    ongoingGames.deleteOne(findById);
  }
}
