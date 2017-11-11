/* ### cell.js -- модуль Клетка. ###
   ### Клетка знает свои координаты,
       состояние(жива/мертва), соседей. ###
   ### В зависимости от кол-ва соседей клетка
       решает свою судьбу(умрет или выживет на
       след.поколении). ###
*/

const Helpers = require('./helpers');

module.exports = class Cell {
  constructor(x, y, cellSize, alive = true) {
    // console.log("x: " + x + "\ny: " + y + "\nalive: " + alive);
    this.cellX = x;
    this.cellY = y;
    this.size = cellSize;

    // по умолчанию клетка -- жива
    this.cellAlive = alive;

    // пустые соседи клетки
    this.emptyNeighbours = [];

    // по умолчанию все соседи -- пустые
    if (alive) {
      this.fillEmptyNeighbours();
    }

    // клетка "знает" кол-во живых клеток вокруг себя
    this.aliveNeighboursCounter = 0;
  }

  /* Desc: Отладочный вывод.
     Input(checkNeighbours -> Boolean):
          Рекурсивная проверка.
     Output(undefined) */
  debugPrint(checkNeighbours = true) {
    // add console.log for debug
    // const stateInfo = this.cellAlive ? 'Alive' : 'Dead';
    if (checkNeighbours) {
      const len = this.emptyNeighbours.length;
      for (let i = 0; i < len; i += 1) {
        this.emptyNeighbours[i].debugPrint(false);
      }
    }
  }

  /* Desc: Заполнить пустых соседей.
           Соседи рассчитываются по окрестности Мура.
     Input(undefined)
     Output(undefined) */
  fillEmptyNeighbours() {
    for (let currentCellY = this.cellY - this.size;
      currentCellY <= this.cellY + this.size;
      currentCellY += this.size) {
      for (let currentCellX = this.cellX - this.size;
        currentCellX <= this.cellX + this.size;
        currentCellX += this.size) {
        // Исключаем саму клетку no-continue
        if ((currentCellX === this.cellX &&
             currentCellY === this.cellY) === false
        ) {
          // по умолчанию все соседи -- пустые
          const cell = new Cell(
            currentCellX, currentCellY,
            this.size, false,
          );
          // сохраняем инф-ю о пустых клетках
          this.emptyNeighbours.push(cell);
        }
      }
    }
  }

  /* Desc: Обновить инф-ю о соседях живой клетки и их кол-ве.
     Input(gridAliveCells -> Array): Массив всех живых клеток
     Output(undefined) */
  updateNeighbours(gridAliveCells) {
    const neighbours = this.emptyNeighbours;
    const neighboursLen = neighbours.length;

    // !!! для рождения
    // сначала обновляем соседей
    for (let j = 0; j < neighboursLen; j += 1) {
      // только если сосед мертв(устраняем дублирование)
      if (neighbours[j].isAlive === false) {
        // заполним соседей
        neighbours[j].fillEmptyNeighbours();

        neighbours[j].decideDestiny(gridAliveCells);
      }
    }

    this.decideDestiny(gridAliveCells);
  }

  /* Desc: Клетка определяет свою дальнейшую судьбу.
     Input(gridAliveCells -> Array): Массив всех живых клеток
     Output(undefined) */
  decideDestiny(gridAliveCells) {
    // оставить только пустых соседей
    const { getArrayDistract } = Helpers;

    this.emptyNeighbours = getArrayDistract(
      this.emptyNeighbours,
      gridAliveCells,
    );

    this.aliveNeighboursCounter = 8 - this.emptyNeighbours.length;

    if (this.cellAlive) {
      // или блин негде жить => смерть от холода
      // или мне одиноко => покончу собой
      if (this.aliveNeighboursCounter < 2 ||
        this.aliveNeighboursCounter > 3) {
        this.cellAlive = false;
      }
    } else {
      this.cellAlive = (this.aliveNeighboursCounter === 3);
    }
  }

  get neighbours() {
    return this.emptyNeighbours;
  }

  get x() {
    return this.cellX;
  }

  get y() {
    return this.cellY;
  }

  get isAlive() {
    return this.cellAlive;
  }

  get cellSize() {
    return this.size;
  }

  set cellSize(sz) {
    this.size = sz;
  }
};
