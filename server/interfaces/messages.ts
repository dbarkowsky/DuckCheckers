export enum GameState {
  PLAYER_1_MOVE,
  PLAYER_1_CONTINUE,
  PLAYER_1_DUCK,
  PLAYER_2_MOVE,
  PLAYER_2_CONTINUE,
  PLAYER_2_DUCK,
  GAME_END,
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
  chip: IChip | undefined;
}

export interface IChip {
  player: 1 | 2;
  colour: string;
  isKinged: boolean;
}

export enum MessageType {
  COMMUNICATION,
  GAME_STATE,
  BOARD_STATE,
  GAME_END, 
  MOVE_REQUEST,
 }
 
 export interface BaseMessage {
   type: MessageType;
 }
 
 export interface CommunicationMessage extends BaseMessage {
   type: MessageType.COMMUNICATION;
   message: string;
   sender: string;
   time: Date;
 }
 
 export interface GameStateMessage extends BaseMessage {
   type: MessageType.GAME_STATE;
   state: IGame;
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
 