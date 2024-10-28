import { sendToEveryone } from "..";
import db from "../db/conn";
import { GameActionProps } from "../interfaces/GameActionProps";
import { IOngoingGame } from "../interfaces/IOngoingGame";
import { MoveRequestMessage, PlayerPosition, GameState, GameStateMessage, MessageType, BoardStateMessage } from "../interfaces/messages";
import { getPossibleMoves } from "./getPossibleJumps";

const ongoingGames = db.collection<IOngoingGame>('ongoingGames');

export const moveRequest = async (props: GameActionProps) => {
  const { message, existingGame, gameId } = props;
  const findById = { _id: gameId }

  const moveRequest = message as MoveRequestMessage;

  // Check if requested move is legal
  // FIXME: Assuming it is for now

  // Update board with move
  existingGame.tiles[moveRequest.to.x][moveRequest.to.y].chip = moveRequest.from.chip;
  existingGame.tiles[moveRequest.from.x][moveRequest.from.y].chip = undefined;

  // Check if piece was jumped
  let pieceJumped = false;
  if (Math.abs(moveRequest.from.x - moveRequest.to.x) > 1) {
    // Jump chip must have been of other player. Can just delete.
    existingGame.tiles[Math.max(moveRequest.from.x, moveRequest.to.x) - 1][Math.max(moveRequest.from.y, moveRequest.to.y) - 1].chip = undefined;
    pieceJumped = true;
  }

  // Should it be kinged?
  // Player 1 has reached top row.
  if (moveRequest.to.x === 0 && existingGame.tiles[moveRequest.to.x][moveRequest.to.y].chip!.player === PlayerPosition.ONE) {
    existingGame.tiles[moveRequest.to.x][moveRequest.to.y].chip!.isKinged = true;
  }
  // Player 2 has reached bottom row.
  if (moveRequest.to.x === existingGame.tiles.length - 1 && existingGame.tiles[moveRequest.to.x][moveRequest.to.y].chip!.player === PlayerPosition.TWO) {
    existingGame.tiles[moveRequest.to.x][moveRequest.to.y].chip!.isKinged = true;
  }

  // Should that chip continue?
  const tileThatMoved = existingGame.tiles[moveRequest.to.x][moveRequest.to.y];
  const possibleMoves = getPossibleMoves(tileThatMoved, existingGame.tiles);

  // Did anyone win this time? There should be 0 of one player's chips.
  const tiles = existingGame.tiles.flat(1);
  const redCount = tiles.reduce((acc, cur) => {
    if (cur.chip?.player === PlayerPosition.ONE) return acc + 1;
    else return acc;
  }, 0);
  const blackCount = tiles.reduce((acc, cur) => {
    if (cur.chip?.player === PlayerPosition.TWO) return acc + 1;
    else return acc;
  }, 0)

  // Win condition met
  if (redCount === 0 || blackCount === 0) {
    existingGame.state = GameState.GAME_END;
    existingGame.winner = redCount === 0 ? PlayerPosition.TWO : PlayerPosition.ONE;
    existingGame.winReason = 'Opponent Defeated';
    // Send updated the state of the game
    const newGameState: GameStateMessage = {
      type: MessageType.GAME_STATE,
      state: existingGame.state,
      playerTurn: existingGame.playerTurn,
      winner: existingGame.winner,
      winReason: existingGame.winReason,
      forcedJumps: [],
      gameId,
    }
    sendToEveryone(JSON.stringify(newGameState), gameId.toString());
  } else if (pieceJumped && possibleMoves.length > 0) {
    // Chip should continue jumping
    existingGame.state = GameState.PLAYER_CONTINUE;
    // Saying that 
    existingGame.forcedJumps = [{
      x: moveRequest.to.x,
      y: moveRequest.to.y,
    }];
    await ongoingGames.updateOne(findById, {
      $set: existingGame
    });
    // Return new game state
    const gameState: GameStateMessage = {
      type: MessageType.GAME_STATE,
      state: existingGame.state,
      playerTurn: existingGame.playerTurn,
      forcedJumps: existingGame.forcedJumps,
      gameId,
    };
    sendToEveryone(JSON.stringify(gameState), gameId.toString());
  } else {
    // Update state and database
    existingGame.state = GameState.PLAYER_DUCK;
    await ongoingGames.updateOne(findById, {
      $set: existingGame
    })
    // Send updated the state of the game
    const nextState: GameStateMessage = {
      type: MessageType.GAME_STATE,
      state: existingGame.state,
      playerTurn: existingGame.playerTurn,
      forcedJumps: [],
      gameId,
    };
    sendToEveryone(JSON.stringify(nextState), gameId.toString());
  }
  // Update database
  await ongoingGames.updateOne(findById, {
    $set: existingGame
  })
  // Return new board state
  const boardState: BoardStateMessage = {
    type: MessageType.BOARD_STATE,
    tiles: existingGame.tiles,
    gameId,
  }
  sendToEveryone(JSON.stringify(boardState), gameId.toString());

  // Game could end in this. Delete the game if true;
  if (existingGame.state === GameState.GAME_END) {
    ongoingGames.deleteOne(findById);
  }
}
