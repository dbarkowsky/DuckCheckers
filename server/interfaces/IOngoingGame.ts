import { GameState, ITile, PlayerPosition } from "./messages.ts";

export interface IOngoingGame {
  players: Record<number, WebSocket | undefined>;
  created: Date;
  tiles: ITile[][];
  observers: WebSocket[];
  state: GameState;
  playerTurn: PlayerPosition;
}
