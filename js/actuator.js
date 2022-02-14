function HtmlActuator(settings) {
  this.settings = settings;
  this.settingsIcon = document.getElementById("settings_icon");
  this.settingsIcon.addEventListener('click', openSettings);
  this.closeIcon = document.getElementById("close_icon");
  this.closeIcon.addEventListener('click', closeSettings);
  this.formInit();

  this.initGrid();
  this.lastTileContainer = document.querySelector(".last-tile");
  this.gameStateInfo = document.getElementById("gameStateInfo");
  this.gameStateMessage = document.getElementById("gameStateMessage");
  this.restartButton = document.getElementById("restartButton");
  this.restartButton.addEventListener('click', restart.bind(this));

  window.onresize = resizeCells.bind(this);
}

HtmlActuator.prototype.initGrid = function () {
  this.grid = new GameBoard(this.settings.boardsize);

  var htmlGrid = document.querySelector(".grid");
  htmlGrid.innerHTML = "";
  for (let i = 0; i < this.settings.boardsize; i++) {
    var row = document.createElement("tr");
    row.setAttribute("class", "grid-row");
    for (let j = 0; j < this.settings.boardsize; j++) {
      var cell = document.createElement("td");
      cell.setAttribute("class", "grid-cell");
      row.appendChild(cell);
    }
    htmlGrid.appendChild(row);
  }
  
  this.gridCells = document.getElementsByClassName("grid-cell");
  for (var i = 0; i < this.gridCells.length; i++) {
    var x = Math.floor(i / this.grid.size);
    var y = i % this.grid.size;
    this.gridCells[i].x = x;
    this.gridCells[i].y = y;
    this.gridCells[i].addEventListener('click', tileClick.bind(this));
  }
  var resizeBound = resizeCells.bind(this);
  resizeBound();
};

function resizeCells() {
  var containerWidth = document.querySelector(".container").clientWidth;
  var cellWidth = (containerWidth - 30*(this.settings.boardsize-1)) / this.settings.boardsize;
  if (containerWidth >= 600) {
    cellWidth = Math.min(cellWidth, 100);
  } else {
    cellWidth = Math.min(cellWidth, 60);
  }
  for (var i = 0; i < this.gridCells.length; i++) {
    this.gridCells[i].style.width = cellWidth + "px";
    this.gridCells[i].style.height = cellWidth + "px";
    this.gridCells[i].style.fontSize = 0.8 * cellWidth + "px";
  }
}

function getOpponentMove() {
  var depth = this.searchDepth();
  console.log("Search depth: " + depth);
  var p2play = getMove(this.grid, depth, false);
  this.grid.play(p2play.x, p2play.y);
  this.actuate();
}

HtmlActuator.prototype.searchDepth = function () {
  // Decision time is proportional to n^2 * b^d
  // where n is the boardsize,
  // b is the branching factor (no more than 2(n-1) for most moves. 4(n-1) for first move)
  // d is the search depth.
  // Difficulty is defined by by this decision time expression, based on a baseline of boardsize=4.
  // 4^2 * (2(4-1))^d = n^2 * (2(n-1))^d' --> d' = (2log(4) - 2log(n) + d log(2(4-1)))/log(2(n-1))
  // But the branching factor goes down as you play, so depth 16 on a 4x4 will have a lower average
  // branching factor than depth 16 on a 5x5. Let's approximate the average branching factor as
  // .5 * (2(n-1) + min(2(n-1), (n^2-d)/(n/2)))
  var avgBranch = function(depth, boardsize) {
    return 0.5 * (2*(boardsize-1) + Math.min(2*(boardsize-1),(Math.max(0, boardsize*boardsize-depth))/(boardsize/2)));
  };
  var expr = function(baselineDepth, boardsize, branching) {
    return Math.max(1, (2*Math.log(4) - 2*Math.log(boardsize) + baselineDepth * Math.log(avgBranch(baselineDepth,4))) / Math.log(branching));
  }
  var findDepth = function(baselineDepth, boardsize) {
    var depth = NaN;
    // make a decent guess at the depth using the average at the baseline depth as the branching factor
    var depthGuess = expr(baselineDepth, boardsize, avgBranch(baselineDepth,boardsize));
    while (isNaN(depth) || Math.abs(depth - depthGuess) > 0.1) {
      // use that guess depth to more accurately approximate the average branching factor, update depth
      depth = depthGuess;
      depthGuess = expr(baselineDepth, boardsize, avgBranch(depthGuess,boardsize));
    }
    return Math.floor(depth);
  };
  switch(this.settings.difficulty) {
    case Difficulty.cakewalk:
      return findDepth(1, this.settings.boardsize);
      break;
    case Difficulty.easy:
      return findDepth(2, this.settings.boardsize);
      break;
    case Difficulty.moderate:
      return findDepth(4, this.settings.boardsize);
      break;
    case Difficulty.difficult:
      return findDepth(8, this.settings.boardsize);
      break;
    case Difficulty.diabolical:
      // diabolical is equivalent to perfect play on a 4x4
      return findDepth(16, this.settings.boardsize);
      break;
    default:
      return 1;
  }
};

