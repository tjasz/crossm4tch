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
    this.cellStates[i] = [];
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
    if (candidate * Math.floor(this.size / candidate) == this.size) {
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
  if (this.isFreshBoard() && this.isEdge(i,j))
  {
    return true;
  }
  var catInfo = this.categoryAssignments(this.size*i + j);
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

// TODO determine game states
// TODO play


