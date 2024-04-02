import type { GameState, ITile } from "../stores/gameStore";

export enum MessageType {
 COMMUNICATION,
 GAME_STATE,
 BOARD_STATE,
 GAME_END, 
 MOVE_REQUEST,
 SELECTED_TILE,
}

export interface BaseMessage {
  type: MessageType;
  game: string;
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
}

export interface BoardStateMessage extends BaseMessage {
  type: MessageType.BOARD_STATE;
  tiles: ITile[][];
}

export interface GameEndMessage extends BaseMessage {
  type: MessageType.GAME_END;
  winner: string;
  state: GameState.GAME_END;
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
