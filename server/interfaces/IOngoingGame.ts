import { DuckSocket } from "../index.ts";
import { GameState, ITile, PlayerPosition } from "./messages.ts";

export interface IOngoingGame {
  players: Record<number, DuckSocket | undefined>;
  created: Date;
  tiles: ITile[][];
  observers: DuckSocket[];
  state: GameState;
  playerTurn: PlayerPosition;
  gameName: string;
  winner?: PlayerPosition;
  winReason?: string;
  forcedJumps?: Location[];
}

export interface Location {
  x: number;
  y: number;
}
