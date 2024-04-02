import { GameState, ITile, PlayerNumber } from "./messages.ts";

export interface IOngoingGame {
  players: string[];
  created: Date;
  tiles: ITile[][];
  observers: string[];
  state: GameState;
  playerTurn: PlayerNumber;
}
