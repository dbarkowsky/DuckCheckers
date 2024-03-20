import type Game from "../classes/Game";
import type TileClass from "../classes/Tile";
import type { IGame } from "../stores/gameStore";

export enum MessageType {
 COMMUNICATION,
 GAME_STATE,
 BOARD_STATE,
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
  state: IGame;

}

export interface BoardStateMessage extends BaseMessage {
  tiles: TileClass[][];
}

export interface GameEndMessage extends BaseMessage {
  winner: string;
}
