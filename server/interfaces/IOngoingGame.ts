import { GameState, ITile, PlayerPosition } from "./messages.ts";

export interface IOngoingGame {
  players: Record<number, string | undefined>;
  created: Date;
  tiles: ITile[][];
  observers: string[];
  state: GameState;
  playerTurn: PlayerPosition;
}
