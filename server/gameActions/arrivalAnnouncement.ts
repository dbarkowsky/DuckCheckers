import { MessageType, ArrivalResponse, PlayerPosition, PlayerDataMessage, ArrivalMessage } from "../interfaces/messages";
import { sendToEveryone } from "..";
import { IOngoingGame } from "../interfaces/IOngoingGame";
import db from "../db/conn";
import { GameActionProps } from "../interfaces/GameActionProps";

const ongoingGames = db.collection<IOngoingGame>('ongoingGames');

export const arrivalAnnouncement = async (props: GameActionProps) => {
  const { message, gameId, existingGame, socket} = props;
  const findById = { _id: gameId }
  const arrivalData = message as ArrivalMessage;
  const returnData = {
    gameId,
    type: MessageType.ARRIVAL_RESPONSE,
    tiles: existingGame.tiles,
    state: existingGame.state,
    playerTurn: existingGame.playerTurn,
    gameName: existingGame.gameName,
    players: existingGame.players,
    forcedJumps: existingGame.forcedJumps,
    winner: existingGame.winner,
    winReason: existingGame.winReason,
  } as Partial<ArrivalResponse>;
  // Attach their name
  socket.playerName = arrivalData.playerName;
  // If they want to be a player
  if ([PlayerPosition.ONE, PlayerPosition.TWO].includes(arrivalData.desiredPosition)) {
    // Check if existing player positions are full
    if (existingGame.players[PlayerPosition.ONE] && existingGame.players[PlayerPosition.TWO]) {
      // Too bad, assign them as a spectator
      // FIXME: Don't do this if they are already observers
      existingGame.observers.push(socket)
      returnData.playerPosition = PlayerPosition.OBSERVER;
    } else {
      // Add them as a player
      if (arrivalData.desiredPosition === PlayerPosition.ONE) {
        existingGame.players[PlayerPosition.ONE] = socket;
        returnData.playerPosition = PlayerPosition.ONE;
      } else {
        existingGame.players[PlayerPosition.TWO] = socket;
        returnData.playerPosition = PlayerPosition.TWO;
      }
    }
  } else {
    // Add them as a spectator
    // Don't do this if they are already spectators
    if (!existingGame.observers.some(observer => observer.playerName !== socket.playerName)) {
      existingGame.observers.push(socket)
      returnData.playerPosition = PlayerPosition.OBSERVER;
    }
  }
  // }

  // Save the state of the existing game
  await ongoingGames.updateOne(findById, {
    $set: existingGame
  })
  // In either case, return current game and board state
  socket.send(JSON.stringify(returnData));
  // Send player update to clients
  const playersUpdateMessage: PlayerDataMessage = {
    gameId,
    type: MessageType.PLAYERS_UPDATE,
    players: existingGame.players,
    observers: existingGame.observers,
  }
  sendToEveryone(JSON.stringify(playersUpdateMessage), gameId.toString());
}
