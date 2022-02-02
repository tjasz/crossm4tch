function HtmlActuator(grid) {
  this.grid = grid;
  this.gridCells = document.getElementsByClassName("grid-cell");
  this.lastTileContainer = document.querySelector(".last-tile");
  for (var i = 0; i < this.gridCells.length; i++) {
    var x = Math.floor(i / this.grid.size);
    var y = i % this.grid.size;
    this.gridCells[i].act = this;
    this.gridCells[i].x = x;
    this.gridCells[i].y = y;
    this.gridCells[i].addEventListener('click', tileClick);
  }
  this.restartButton = document.getElementById("restartButton");
  this.restartButton.act = this;
  this.restartButton.addEventListener('click', restart);
}

function tileClick(evt) {
  evt.target.act.grid.play(evt.target.x, evt.target.y);
  evt.target.act.actuate();
  if (evt.target.act.grid.isPlayerTwoTurn() && !evt.target.act.grid.gameOver()) {
    setTimeout(function() {
      var p2play = getMove(evt.target.act.grid, 15, false);
      evt.target.act.grid.play(p2play.x, p2play.y);
      evt.target.act.actuate();
    },20);
  }
}

function restart(evt) {
  evt.target.act.grid.setup();
  evt.target.act.actuate();
}

HtmlActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HtmlActuator.prototype.refreshCategoryAssignments = function() {
  // refresh category display for all grid cells
  for (var i = 0; i < this.gridCells.length; i++) {
    var cat1 = Math.floor(this.grid.categoryAssignments[i] / this.grid.size);
    var cat2 = this.grid.categoryAssignments[i] % this.grid.size;
	this.gridCells[i].textContent = cat1+1;
    var classes = ["grid-cell", "cat2-" + cat2];
	this.applyClasses(this.gridCells[i], classes);
  }
  // refresh category display for the last tile cell
  var lastTile = this.grid.lastTileCategoryInfo;
  if (lastTile >= 0) {
    cat1 = Math.floor(lastTile / this.grid.size);
    cat2 = lastTile % this.grid.size;
    this.lastTileContainer.textContent = cat1+1;
    lastTileState = this.grid.isPlayerOneTurn() ? "p2claimed" : "p1claimed";
    classes = ["last-tile", "cat2-" + cat2, lastTileState];
    this.applyClasses(this.lastTileContainer, classes);
  }
  else {
    this.lastTileContainer.textContent = "";
    this.applyClasses(this.lastTileContainer, ["last-tile"]);
  }
};

HtmlActuator.prototype.refreshEnabledState = function() {
  for (var i = 0; i < this.gridCells.length; i++) {
    var x = Math.floor(i / this.grid.size);
	var y = i % this.grid.size;
	if (this.grid.isLegalMove(x,y) && this.grid.isPlayerOneTurn()) {
      this.gridCells[i].classList.add("enabled");
      this.gridCells[i].classList.remove("disabled");
	}
	else {
      this.gridCells[i].classList.add("disabled");
      this.gridCells[i].classList.remove("enabled");
    }
  }
};

HtmlActuator.prototype.refreshClaims = function() {
  for (var i = 0; i < this.gridCells.length; i++) {
    var x = Math.floor(i / this.grid.size);
	var y = i % this.grid.size;
	if (this.grid.cellStates[x][y] === CellState.PlayerOne) {
      this.gridCells[i].classList.add("p1claimed");
	}
	else if (this.grid.cellStates[x][y] === CellState.PlayerTwo){
      this.gridCells[i].classList.add("p2claimed");
    }
  }
};

HtmlActuator.prototype.actuate = function() {
  this.refreshCategoryAssignments();
  this.refreshEnabledState();
  this.refreshClaims();
};