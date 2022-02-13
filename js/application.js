// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  var settings = new Settings();
  var act = new HtmlActuator(settings);
  act.actuate();
});