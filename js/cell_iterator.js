function Coordinate(x, y) {
  this.x = x;
  this.y = y;
}

function rowAdvance(coord) {
  coord.y++;
}

function colAdvance(coord) {
  coord.x++;
}

function posDiagAdvance(coord) {
  coord.x++;
  coord.y++;
}

function negDiagAdvance(coord) {
  coord.x++;
  coord.y--;
}

function rectAdvance(coord, starty, endy) {
  coord.y++;
  if (coord.y > endy) {
    coord.y = starty;
    coord.x++;
  }
}

function CellIterator(startx, starty, endx, endy, type) {
  this.x = startx;
  this.y = starty;
  this.startx = startx;
  this.starty = starty;
  this.endx = endx;
  this.endy = endy;
  this.type = type;
}

CellIterator.prototype.cells = function*() {
  yield new Coordinate(this.x, this.y);
  while (this.x !== this.endx || this.y !== this.endy)
  {
    switch(this.type) {
      case CellCollectionType.Row:
        rowAdvance(this);
        break;
      case CellCollectionType.Col:
        colAdvance(this);
        break;
      case CellCollectionType.PosDiag:
        posDiagAdvance(this);
        break;
      case CellCollectionType.NegDiag:
        negDiagAdvance(this);
        break;
      case CellCollectionType.Rect:
        rectAdvance(this, this.starty, this.endy);
        break;
    }
    yield new Coordinate(this.x, this.y);
  }
};