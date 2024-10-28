import { sendToEveryone } from "..";
import db from "../db/conn";
import { GameActionProps } from "../interfaces/GameActionProps";
import { IOngoingGame } from "../interfaces/IOngoingGame";
import { ForfeitMessage, GameState, GameStateMessage, MessageType, PlayerPosition } from "../interfaces/messages";

const ongoingGames = db.collection<IOngoingGame>('ongoingGames');

export const forfeit = async (props: GameActionProps) => { 
   const { message, existingGame, gameId } = props;
   const forfeitMessage = message as ForfeitMessage;
   const findById = { _id: gameId }

   const winner = forfeitMessage.requestor === PlayerPosition.ONE ? PlayerPosition.TWO : PlayerPosition.ONE;
   existingGame.winner = winner;
   existingGame.state = GameState.GAME_END;
   existingGame.winReason = 'Forfeit';

   // Save the state of the existing game
  await ongoingGames.updateOne(findById, {
    $set: existingGame
  })

  const gameStateMessage: GameStateMessage = {
    playerTurn: existingGame.playerTurn,
    winner: existingGame.winner,
    winReason: existingGame.winReason,
    state: existingGame.state,
    type: MessageType.GAME_STATE,
    gameId,
  }
  
  await sendToEveryone(JSON.stringify(gameStateMessage), gameId.toString());
}
