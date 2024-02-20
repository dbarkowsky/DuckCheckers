export default class ChipClass {
  player: number;
  colour: string;

  constructor (player: number, colour: string) {
    this.player = player;
    this.colour = colour;
  }

  setPlayer = (newPlayer: number) => {
    this.player = newPlayer;
  }
}
