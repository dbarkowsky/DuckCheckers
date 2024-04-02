import app from "./express";
import ws from 'ws';
import http from 'http';
import { BaseMessage, BoardStateMessage, CommunicationMessage, GameState, GameStateMessage, ITile, MessageType, MoveRequestMessage, PlayerNumber, SelectedTileMessage } from './interfaces/messages.ts'
import db from "./db/conn";
import { Condition, ObjectId } from "mongodb";
import { IOngoingGame } from "./interfaces/IOngoingGame";

const { FRONTEND_URL, SERVER_PORT } = process.env;

const port = +(SERVER_PORT ?? 9000);

const ongoingGames = db.collection<IOngoingGame>('ongoingGames');

const BOARD_SIZE = 8;



const getPossibleJumps = (tile: ITile, tiles: ITile[][]) => {
  const tileExists = (x: number, y: number) => x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
  const tileHasOpponentChip = (x: number, y: number, movingTile: ITile) => tiles[x][y].chip && tiles[x][y].chip?.player !== movingTile.chip?.player && tiles[x][y].chip?.player !== PlayerNumber.DUCK;
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
        if (tile.chip?.player === PlayerNumber.ONE && xDifference < 0) {
          return true;
        }
        // Player 2 chips can only move positive x
        else if (tile.chip?.player === PlayerNumber.TWO && xDifference > 0) {
          return true;
        }
        return false;
      }
      return true;
    })
    // filter out non-jumps (adjacent spaces)
    .filter(coord => Math.abs(tile.x - coord.x) !== 1);
}

// Websocket Mock Server
const wsServer = new ws.Server({ noServer: true }); // Not a real server.
wsServer.on('connection', (socket, request) => {
  socket.addEventListener('message', async (e) => {
    const gameId = request.url?.substring(1) as Condition<ObjectId> | undefined;
    // What to do with incomming message?
    const message: BaseMessage = JSON.parse(e.data.toString());
    // Get game from database
    const existingGame = await ongoingGames.findOne({ _id: gameId })
    if (existingGame) {
      switch (message.type) {
        case MessageType.COMMUNICATION:
          const data = message as CommunicationMessage;
          sendToEveryone(JSON.stringify(data));
          break;
        case MessageType.DUCK_PLACEMENT:
          break;
        case MessageType.MOVE_REQUEST:
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
          if (moveRequest.to.x === 0 && existingGame.tiles[moveRequest.to.x][moveRequest.to.y].chip!.player === PlayerNumber.ONE) {
            existingGame.tiles[moveRequest.to.x][moveRequest.to.y].chip!.isKinged = true;
          }
          // Player 2 has reached bottom row.
          if (moveRequest.to.x === existingGame.tiles.length - 1 && existingGame.tiles[moveRequest.to.x][moveRequest.to.y].chip!.player === PlayerNumber.TWO) {
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
            game: gameId,
            playerTurn: moveRequest.playerTurn,
          }
          sendToEveryone(JSON.stringify(boardState));

          // Should that chip continue?
          const tileThatMoved = existingGame.tiles[moveRequest.to.x][moveRequest.to.y];
          const possibleMoves = getPossibleJumps(tileThatMoved, existingGame.tiles);
          if (pieceJumped && possibleMoves.length > 0) {
            // Update database
            existingGame.state = GameState.PLAYER_CONTINUE;
            await ongoingGames.updateOne({ _id: gameId }, {
              $set: existingGame
            })
            const selectedState: SelectedTileMessage = {
              type: MessageType.SELECTED_TILE,
              tile: tileThatMoved,
              game: gameId,
              playerTurn: moveRequest.playerTurn,
            }
            socket.send(JSON.stringify(selectedState));
          } else {
            // Update database
            existingGame.state = GameState.PLAYER_DUCK;
            await ongoingGames.updateOne({ _id: gameId }, {
              $set: existingGame
            })
            // Update the state of the game
            const nextState: GameStateMessage = {
              type: MessageType.GAME_STATE,
              state: GameState.PLAYER_DUCK,
              playerTurn: moveRequest.playerTurn,
              game: gameId,
            };

            sendToEveryone(JSON.stringify(nextState));
          }
          break;
        default:
          break;
      }
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

