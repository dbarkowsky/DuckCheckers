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
  COMMUNICATION,
  GAME_STATE,
  BOARD_STATE,
  GAME_END, 
  MOVE_REQUEST,
  SELECTED_TILE,
  DUCK_PLACEMENT,
  ARRIVAL_ANNOUNCEMENT,
  ARRIVAL_RESPONSE,
  RESET,
  FORFEIT,
  PLAYERS_UPDATE,
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
   forcedJumps?: Location[];
 }
 
 export interface BoardStateMessage extends BaseMessage {
   type: MessageType.BOARD_STATE;
   tiles: ITile[][];
 }
 
 export interface GameEndMessage extends BaseMessage {
   type: MessageType.GAME_END;
   winner: string;
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
