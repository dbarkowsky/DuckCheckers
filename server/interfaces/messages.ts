import { Condition, ObjectId } from "mongodb";
import { DuckSocket } from "..";
import { Location } from "./IOngoingGame";

export enum GameState {
  PLAYER_MOVE,
  PLAYER_CONTINUE,
  PLAYER_DUCK,
  GAME_END,
  MOVE_REQUEST,
  SELECTED_TILE,
}

export interface IGame {
  state: GameState,
  players: {
    1: string | undefined;
    2: string | undefined;
  },
  tiles: ITile[][]
}

export interface ITile {
  isRed: boolean;
  x: number;
  y: number;
  chip?: IChip | undefined;
}

export enum PlayerPosition {
  ONE,
  TWO,
  DUCK,
  OBSERVER,
}

export interface IChip {
  player: PlayerPosition;
  colour: string;
  isKinged: boolean;
}

export enum MessageType {
  COMMUNICATION = 0,
  GAME_STATE = 1,
  BOARD_STATE = 2,
  MOVE_REQUEST = 4,
  SELECTED_TILE = 5,
  DUCK_PLACEMENT = 6,
  ARRIVAL_ANNOUNCEMENT = 7,
  ARRIVAL_RESPONSE = 8,
  RESET = 9,
  FORFEIT = 10,
  PLAYERS_UPDATE = 11,
  PING_PONG = 12,
 }
 
 export interface BaseMessage {
  type: MessageType;
  gameId: Condition<ObjectId> | undefined;
}

export interface ArrivalMessage extends BaseMessage {
  type: MessageType.ARRIVAL_ANNOUNCEMENT;
  playerName: string;
  desiredPosition: PlayerPosition;
}

export interface ArrivalResponse extends BaseMessage {
  type: MessageType.ARRIVAL_RESPONSE;
  playerPosition: PlayerPosition;
  playerTurn: PlayerPosition;
  state: GameState;
  tiles: ITile[][];
  gameName: string;
  players: Record<number, DuckSocket | undefined>
  forcedJumps?: Location[];
  winner?: PlayerPosition;
  winReason?: string;
}
 
 export interface CommunicationMessage extends BaseMessage {
   type: MessageType.COMMUNICATION;
   message: string;
   sender: string;
   time: Date;
 }
 
 export interface GameStateMessage extends BaseMessage {
   type: MessageType.GAME_STATE;
   state: GameState;
   playerTurn: PlayerPosition;
   winner?: PlayerPosition;
   winReason?: string;
   forcedJumps?: Location[];
 }
 
 export interface BoardStateMessage extends BaseMessage {
   type: MessageType.BOARD_STATE;
   tiles: ITile[][];
 }
 
 export interface MoveRequestMessage extends BaseMessage {
   type: MessageType.MOVE_REQUEST;
   from: ITile;
   to: ITile;
 }

 export interface SelectedTileMessage extends BaseMessage {
  type: MessageType.SELECTED_TILE;
  tile: ITile;
}

export interface DuckMessage extends BaseMessage {
  type: MessageType.DUCK_PLACEMENT;
  tile: ITile;
}

export interface PlayerDataMessage extends BaseMessage {
	type: MessageType.PLAYERS_UPDATE;
	players: Record<number, DuckSocket | undefined>;
  observers?: DuckSocket[];
}

export interface ForfeitMessage extends BaseMessage {
  requestor: PlayerPosition;
}

export interface PingPongMessage extends BaseMessage {
  type: MessageType.PING_PONG
}
