export enum MessageType {
  COMMUNICATION,
  GAME_STATE,
  BOARD_STATE,
  GAME_END,
}

export enum GameState {
  PLAYER_1_MOVE,
  PLAYER_1_CONTINUE,
  PLAYER_1_DUCK,
  PLAYER_2_MOVE,
  PLAYER_2_CONTINUE,
  PLAYER_2_DUCK,
  GAME_END,
}

export interface BaseMessage {
  type: MessageType;
  game: string;
}

export interface CommunicationMessage extends BaseMessage {
  message: string;
  sender: string;
  time: Date;
}

export interface GameStateMessage extends BaseMessage {
  state: any;

}

export interface BoardStateMessage extends BaseMessage {
  tiles: any[][];
}

export interface GameEndMessage extends BaseMessage {
  winner: string;
}
