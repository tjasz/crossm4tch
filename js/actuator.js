function HtmlActuator() {
  this.lastTileContainer = document.querySelector(".last-tile");
  this.lastTile = -1;
}

HtmlActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HtmlActuator.prototype.actuate = function(grid) {
  this.lastTile = grid.lastTileCategoryInfo;
  var cat1 = Math.floor(this.lastTile / grid.size);
  var cat2 = this.lastTile % grid.size;
  var classes = ["last-tile", "cat2-" + cat2];
  this.lastTileContainer.textContent = cat1;
  this.applyClasses(this.lastTileContainer, classes);
};