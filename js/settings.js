const Difficulty = createEnum(['cakewalk', 'easy', 'moderate', 'difficult', 'diabolical']);
const FirstMove = createEnum(['human', 'computer', 'alternating', 'random', 'winner', 'loser']);

function Settings() {
  // set settings from defaults or cookies
  var boardsize = parseInt(getCookie("boardsize"), 10);
  if (3 <= boardsize && boardsize <= 12) {
    this.boardsize = boardsize;
  } else {
    this.boardsize = 3;
  }
  
  var ai = getCookie("ai");
  if (ai === "true" || ai === "false") {
    this.ai = (ai === "true");
  } else {
    this.ai = true;
  }
  
  var difficulty = getCookie("difficulty");
  if (Difficulty.hasOwnProperty(difficulty)) {
    this.difficulty = difficulty;
  } else {
    this.difficulty = Difficulty.moderate;
  }
  
  var firstmove = getCookie("firstmove");
  if (FirstMove.hasOwnProperty(firstmove)) {
    this.firstmove = firstmove;
  } else {
    this.firstmove = FirstMove.human;
  }
}

Settings.prototype.save = function() {
  setCookie("boardsize", this.boardsize, 360);
  setCookie("ai", this.ai, 360);
  setCookie("difficulty", this.difficulty, 360);
  setCookie("firstmove", this.firstmove, 360);
};