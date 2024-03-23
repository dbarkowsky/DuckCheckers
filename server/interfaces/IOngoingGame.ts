import { ITile } from "./messages.ts";

export interface IOngoingGame {
  players: string[];
  created: Date;
  tiles: ITile[][];
  observers: string[];
  state: GameState;
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
