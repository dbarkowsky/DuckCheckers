import app from "./express";
import ws from 'ws';
import http from 'http';
import { BaseMessage, BoardStateMessage, CommunicationMessage, MessageType, MoveRequestMessage } from './interfaces/messages'
import db from "./db/conn";
import { Condition, ObjectId } from "mongodb";
import { IOngoingGame } from "./interfaces/IOngoingGame";

const { FRONTEND_URL, SERVER_PORT } = process.env;

const port = +(SERVER_PORT ?? 9000);

const ongoingGames = db.collection<IOngoingGame>('ongoingGames');

// Websocket Mock Server
const wsServer = new ws.Server({ noServer: true }); // Not a real server.
wsServer.on('connection', (socket, request) => {
  socket.addEventListener('message', async (e) => {
    const gameId = request.url?.substring(1) as Condition<ObjectId> | undefined;
    // What to do with incomming message?
    const message: BaseMessage = JSON.parse(e.data.toString());
    switch (message.type) {
      case MessageType.COMMUNICATION:
        const data = message as CommunicationMessage;
        sendToEveryone(JSON.stringify(data));
        break;
      case MessageType.GAME_STATE:
        break;
      case MessageType.MOVE_REQUEST:
        const moveRequest = message as MoveRequestMessage;
        // Get game from database
        const existingGame = await ongoingGames.findOne({ _id: gameId })
        if (!existingGame) {
          break;
        }

        // Check if requested move is legal
        // FIXME: Assuming it is for now

        // Update board with move
        existingGame.tiles[moveRequest.to.x][moveRequest.to.y].chip = moveRequest.from.chip;
        existingGame.tiles[moveRequest.from.x][moveRequest.from.y].chip = undefined;
        
        // Check if piece was jumped
        if (Math.abs(moveRequest.from.x - moveRequest.to.x) > 1) {
          // Jump chip must have been of other player. Can just delete.
          existingGame.tiles[Math.max(moveRequest.from.x, moveRequest.to.x) - 1][Math.max(moveRequest.from.y, moveRequest.to.y) - 1].chip = undefined;
        }
        
        // Should it be kinged?
        // Player 1 has reached top row.
        if (moveRequest.to.x === 0 && existingGame.tiles[moveRequest.to.x][moveRequest.to.y].chip!.player === 1){
          existingGame.tiles[moveRequest.to.x][moveRequest.to.y].chip!.isKinged = true;
        }
        // Player 2 has reached bottom row.
        if (moveRequest.to.x === existingGame.tiles.length - 1 && existingGame.tiles[moveRequest.to.x][moveRequest.to.y].chip!.player === 1){
          existingGame.tiles[moveRequest.to.x][moveRequest.to.y].chip!.isKinged = true;
        }

        // Update database
        await ongoingGames.updateOne({ _id: gameId }, {
          $set: existingGame
        })
        // Return new game state
        const boardState: BoardStateMessage = {
          type: MessageType.BOARD_STATE,
          tiles: existingGame.tiles,
        }
        sendToEveryone(JSON.stringify(boardState));
        break;
      default:
        break;
    }
    // Single client return
    // socket.send('Return message ' + e.data.toString())

  })
})

const sendToEveryone = (message: string) => {
  // Broadcast return
  wsServer.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  })
}

// Using to wrap express server
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Express is running at ${FRONTEND_URL ?? `localhost:${port}`}`);
});
// Handles upgrade from HTTP to WS. Emits a connection event
server.on('upgrade', (request, duplex, head) => {
  wsServer.handleUpgrade(request, duplex, head, socket => {
    // console.log(request.url)
    wsServer.emit('connection', socket, request);
  });
});