function tileClick(evt) {
  this.grid.play(evt.target.x, evt.target.y);
  this.actuate();
  if (this.grid.isPlayerTwoTurn() && !this.grid.gameOver() && this.settings.ai) {
    setTimeout(getOpponentMove.bind(this),20);
  }
}

function openSettings(evt) {
  var div = document.getElementById("settings");
  div.style.display = "block";
}

function closeSettings() {
  var div = document.getElementById("settings");
  div.style.display = "none";
}

HtmlActuator.prototype.formInit = function () {
  var settingsForm = document.querySelector('form');
  settingsForm.addEventListener('change', formChange.bind(this));
  
  // set settings form values from settings object
  settingsForm.boardsize.value = this.settings.boardsize.toString();
  settingsForm.ai.checked = this.settings.ai;
  // hide AI settings if unchecked
  if (settingsForm.ai.checked) {
    document.getElementById("difficultyLabel").style.visibility = "visible";
    document.getElementById("firstmoveLabel").style.visibility = "visible";
  } else {
    document.getElementById("difficultyLabel").style.visibility = "hidden";
    document.getElementById("firstmoveLabel").style.visibility = "hidden";
  }
  settingsForm.difficulty.value = this.settings.difficulty;
  settingsForm.firstmove.value = this.settings.firstmove;
}

function formChange(evt) {
  // fetch form values
  var form = document.querySelector('form');
  if (evt.target.id === "boardsize") {
    this.settings.boardsize = parseInt(form.boardsize.value, 10);
    this.initGrid();
    // update game instructions on winning collections
    var collectionsSpan = document.getElementById("winning_collections");
    if (this.grid.smaller_factor() == 1) {
      collectionsSpan.textContent = "row, column, or diagonal";
    } else if (this.grid.smaller_factor() == this.grid.larger_factor()) {
      collectionsSpan.textContent = "row, column, diagonal, or " + this.grid.smaller_factor() + "x" + this.grid.smaller_factor() + " square";
    } else {
      collectionsSpan.textContent = "row, column, diagonal, or " + this.grid.smaller_factor() + "x" + this.grid.larger_factor() + " rectangle";
    }
  } else if (evt.target.id === "ai") {
    this.settings.ai = form.ai.checked;
    // hide AI settings if unchecked
    if (form.ai.checked) {
      document.getElementById("difficultyLabel").style.visibility = "visible";
      document.getElementById("firstmoveLabel").style.visibility = "visible";
    } else {
      document.getElementById("difficultyLabel").style.visibility = "hidden";
      document.getElementById("firstmoveLabel").style.visibility = "hidden";
    }
  } else if (evt.target.id === "difficulty") {
    this.settings.difficulty = form.difficulty.value;
  } else if (evt.target.id === "firstmove") {
    this.settings.firstmove = form.firstmove.value;
  }
  // update cookies
  this.settings.save();
  // update game/display
  this.grid.setup();
  this.actuate();
}

function restart(evt) {
  this.grid.setup();
  this.actuate();
}

HtmlActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HtmlActuator.prototype.refreshCategoryAssignments = function() {
  // refresh category display for all grid cells
  for (var i = 0; i < this.gridCells.length; i++) {
    var cat1 = Math.floor(this.grid.categoryAssignments[i] / this.grid.size);
    var cat2 = this.grid.categoryAssignments[i] % this.grid.size;
	this.gridCells[i].textContent = Number(cat1+1).toString(16);
    var classes = ["grid-cell", "cat2-" + cat2];
    // if this was the last tile, include the last-tile class as well
    if (this.grid.lastTileCategoryInfo >= 0 && this.grid.lastTileCategoryInfo === this.grid.categoryAssignments[i])
    {
      classes.push("last-tile");
    }
	this.applyClasses(this.gridCells[i], classes);
  }
  // refresh category display for the last tile cell
  var lastTile = this.grid.lastTileCategoryInfo;
  if (lastTile >= 0) {
    cat1 = Math.floor(lastTile / this.grid.size);
    cat2 = lastTile % this.grid.size;
    this.lastTileContainer.textContent = Number(cat1+1).toString(16);
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
	if (this.grid.isLegalMove(x,y) && (!this.settings.ai || this.grid.isPlayerOneTurn())) {
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

HtmlActuator.prototype.updateGameStateInfo = function() {
  if (this.grid.gameOver())
  {
    this.gameStateMessage.style.display = "inline";
    if (this.grid.gameState === GameState.PlayerOneWin)
    {
      this.gameStateMessage.textContent = "Player one wins!";
    }
    else if (this.grid.gameState === GameState.PlayerTwoWin)
    {
      this.gameStateMessage.textContent = "Player two wins!";
    }
    else
    {
      this.gameStateMessage.textContent = "Draw game...";
    }
  }
  else
  {
    this.gameStateMessage.style.display = "none";
  }
};

HtmlActuator.prototype.actuate = function() {
  this.refreshCategoryAssignments();
  this.refreshEnabledState();
  this.refreshClaims();
  this.updateGameStateInfo();
};