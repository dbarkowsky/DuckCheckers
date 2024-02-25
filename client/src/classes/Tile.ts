import ChipClass from "./Chip";

export default class TileClass {

  public isRed: boolean;
  public x: number;
  public y: number;
  public chip: ChipClass | undefined = undefined;

  constructor (isRed: boolean, x:number, y: number) {
    this.isRed = isRed;
    this.x = x;
    this.y = y;
  }

  public hasChip = () => this.chip ? true : false;
}
