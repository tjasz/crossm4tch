function GameBoard(size) {
  this.size = size;
  this.smaller_factor_ = -1;
  this.gameState = GameState.InProgress;
  this.claimed = 0;
  this.lastTileCategoryInfo = -1;
  this.cellStates = [];
  this.categoryAssignments = Array.from(Array(this.size*this.size).keys());
  this.setup();
}

// set up a board of the given size
GameBoard.prototype.setup = function() {
  this.gameState = GameState.InProgress;
  this.claimed = 0;
  this.lastTileCategoryInfo = -1;
  this.cellStates = [];
  for (var i = 0; i < this.size; i++) {
    this.cellStates[i] = [];
	  for (var j = 0; j < this.size; j++) {
      this.cellStates[i].push(CellState.Unclaimed);
	  }
  }
  shuffle(this.categoryAssignments);
};

GameBoard.prototype.copy = function(other) {
  other = new GameBoard(this.size);
  other.smaller_factor_ = this.smaller_factor_;
  other.gameState = this.gameState;
  other.claimed = this.claimed;
  other.lastTileCategoryInfo = this.lastTileCategoryInfo;
  // deep copy cell states
  for (var i = 0; i < this.size; i++) {
    other.cellStates[i] = [];
	  for (var j = 0; j < this.size; j++) {
      other.cellStates[i][j] = this.cellStates[i][j];
	  }
  }
  // deep copy category assignments
  for (i = 0; i < this.size*this.size; i++) {
    other.categoryAssignments[i] = this.categoryAssignments[i];
  }
  return other;
};

GameBoard.prototype.equals = function(other) {
  var result = this.size === other.size && this.gameState === other.gameState &&
    this.claimed === other.claimed && this.lastTileCategoryInfo === other.lastTileCategoryInfo;
  if (!result) {
    return false;
  }
  for (var i = 0; i < this.size; i++) {
    this.cellStates[i] = [];
	  for (var j = 0; j < this.size; j++) {
      if (other.cellStates[i][j] !== this.cellStates[i][j]) {
        return false;
	    }
	  }
  }
  for (i = 0; i < this.size*this.size; i++) {
    if (other.categoryAssignments[i] !== this.categoryAssignments[i]) {
      return false;
	  }
  }
  return true;
};

GameBoard.prototype.smaller_factor = function() {
  if (this.smaller_factor_ > 0) { return this.smaller_factor_; }
  var upper_bound = Math.floor(Math.sqrt(this.size));
  for (var candidate = upper_bound; candidate > 1; candidate--)
  {
    if (candidate * Math.floor(this.size / candidate) === this.size) {
      this.smaller_factor_ = candidate;
	    return candidate;
	  }
  }
  this.smaller_factor_ = 1;
  return 1;
};

GameBoard.prototype.larger_factor = function() {
  return Math.floor(this.size / this.smaller_factor());
};

// the number of possible winning clusters on this board size
GameBoard.prototype.numClusters = function() {
  if (this.size === 1) return 1;

  var result = 2*this.size + 2; // rows, columnns, diagonals
  if (this.smaller_factor() !== 1) // do not double count columns or rows
  {
    // larger_factor by saller_factor clusters
    result += (this.size - this.smaller_factor() + 1) * (this.size - this.larger_factor() + 1);
    if (this.smaller_factor() != this.larger_factor()) {
      result += (this.size - this.smaller_factor() + 1) * (this.size - this.larger_factor() + 1);
    }
  }
  return result;
}

GameBoard.prototype.isEdge = function(i, j) {
  return i === 0 || i === this.size-1 || j === 0 || j === this.size-1;
};

GameBoard.prototype.getCellState = function(i, j) {
  return this.cellStates[i][j];
};

GameBoard.prototype.getCellFirstCategory = function(i, j) {
  return Math.floor(this.categoryAssignments[this.size*i + j] / this.size);
};

GameBoard.prototype.getCellSecondCategory = function(i, j) {
  return this.categoryAssignments[this.size*i + j] % this.size;
};

GameBoard.prototype.isPlayerOneTurn = function() {
  return this.claimed % 2 === 0;
};

GameBoard.prototype.isPlayerTwoTurn = function() {
  return !this.isPlayerOneTurn();
};

GameBoard.prototype.isFreshBoard = function() {
  return this.claimed === 0;
};

GameBoard.prototype.gameOver = function() {
  return this.gameState !== GameState.InProgress;
};

