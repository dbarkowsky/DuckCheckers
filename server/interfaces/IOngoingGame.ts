export interface IOngoingGame {
  _id?: string;
  players: string[];
  created: Date;
  moves: string[];
  observers: string[];
}
