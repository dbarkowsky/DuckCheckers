import app from "./express";
import ws from 'ws';
import http from 'http';
import { ArrivalMessage, ArrivalResponse, BaseMessage, BoardStateMessage, CommunicationMessage, DuckMessage, GameState, GameStateMessage, IChip, ITile, MessageType, MoveRequestMessage, PlayerDataMessage, PlayerPosition } from './interfaces/messages.ts'
import db from "./db/conn";
import { ObjectId } from "mongodb";
import { IOngoingGame, Location } from "./interfaces/IOngoingGame";
import { startingState } from "./constants/startingGameState";
import { v4 } from 'uuid';

const { FRONTEND_URL, SERVER_PORT } = process.env;

const port = +(SERVER_PORT ?? 9000);

const ongoingGames = db.collection<IOngoingGame>('ongoingGames');

const BOARD_SIZE = 8;

const getPossibleJumps = (tile: ITile, tiles: ITile[][]): Location[] => {
  const tileExists = (x: number, y: number) => x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
  const tileHasOpponentChip = (x: number, y: number, movingTile: ITile) => tiles[x][y].chip && tiles[x][y].chip?.player !== movingTile.chip?.player && tiles[x][y].chip?.player !== PlayerPosition.DUCK;
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
        if (tile.chip?.player === PlayerPosition.ONE && xDifference < 0) {
          return true;
        }
        // Player 2 chips can only move positive x
        else if (tile.chip?.player === PlayerPosition.TWO && xDifference > 0) {
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
  player: PlayerPosition.DUCK,
  isKinged: false,
  colour: CHIP_YELLOW,
} as IChip)

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
        case MessageType.RESET: // TODO: Remove at some point. Temporary to allow testing.
          await ongoingGames.updateOne(findById, {
            $set: startingState
          })

          const board: BoardStateMessage = {
            type: MessageType.BOARD_STATE,
            tiles: startingState.tiles,
            gameId,
          }
          sendToEveryone(JSON.stringify(board), gameId.toString());
          // Return new game state
          const state: GameStateMessage = {
            type: MessageType.GAME_STATE,
            state: 0,
            playerTurn: 0,
            gameId,
          }
          sendToEveryone(JSON.stringify(state), gameId.toString());
          break;
        case MessageType.DUCK_PLACEMENT:
          // Get incoming message data
          const duckData = message as DuckMessage;
          // Can the duck be placed now?
          if (existingGame.state !== GameState.PLAYER_DUCK) break;
          // Is this valid duck placement?
          if (existingGame.tiles[duckData.tile.x][duckData.tile.y].chip) break;
          if ((duckData.tile.x + duckData.tile.y) % 2 === 0) break; // Only on black squares
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
          // Detect and add possible forced jumps
          existingGame.tiles.forEach(row => {
            row.forEach(tile => {
              if (tile.chip?.player === existingGame.playerTurn && getPossibleJumps(tile, existingGame.tiles).length > 0) {
                forcedJumps.push({ x: tile.x, y: tile.y });
              }
            })
          })
          existingGame.forcedJumps = forcedJumps;
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
          if (moveRequest.to.x === 0 && existingGame.tiles[moveRequest.to.x][moveRequest.to.y].chip!.player === PlayerPosition.ONE) {
            existingGame.tiles[moveRequest.to.x][moveRequest.to.y].chip!.isKinged = true;
          }
          // Player 2 has reached bottom row.
          if (moveRequest.to.x === existingGame.tiles.length - 1 && existingGame.tiles[moveRequest.to.x][moveRequest.to.y].chip!.player === PlayerPosition.TWO) {
            existingGame.tiles[moveRequest.to.x][moveRequest.to.y].chip!.isKinged = true;
          }

          // Should that chip continue?
          const tileThatMoved = existingGame.tiles[moveRequest.to.x][moveRequest.to.y];
          const possibleMoves = getPossibleJumps(tileThatMoved, existingGame.tiles);

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
          console.log(pieceJumped, possibleMoves);
          // Win condition met
          if (redCount === 0 || blackCount === 0) {
            existingGame.state = GameState.GAME_END;
            existingGame.winner = redCount === 0 ? PlayerPosition.TWO : PlayerPosition.ONE;
            // Send updated the state of the game
            const newGameState: GameStateMessage = {
              type: MessageType.GAME_STATE,
              state: existingGame.state,
              playerTurn: existingGame.playerTurn,
              winner: existingGame.winner,
              forcedJumps: [],
              gameId,
            }
            sendToEveryone(JSON.stringify(newGameState), gameId.toString());
          } else if (pieceJumped && possibleMoves.length > 0) {
            console.log('continue jumping', moveRequest)
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
          break;
        case MessageType.ARRIVAL_ANNOUNCEMENT:
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
          break;
        default:
          break;
      }
    }
  })
})

const sendToEveryone = (message: string, gameId: string) => {
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
  console.info(`Express is running at ${FRONTEND_URL ?? `localhost:${port}`}`);
});

// Handles upgrade from HTTP to WS. Emits a connection event
server.on('upgrade', (request, duplex, head) => {
  wsServer.handleUpgrade(request, duplex, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});