GameBoard.prototype.isLegalMove = function(i, j) {
  if (this.gameOver() || this.cellStates[i][j] !== CellState.Unclaimed)
  {
    return false;
  }
  if (this.isFreshBoard())
  {
    return this.isEdge(i,j);
  }
  var catInfo = this.categoryAssignments[this.size*i + j];
  return catInfo % this.size === this.lastTileCategoryInfo % this.size ||
    Math.floor(catInfo / this.size) === Math.floor(this.lastTileCategoryInfo / this.size);
};

GameBoard.prototype.legalMoves = function() {
  if (this.isFreshBoard()) return 4*this.size - 1;
  var count = 0;
  for (var i = 0; i < this.size; i++) {
    for (var j = 0; j < this.size; j++) {
      if (this.isLegalMove(i,j)) {
        count++;
      }
    }
  }
  return count;
};

GameBoard.prototype.unclaimedTiles = function() {
	return this.size*this.size - this.claimed;
};

GameBoard.prototype.collections = function*() {
  // yield the rows
  for (var row = 0; row < this.size; row++)
  {
    yield new CellIterator(row, 0, row, this.size-1, CellCollectionType.Row);
  }
  // yield the columns
  for (var col = 0; col < this.size; col++)
  {
    yield new CellIterator(0, col, this.size-1, col, CellCollectionType.Col);
  }
  // yield the positive diagonal
  yield new CellIterator(0, 0, this.size-1, this.size-1, CellCollectionType.PosDiag);
  // yield the negative diagonal
  yield new CellIterator(0, this.size-1, this.size-1, 0, CellCollectionType.NegDiag);
  // yield the larger_factor x smaller_factor squares if size is not prime
  if (this.smaller_factor() !== 1)
  {
    for (var row = 0; row <= this.size - this.smaller_factor(); row++)
    {
      for (var col = 0; col <= this.size - this.larger_factor(); col++)
      {
        yield new CellIterator(row, col, row+this.smaller_factor()-1, col+this.larger_factor()-1, CellCollectionType.Rect);
      }
    }
  }
  // yield the smaller_factor x larger_factor squares if size is not square
  if (this.smaller_factor() !== 1 && this.smaller_factor() !== this.larger_factor())
  {
    for (var row = 0; row <= this.size - this.larger_factor(); row++)
    {
      for (var col = 0; col <= this.size - this.smaller_factor(); col++)
      {
        yield new CellIterator(row, col, row+this.larger_factor()-1, col+this.smaller_factor()-1, CellCollectionType.Rect);
      }
    }
  }
};

GameBoard.prototype.determineGameState = function() {
  // check all possible collections for a win
  var collections = this.collections();
  var potential_collection = collections.next();
  while (!potential_collection.done)
  {
    var collection = potential_collection.value.cells();
    var seqlen = 0;
    var state = null;
    var potential_cell = collection.next();
    while (!potential_cell.done) {
      var cell = potential_cell.value;
      if ((state && this.cellStates[cell.x][cell.y] !== state) || this.cellStates[cell.x][cell.y] === CellState.Unclaimed) {
        break;
      }
      state = this.cellStates[cell.x][cell.y];
      seqlen++;
      potential_cell = collection.next();
    }
    if (seqlen == this.size) {
      if (state == CellState.PlayerOne) {
        return GameState.PlayerOneWin;
      }
      else {
        return GameState.PlayerTwoWin;
      }
    }
    potential_collection = collections.next();
  }
  // otherwise, check for legal moves
  if (this.legalMoves() === 0)
  {
    if (this.unclaimedTiles() > 0) {
      if (this.isPlayerTwoTurn()) {
        return GameState.PlayerOneWin;
      }
      else {
        return GameState.PlayerTwoWin;
      }
    }
    return GameState.Draw;
  }
  return GameState.InProgress;
};

GameBoard.prototype.play = function(i,j) {
  if (this.isLegalMove(i,j))
  {
    if (this.isPlayerOneTurn()) {
      this.cellStates[i][j] = CellState.PlayerOne;
	  }
	  else {
	    this.cellStates[i][j] = CellState.PlayerTwo;
	  }
	  this.claimed++;
	  this.lastTileCategoryInfo = this.categoryAssignments[this.size*i + j];
	  this.gameState = this.determineGameState();
  }
  //console.log(this);
};


