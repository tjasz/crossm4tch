// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  var grid = new GameBoard(4);
  grid.lastTileCategoryInfo = 4;
  var act = new HtmlActuator();
  act.actuate(grid);
});