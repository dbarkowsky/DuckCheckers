export default class TileClass {

  isRed: boolean;
  x: number;
  y: number;
  chip: ChipClass | undefined = undefined;

  constructor (isRed: boolean, x:number, y: number) {
    this.isRed = isRed;
    this.x = x;
    this.y = y;
  }

  public hasChip = () => this.chip ? true : false;
}
