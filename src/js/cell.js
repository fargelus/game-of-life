/* ### cell.js -- модуль Клетка. ###
   ### Клетка знает свои координаты,
       состояние(жива/мертва), соседей. ###
   ### В зависимости от кол-ва соседей клетка
       решает свою судьбу(умрет или выживет на
       след.поколении). ###
*/

"use strict"

const Helpers = require('./helpers');

module.exports = class Cell {

  constructor(x, y, cellSize = 20, alive = true) {
    // console.log("x: " + x + "\ny: " + y + "\nalive: " + alive);
    this.cellX = x;
    this.cellY = y;
    this.size = cellSize;

    // по умолчанию клетка -- жива
    this.cellAlive = alive;

    // пустые соседи клетки
    this.emptyNeighbours = [];

    // по умолчанию все соседи -- пустые
    if (alive)
      this.fillEmptyNeighbours();

    // клетка "знает" кол-во живых клеток вокруг себя
    this.aliveNeighboursCounter = 0;
  }

  debugPrint(checkNeighbours = true) {
    console.log("X: " + this.cellX);
    console.log("Y: " + this.cellY);

    let stateInfo = this.cellAlive ? "Alive" : "Dead";
    console.log("State: " + stateInfo);

    if (checkNeighbours) {
      let len = this.emptyNeighbours.length;
      for(let i = 0; i < len; ++i)
        this.emptyNeighbours[i].debugPrint(false);
    }

  }

  // окрестность Мура
  fillEmptyNeighbours() {

    for(let currentCellY = this.cellY - this.size;
      currentCellY <= this.cellY + this.size;
      currentCellY += this.size)

      for(let currentCellX = this.cellX - this.size;
        currentCellX <= this.cellX + this.size;
          currentCellX += this.size)
      {

        if (currentCellX === this.cellX
          && currentCellY === this.cellY) continue;

        // по умолчанию все соседи -- пустые
        let cell = new Cell(currentCellX, currentCellY,
          this.size, false);

        // сохраняем инф-ю о пустых клетках
        this.emptyNeighbours.push(cell);

      }

  }

  // уточнить инф-ю о соседях и их кол-ве(!для живой клетки)
  // на вход массив всех живых клеток
  updateNeighbours(gridAliveCells) {

    let neighbours = this.emptyNeighbours;
    let neighboursLen = neighbours.length;

    // !!! для рождения
    // сначала обновляем соседей
    for(let j = 0; j < neighboursLen; ++j) {

      // только если сосед мертв(устраняем дублирование)
      if (neighbours[j].isAlive === false) {

        console.log("Dead neighbours");

        // заполним соседей
        neighbours[j].fillEmptyNeighbours();

        neighbours[j].decideDestiny(gridAliveCells);
      }
    }

    this.decideDestiny(gridAliveCells);
  }

  decideDestiny(gridAliveCells){

    // оставить только пустых соседей
    let getArrayDistract = Helpers.getArrayDistract;

    this.emptyNeighbours = getArrayDistract(this.emptyNeighbours,
                        gridAliveCells);

    this.aliveNeighboursCounter = 8 - this.emptyNeighbours.length;

    console.log("aliveNeighboursCounter: " + this.aliveNeighboursCounter);

    if (this.cellAlive) {
      // или блин негде жить => смерть от холода
      // или мне одиноко => покончу собой
      if (this.aliveNeighboursCounter < 2 || this.aliveNeighboursCounter > 3) {
        this.cellAlive = false;
      }
    }
    else{
      this.cellAlive = (this.aliveNeighboursCounter === 3);
      console.log(this.cellAlive);
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

  get cellSize(){
    return this.size;
  }

  set cellSize(sz){
    this.size = sz;
  }
};
