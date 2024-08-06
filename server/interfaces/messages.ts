import { Condition, ObjectId } from "mongodb";

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

export enum PlayerNumber {
  ONE,
  TWO,
  DUCK,
}

export interface IChip {
  player: PlayerNumber;
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
 }

 export enum PlayerRole {
  PLAYER,
  SPECTATOR
}
 
 export interface BaseMessage {
  type: MessageType;
  gameId: Condition<ObjectId> | undefined;
}

export interface ArrivalMessage extends BaseMessage {
  type: MessageType.ARRIVAL_ANNOUNCEMENT;
  player: string;
  desiredRole: PlayerRole;
}

export interface ArrivalResponse extends BaseMessage {
  type: MessageType.ARRIVAL_RESPONSE;
  playerNumber?: PlayerNumber;
  role: PlayerRole;
  playerTurn: PlayerNumber;
  state: GameState;
  tiles: ITile[][];
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
   playerTurn: PlayerNumber;
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

 