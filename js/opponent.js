function getMove(board, depth, is_player_one)
{
  var optimal_value;
  var best_move = -1;
  if (is_player_one) {
    optimal_value = Number.POSITIVE_INFINITY;
    for (var i = 0; i < board.size*board.size; i++) {
      if (board.isLegalMove(Math.floor(i / board.size), i % board.size)) {
        var copy = board.copy();
        copy.play(Math.floor(i / board.size), i % board.size);
        var value = alphabeta(copy, depth, Number.NEGATIVE_INFINITY, optimal_value, true);
        if (value < optimal_value) {
          best_move = i;
          optimal_value = value;
        }
      }
    }
  }
  else {
    optimal_value = Number.NEGATIVE_INFINITY;
    for (var i = 0; i < board.size*board.size; i++) {
      if (board.isLegalMove(Math.floor(i / board.size), i % board.size)) {
        var copy = board.copy();
        copy.play(Math.floor(i / board.size), i % board.size);
        var value = alphabeta(copy, depth, optimal_value, Number.POSITIVE_INFINITY, false);
        if (value > optimal_value) {
          best_move = i;
          optimal_value = value;
        }
      }
    }
  }
  return new Coordinate(Math.floor(best_move / board.size), best_move % board.size);
}

function alphabeta(board, depth, alpha, beta, maximize) {
  if (depth == 0 || board.gameOver()) {
    return getBoardValue(board);
  }
  var v;
  if (maximize) {
    v = Number.NEGATIVE_INFINITY;
    for (var i = 0; i < board.size*board.size; i++) {
      if (board.isLegalMove(Math.floor(i / board.size), i % board.size)) {
        var copy = board.copy();
        copy.play(Math.floor(i / board.size), i % board.size);
        v = Math.max(v, alphabeta(copy, depth-1, alpha, beta, !maximize));
        alpha = Math.max(alpha, v);
        if (alpha > beta) {
          break;
        }
      }
    }
  }
  else {
    v = Number.POSITIVE_INFINITY;
    for (var i = 0; i < board.size*board.size; i++) {
      if (board.isLegalMove(Math.floor(i / board.size), i % board.size)) {
        var copy = board.copy();
        copy.play(Math.floor(i / board.size), i % board.size);
        v = Math.min(v, alphabeta(copy, depth-1, alpha, beta, !maximize));
        beta = Math.min(beta, v);
        if (alpha > beta) {
          break;
        }
      }
    }
  }
  return v;
}

function getBoardValue(board) {
  if (board.gameOver()) {
    // player 2 won. positive value > 1
    if (board.gameState === GameState.PlayerTwoWin) {
      return 1 + board.unclaimedTiles();
    }
    // player 1 won. negative value < -1
    else if (board.gameState === GameState.PlayerOneWin) {
      return -(1 + board.unclaimedTiles());
    }
    // draw - 0
    return 0;
  }
  // if game in progress, return a value between -1 and 1 based on who has advantage
  //  return seq_len*seq_len for each unblocked sequence; then divide by size*size*num_clusters
  var value = 0;
  var collections = board.collections();
  var potential_collection = collections.next();
  while (!potential_collection.done)
  {
    var collection = potential_collection.value.cells();
    var seqlen = 0;
    var state = null;
    var potential_cell = collection.next();
    while (!potential_cell.done) {
      var cell = potential_cell.value;
      if (state && board.cellStates[cell.x][cell.y] !== state && board.cellStates[cell.x][cell.y] !== CellState.Unclaimed) {
        seqlen = 0;
        break;
      }
      if (board.cellStates[cell.x][cell.y] !== CellState.Unclaimed) {
        state = board.cellStates[cell.x][cell.y];
        seqlen++;
      }
      potential_cell = collection.next();
    }
    if (state && state === CellState.PlayerOne) {
      value -= seqlen*seqlen;
    }
    else if (state && state === CellState.PlayerTwo) {
      value += seqlen*seqlen;
    }
    potential_collection = collections.next();
  }
  return value / (board.size * board.size * board.numClusters());
}