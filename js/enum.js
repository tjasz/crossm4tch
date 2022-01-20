// https://masteringjs.io/tutorials/fundamentals/enum

function createEnum(values) {
  const enumObject = {};
  for (const val of values) {
    enumObject[val] = val;
  }
  return Object.freeze(enumObject);
}

const CellState = createEnum(['Unclaimed', 'PlayerOne', 'PlayerTwo']);

const GameState = createEnum(['InProgress', 'PlayerOneWin', 'PlayerTwoWin', 'Draw']);