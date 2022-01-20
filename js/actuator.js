function HtmlActuator() {
  this.gridCells = document.getElementsByClassName("grid-cell");
  this.lastTileContainer = document.querySelector(".last-tile");
}

HtmlActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HtmlActuator.prototype.refreshCategoryAssignments = function(grid) {
  // refresh category display for all grid cells
  for (var i = 0; i < this.gridCells.length; i++) {
    var cat1 = Math.floor(grid.categoryAssignments[i] / grid.size);
    var cat2 = grid.categoryAssignments[i] % grid.size;
	this.gridCells[i].textContent = cat1+1;
    var classes = ["grid-cell", "cat2-" + cat2];
	this.applyClasses(this.gridCells[i], classes);
  }
  // refresh category display for the last tile cell
  var lastTile = grid.lastTileCategoryInfo;
  if (lastTile >= 0) {
    cat1 = Math.floor(lastTile / grid.size);
    cat2 = lastTile % grid.size;
    this.lastTileContainer.textContent = cat1+1;
    classes = ["last-tile", "cat2-" + cat2];
    this.applyClasses(this.lastTileContainer, classes);
  }
  else {
    this.lastTileContainer.textContent = "";
    this.applyClasses(this.lastTileContainer, ["last-tile"]);
  }
};

HtmlActuator.prototype.refreshEnabledState = function(grid) {
  for (var i = 0; i < this.gridCells.length; i++) {
    var x = Math.floor(i / grid.size);
	var y = i % grid.size;
	if (grid.isLegalMove(x,y)) {
      this.gridCells[i].classList.add("enabled");
      this.gridCells[i].classList.remove("disabled");
	}
	else {
      this.gridCells[i].classList.add("disabled");
      this.gridCells[i].classList.remove("enabled");
    }
  }
};

HtmlActuator.prototype.actuate = function(grid) {
  this.refreshCategoryAssignments(grid);
  this.refreshEnabledState(grid);
};