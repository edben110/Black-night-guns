class Pickup extends Entity {
  constructor(x, y, color, w = 10, h = 20) {
    super(x, y, w, h, color);
    this.active = true;
  }
}