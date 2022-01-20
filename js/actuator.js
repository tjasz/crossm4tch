function HtmlActuator() {
}

HtmlActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HtmlActuator.prototype.refreshCategoryAssignments = function(grid) {
  // refresh category display for all grid cells
  var gridCells = document.getElementsByClassName("grid-cell");
  for (var i = 0; i < gridCells.length; i++) {
    var cat1 = Math.floor(grid.categoryAssignments[i] / grid.size);
    var cat2 = grid.categoryAssignments[i] % grid.size;
	gridCells[i].textContent = cat1+1;
    var classes = ["grid-cell", "cat2-" + cat2];
	this.applyClasses(gridCells[i], classes);
  }
  // refresh category display for the last tile cell
  var lastTileContainer = document.querySelector(".last-tile");
  var lastTile = grid.lastTileCategoryInfo;
  if (lastTile >= 0) {
    cat1 = Math.floor(lastTile / grid.size);
    cat2 = lastTile % grid.size;
    lastTileContainer.textContent = cat1+1;
    classes = ["last-tile", "cat2-" + cat2];
    this.applyClasses(lastTileContainer, classes);
  }
  else {
    lastTileContainer.textContent = "";
    this.applyClasses(lastTileContainer, "last-tile");
  }
};

HtmlActuator.prototype.actuate = function(grid) {
  this.refreshCategoryAssignments(grid);
};