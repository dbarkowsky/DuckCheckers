import app from "./express";
import ws from 'ws';
import http from 'http';
import { BaseMessage, CommunicationMessage, MessageType, PlayerDataMessage, PlayerPosition } from './interfaces/messages.ts'
import db from "./db/conn";
import { ObjectId } from "mongodb";
import { IOngoingGame } from "./interfaces/IOngoingGame";
import { v4 } from 'uuid';
import { arrivalAnnouncement } from "./gameActions/arrivalAnnouncement.ts";
import { moveRequest } from "./gameActions/moveRequest.ts";
import { duckPlacement } from "./gameActions/duckPlacement.ts";
import { forfeit } from "./gameActions/forfeit.ts";

const { SERVER_URL, SERVER_PORT } = process.env;

const port = +(SERVER_PORT ?? 9000);

const ongoingGames = db.collection<IOngoingGame>('ongoingGames');

export interface DuckSocket extends WebSocket {
  gameId: string;
  uuid: string;
  playerName: string;
}

const removeUserFromGame = async (uuid: string, gameId: ObjectId) => {
  const existingGame = gameId ? await ongoingGames.findOne({ _id: gameId }) : '';
  if (existingGame) {
    // Remove matching observers
    if (existingGame.observers.length) {
      const observerIndex = existingGame.observers.findIndex((socket: DuckSocket) => socket.uuid === uuid);
      if (observerIndex >= 0) existingGame.observers.splice(observerIndex, 1);
    }
    // Remove player from 1 or 2 position
    if (existingGame.players[PlayerPosition.ONE]?.uuid === uuid) existingGame.players[PlayerPosition.ONE] = undefined;
    if (existingGame.players[PlayerPosition.TWO]?.uuid === uuid) existingGame.players[PlayerPosition.TWO] = undefined;
    await ongoingGames.updateOne({ _id: gameId }, {
      $set: existingGame
    })
    return {
      players: existingGame.players,
      observers: existingGame.observers,
    }
  }
}

// Websocket Mock Server
const wsServer = new ws.Server({ noServer: true }); // Not a real server.
wsServer.on('connection', (socket: DuckSocket, request: http.IncomingMessage) => {
  const requestParams = request.url?.substring(1).split('/')
  const gameId = new ObjectId(requestParams?.at(0));
  socket.gameId = gameId.toString();
  socket.uuid = v4();
  // When user is removed, send user updates to clients
  socket.addEventListener('close', async () => {
    const updatedPlayersObservers = await removeUserFromGame(socket.uuid, gameId);
    const playersUpdateMessage: PlayerDataMessage = {
      gameId,
      type: MessageType.PLAYERS_UPDATE,
      players: {
        1: updatedPlayersObservers?.players[PlayerPosition.ONE],
        2: updatedPlayersObservers?.players[PlayerPosition.TWO],
      },
      observers: updatedPlayersObservers?.observers,
    }
    sendToEveryone(JSON.stringify(playersUpdateMessage), gameId.toString());
  })
  socket.addEventListener('message', async (e: MessageEvent) => {
    // What to do with incomming message?
    const message: BaseMessage = JSON.parse(e.data.toString());
    const findById = { _id: gameId }
    const existingGame = gameId ? await ongoingGames.findOne(findById) : '';  // Get game from database
    if (existingGame) {
      switch (message.type) {
        case MessageType.COMMUNICATION:
          const data = message as CommunicationMessage;
          sendToEveryone(JSON.stringify(data), gameId.toString());
          break;
        case MessageType.DUCK_PLACEMENT:
          await duckPlacement({ socket, message, gameId, existingGame });
          break;
        case MessageType.MOVE_REQUEST:
          await moveRequest({ socket, gameId, existingGame, message })
          break;
        case MessageType.ARRIVAL_ANNOUNCEMENT:
          await arrivalAnnouncement({
            gameId,
            existingGame,
            socket,
            message
          });
          break;
        case MessageType.FORFEIT:
          await forfeit({gameId, socket, existingGame, message});
          break;
        default:
          break;
      }
    }
  })
})

export const sendToEveryone = (message: string, gameId: string) => {
  // Broadcast return
  (Array.from(wsServer.clients) as DuckSocket[]).filter((socket: DuckSocket) => socket.gameId === gameId).forEach((socket: DuckSocket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(message);
    }
  })
}

// Using to wrap express server
const server = http.createServer(app);

server.listen(port, () => {
  console.info(`Express is running at ${SERVER_URL ?? 'localhost'}:${port}`);
});

// Handles upgrade from HTTP to WS. Emits a connection event
server.on('upgrade', (request, duplex, head) => {
  wsServer.handleUpgrade(request, duplex, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});

