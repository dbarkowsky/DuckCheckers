import { DuckSocket } from "../index.ts";
import { GameState, ITile, PlayerPosition } from "./messages.ts";

export interface IOngoingGame {
  players: Record<number, DuckSocket | undefined>;
  created: Date;
  tiles: ITile[][];
  observers: DuckSocket[];
  state: GameState;
  playerTurn: PlayerPosition;
}
