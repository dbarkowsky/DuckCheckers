import app from "./express";
import ws from 'ws';
import http from 'http';
import { ArrivalMessage, ArrivalResponse, BaseMessage, BoardStateMessage, CommunicationMessage, DuckMessage, GameState, GameStateMessage, IChip, ITile, MessageType, MoveRequestMessage, PlayerNumber, PlayerRole, SelectedTileMessage } from './interfaces/messages.ts'
import db from "./db/conn";
import { Condition, ObjectId } from "mongodb";
import { IOngoingGame } from "./interfaces/IOngoingGame";
import { startingState } from "./constants/startingGameState";

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

const CHIP_YELLOW = '#f5ff13'
const createDuck = () => ({
  player: PlayerNumber.DUCK,
  isKinged: false,
  colour: CHIP_YELLOW,
} as IChip)

// Websocket Mock Server
const wsServer = new ws.Server({ noServer: true }); // Not a real server.
wsServer.on('connection', (socket, request) => {
  socket.addEventListener('message', async (e) => {
    const gameId = request.url?.substring(1) as Condition<ObjectId> | undefined;
    // What to do with incomming message?
    const message: BaseMessage = JSON.parse(e.data.toString());    // Get game from database
    const existingGame = await ongoingGames.findOne({ _id: gameId })
    if (existingGame) {
      switch (message.type) {
        case MessageType.COMMUNICATION:
          const data = message as CommunicationMessage;
          sendToEveryone(JSON.stringify(data));
          break;
        case MessageType.RESET: // TODO: Remove at some point. Temporary to allow testing.
          const result = await ongoingGames.updateOne({ _id: gameId }, {
            $set: startingState
          })
          if (result.modifiedCount === 1){

          }
          const board: BoardStateMessage = {
            type: MessageType.BOARD_STATE,
            tiles: startingState.tiles,
            gameId,
          }
          sendToEveryone(JSON.stringify(board));
          // Return new game state
          const state: GameStateMessage = {
            type: MessageType.GAME_STATE,
            state: 0,
            playerTurn: 0,
            gameId,
          }
          sendToEveryone(JSON.stringify(state));
          break;
        case MessageType.DUCK_PLACEMENT:
          // Get incoming message data
          const duckData = message as DuckMessage;
          // Can the duck be placed now?
          if (existingGame.state !== GameState.PLAYER_DUCK) break;
          // Is this valid duck placement?
          if (existingGame.tiles[duckData.tile.x][duckData.tile.y].chip) break;
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
              if (tile.chip?.player === PlayerNumber.DUCK) {
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
          existingGame.playerTurn = existingGame.playerTurn === PlayerNumber.ONE ? PlayerNumber.TWO : PlayerNumber.ONE
          // Update database
          await ongoingGames.updateOne({ _id: gameId }, {
            $set: existingGame
          })
          // Send back responses
          const duckResponse: BoardStateMessage = {
            type: MessageType.BOARD_STATE,
            tiles: existingGame.tiles,
            gameId,
          }
          sendToEveryone(JSON.stringify(duckResponse));
          // Return new game state
          const gameState: GameStateMessage = {
            type: MessageType.GAME_STATE,
            state: existingGame.state,
            playerTurn: existingGame.playerTurn,
            gameId,
          }
          sendToEveryone(JSON.stringify(gameState));

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

          // Should that chip continue?
          const tileThatMoved = existingGame.tiles[moveRequest.to.x][moveRequest.to.y];
          const possibleMoves = getPossibleJumps(tileThatMoved, existingGame.tiles);
          if (pieceJumped && possibleMoves.length > 0) {
            // Update database
            existingGame.state = GameState.PLAYER_CONTINUE;
            await ongoingGames.updateOne({ _id: gameId }, {
              $set: existingGame
            })
            // Send info for force-selected tile
            const selectedState: SelectedTileMessage = {
              type: MessageType.SELECTED_TILE,
              tile: tileThatMoved,
              gameId,
            }
            socket.send(JSON.stringify(selectedState));
            // Return new game state
            const gameState: GameStateMessage = {
              type: MessageType.GAME_STATE,
              state: existingGame.state,
              playerTurn: existingGame.playerTurn,
              gameId,
            }
            sendToEveryone(JSON.stringify(gameState));
          } else {
            // Update state and database
            existingGame.state = GameState.PLAYER_DUCK;
            await ongoingGames.updateOne({ _id: gameId }, {
              $set: existingGame
            })
            // Send updated the state of the game
            const nextState: GameStateMessage = {
              type: MessageType.GAME_STATE,
              state: existingGame.state,
              playerTurn: existingGame.playerTurn,
              gameId,
            };
            sendToEveryone(JSON.stringify(nextState));
          }
          // Update database
          await ongoingGames.updateOne({ _id: gameId }, {
            $set: existingGame
          })
          // Return new board state
          const boardState: BoardStateMessage = {
            type: MessageType.BOARD_STATE,
            tiles: existingGame.tiles,
            gameId,
          }
          sendToEveryone(JSON.stringify(boardState));
          break;
        case MessageType.ARRIVAL_ANNOUNCEMENT:
          const arrivalData = message as ArrivalMessage;
          console.log(arrivalData )
          const returnData = {
            gameId,
            type: MessageType.ARRIVAL_RESPONSE,
            tiles: existingGame.tiles,
            state: existingGame.state,
            playerTurn: existingGame.playerTurn,
          } as Partial<ArrivalResponse>;
          // If they want to be a player
          if (arrivalData.desiredRole === PlayerRole.PLAYER) {
            // Check if they already are a player
            if (Object.values(existingGame.players).includes(arrivalData.player)) {
              returnData.role = PlayerRole.PLAYER;
              if (existingGame.players[1] === arrivalData.player) returnData.playerNumber = PlayerNumber.ONE;
              else returnData.playerNumber = PlayerNumber.TWO;
            } else {
              // Check if existing player positions are full
              if (existingGame.players[1] && existingGame.players[2]) {
                // Too bad, assign them as a spectator
                // FIXME: Don't do this if they are already spectators
                existingGame.observers.push(arrivalData.player)
                returnData.role = PlayerRole.SPECTATOR;
              } else {
                // Add them as a player
                if (!existingGame.players[1]) {
                  existingGame.players[1] = arrivalData.player;
                  returnData.playerNumber = PlayerNumber.ONE;
                }
                else {
                  existingGame.players[2] = arrivalData.player;
                  returnData.playerNumber = PlayerNumber.TWO;
                }
                // Add the role to the response
                returnData.role = PlayerRole.PLAYER;
              }
            }
          } else {
            // Add them as a spectator
            // FIXME: Don't do this if they are already spectators
            existingGame.observers.push(arrivalData.player)
            returnData.role = PlayerRole.SPECTATOR;
          }
          // Save the state of the existing game
          await ongoingGames.updateOne({ _id: gameId }, {
            $set: existingGame
          })
          // In either case, return current game and board state
          socket.send(JSON.stringify(returnData));
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

