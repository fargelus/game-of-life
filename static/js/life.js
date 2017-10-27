const Cell = require('./cell');
const Helpers = require('./helpers');

class Life {
  constructor(aliveCells, cellSize) {
    this.alive = [];
    this.size = cellSize;

    const aliveCellsLen = aliveCells.length;
    for (let i = 0; i < aliveCellsLen; i += 1) {
      const cell = new Cell(aliveCells[i].x, aliveCells[i].y, this.size);
      this.alive.push(cell);
    }
  }

  // На очередном шаге клетка узнает о живых соседях
  updateNeighboursContext() {
    // обновим инф-ю в клетках и их соседях
    // о живых клетках
    const aliveCellsNumber = this.alive.length;
    for (let i = 0; i < aliveCellsNumber; i += 1) {
      const aliveCell = this.alive[i];

      // при обновлении клетка меняет своё состояние
      aliveCell.updateNeighbours(this.alive);
    }
  }

  nextGeneration() {
    this.updateNeighboursContext();

    const nextGen = [];
    const len = this.alive.length;
    // Для всех живых клеток проверка соседей
    for (let i = 0; i < len; i += 1) {
      const currentCell = this.alive[i];
      const neighbours = currentCell.emptyNeighbours;
      const neighboursLen = neighbours.length;

      // проверка соседей(вдруг кто-то из них родился)
      for (let j = 0; j < neighboursLen; j += 1) {
        const inNextGen = Helpers.containsObject(nextGen, neighbours[j]);

        if (neighbours[j].isAlive && inNextGen === false) {
          const cell = new Cell(
            neighbours[j].x,
            neighbours[j].y,
            this.size,
          );
          nextGen.push(cell);
        }
      }

      if (currentCell.isAlive) {
        const cell = new Cell(currentCell.x, currentCell.y, this.size);
        nextGen.push(cell);
      }
    }

    this.alive = nextGen;
  }

  addCell(x, y, size = this.size) {
    const cell = new Cell(x, y, size);
    this.alive.push(cell);
  }

  get aliveCells() {
    return this.alive;
  }

  makeRandomConfig(dimensionX, dimensionY) {
    this.alive = [];

    // Все предполагаемые клетки
    const allCells = dimensionX * dimensionY;

    // Кол-во клеток в случайной конфигурации
    const randomCellsNumber = allCells * 0.5;

    // Получить случайное число от 0 до границы
    const getRandom = function getRandom(upperBound) {
      return parseInt(Math.random() * upperBound, 10);
    };

    for (let i = 0; i < randomCellsNumber; i += 1) {
      const row = getRandom(dimensionY);
      const col = getRandom(dimensionX);

      const x = row * this.size;
      const y = col * this.size;

      const cell = new Cell(x, y, this.size);

      // Если массив пуст или не содержит
      // клетки с такими координатами
      const isContain = Helpers.containsObject(this.alive, cell);
      if (this.alive.length === 0 || isContain === false) {
        this.alive.push(cell);
      }
    }
  }

  clear() {
    this.alive = [];
  }

  set aliveCells(newAlive) {
    this.alive = newAlive;
  }
}

module.exports = Life;
