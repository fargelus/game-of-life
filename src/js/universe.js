// universe.js -- Вселенная состоящая из клеток

const Cell = require('./cell');
const Helpers = require('./helpers');


module.exports = (function Universe() {
  // HTML5 canvas
  const cnv = document.getElementById('canvas');

  // buttons
  const stepBtn = document.getElementById('step-button');
  const clearBtn = document.getElementById('clear-button');
  const runBtn = document.getElementById('run-button');
  const pauseBtn = document.getElementById('pause-button');
  const randomBtn = document.getElementById('random-btn');

  // inputs
  const speedInput = document.getElementById('speed-input');
  let time = 250;

  const cellSizeInput = document.getElementById('js-range');

  // Helpers
  const { containsObject } = Helpers;

  // ******* Клетки *********
  let cellSize = 20;

  // корд-ты клеток в бесконечной плоскости
  let gridAliveCells = [];

  // коорд-ты клетки
  // на двумерной конечной плоскости
  let renderCells = [];

  // **********************

  let isPause = false;

  // ********** module functions *************
  function createGrid() {
    const context = cnv.getContext('2d');

    const { width } = cnv;
    const { height } = cnv;

    // after prev call
    context.clearRect(0, 0, width, height);

    context.fillStyle = 'white'; // canvas color
    context.fillRect(0, 0, width, height);

    context.strokeStyle = 'black'; // cell stroke color

    // Делаем сетку без обрезов
    const laxWidth = parseInt(width / cellSize, 10) * cellSize;
    const laxHeight = parseInt(height / cellSize, 10) * cellSize;

    // grid rendering
    for (let posX = 0; posX <= laxWidth; posX += cellSize) {
      context.beginPath();
      context.moveTo(posX, 0);
      context.lineTo(posX, laxHeight);
      context.stroke();
      context.closePath();
    }

    for (let posY = 0; posY <= laxHeight; posY += cellSize) {
      context.beginPath();
      context.moveTo(0, posY);
      context.lineTo(laxWidth, posY);
      context.stroke();
      context.closePath();
    }
  }

  // раскрасить живую клетку
  function paintCell(xGridCellStart, yGridCellStart) {
    const context = cnv.getContext('2d');

    context.strokeStyle = 'rgba(135, 0, 0, 1)';

    const yGridCellEnd = yGridCellStart + cellSize;
    let yCoordCounter = yGridCellStart;

    while (yCoordCounter < yGridCellEnd) {
      context.beginPath();
      context.moveTo(xGridCellStart, yCoordCounter);
      context.lineTo(xGridCellStart + cellSize, yCoordCounter);
      context.stroke();
      context.closePath();

      yCoordCounter += 1;
    }
  }

  function refresh() {
    createGrid();

    // рендерим все живые клетки
    const renderCellsLen = renderCells.length;
    for (let i = 0; i < renderCellsLen; i += 1) {
      paintCell(renderCells[i].x, renderCells[i].y);
      paintCell(renderCells[i].x, renderCells[i].y);
    }
  }

  function clearGrid(/* evt */) {
    gridAliveCells = [];
    renderCells = [];
    createGrid();
  }

  // Преобразование скорости(выбор пол-ля)
  // во время задержки вызова фун-и makeStep
  function convertSpeedInTime(speed) {
    const initialDelay = 500;
    const ratio = 2;

    let resDelay = initialDelay;
    let counter = 1;

    while (counter !== speed) {
      resDelay /= ratio;
      counter += 1;
    }

    time = resDelay;
  }

  // получить коо-ты клика на холсте
  function getMousePos(evt) {
    const rect = cnv.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  }

  // получить к-ты начала клетки (левый верхний угол)
  function getCellCoord(x, y) {
    const factorX = parseInt(x / cellSize, 10);
    const factorY = parseInt(y / cellSize, 10);

    return [factorX * cellSize, factorY * cellSize];
  }

  // Вышла ли коорд-та за пределы?
  // 1 -- смещение положительное
  // -1 -- смещение отрицательное
  // 0 -- смещения нет
  function isCoordOverBound(coord, bound) {
    if (coord < 0) {
      return -1;
    } else if (coord > bound) {
      return 1;
    }
    return 0;
  }

  // расчет координаты смещения при выходе
  // за пределы вселенной
  function calculateOffsetCoord(coord, bound) {
    // положительное смещение
    if (coord >= bound) {
      return coord % bound;
    }

    // отрицательное смещение
    return bound - Math.abs(coord % bound);
  }

  // Описание: Вышла ли клетка за границы вселенной
  // Вход: Коорд-ты рожденной клетки
  // Выход: Новые коорд-ты клетки
  function updateBeyondBoundsCoords(coordX, coordY) {
    // Кэшируем на всякий случай
    const gridWidth = cnv.width;
    const gridHeight = cnv.height;

    // граница -- это ширина/высота минус размер клетки
    const boundX = gridWidth - cellSize;
    const boundY = gridHeight - cellSize;

    // Вышла ли координата за границы вселенной
    const resX = isCoordOverBound(coordX, boundX);
    const resY = isCoordOverBound(coordY, boundY);

    let toroidCoordX = coordX;
    // Если смещение по Х -> перерасчет координаты Х
    if (resX !== 0) {
      toroidCoordX = calculateOffsetCoord(coordX, gridWidth);
    }

    let toroidCoordY = coordY;
    // Если смещение по Y -> перерасчет координат Y
    if (resY !== 0) {
      toroidCoordY = calculateOffsetCoord(coordY, gridHeight);
    }

    return [].concat(toroidCoordX, toroidCoordY);
  }

  // Обновляем отображаемые клетки
  function updateRenderCells() {
    renderCells = [];
    const aliveCellNumber = gridAliveCells.length;
    for (let i = 0; i < aliveCellNumber; i += 1) {
      const aliveCellX = gridAliveCells[i].x;
      const aliveCellY = gridAliveCells[i].y;

      const [renderCoordX, renderCoordY] =
                          updateBeyondBoundsCoords(
                            aliveCellX,
                            aliveCellY,
                          );

      const renderCell = new Cell(renderCoordX, renderCoordY);
      renderCells.push(renderCell);
    }
  }

  // На очередном шаге клетка узнает о живых соседях
  function updateLivingCellNeighbours() {
    // обновим инф-ю в клетках и их соседях
    // о живых клетках
    const aliveCellsNumber = gridAliveCells.length;
    for (let i = 0; i < aliveCellsNumber; i += 1) {
      const aliveCell = gridAliveCells[i];

      // при обновлении клетка меняет своё состояние
      aliveCell.updateNeighbours(gridAliveCells);
    }
  }

  function makeStep() {
    const nextGen = [];

    // Клетка узнает о своих соседях => изменяет
    // своё состояние
    updateLivingCellNeighbours();

    const len = gridAliveCells.length;
    for (let i = 0; i < len; i += 1) {
      const aliveCell = gridAliveCells[i];
      const neighbours = aliveCell.emptyNeighbours;
      const neighboursLen = neighbours.length;

      for (let j = 0; j < neighboursLen; j += 1) {
        if (neighbours[j].isAlive &&
          !containsObject(nextGen, neighbours[j])) {
          const cell = new Cell(neighbours[j].x, neighbours[j].y);
          nextGen.push(cell);
        }
      }

      if (aliveCell.isAlive) {
        const cell = new Cell(aliveCell.x, aliveCell.y);
        nextGen.push(cell);
      }
    }

    gridAliveCells = nextGen;

    updateRenderCells();

    refresh();
  }

  // Условия остановки: конфигурация является
  // стабильной(конфигурация на предыдущем шаге === текущей)
  // Прим.: Блок
  function isConfigStable(prevGen) {
    let retVal = false;
    const prevGenLen = prevGen.length;
    let counter = 0;
    for (; counter < prevGenLen; counter += 1) {
      // Если хотя бы одна клетка отлична => прерываем цикл
      if (!containsObject(gridAliveCells, prevGen[counter])) {
        break;
      }
    }

    if (counter === prevGenLen) {
      retVal = true;
    }

    return retVal;
  }

  function run() {
    if (isPause) {
      return;
    }

    const prevGen = gridAliveCells.slice();

    makeStep();

    // Условия останова
    if (isConfigStable(prevGen) || gridAliveCells.length === 0) {
      return;
    }

    setTimeout(run, time);
  }

  function placeRandomCells() {
    // Очищаем сетку
    clearGrid();

    // Кол-во рядов/колонок на сетке
    // Берем нижнюю границу(26.6 рядов !== 27)
    const rowsNumber = Math.floor(cnv.height / cellSize);
    const colsNumber = Math.floor(cnv.width / cellSize);

    // Общее число клеток
    const canvasCellsVolume = rowsNumber * colsNumber;

    // Кол-во клеток в случайной конфигурации
    const randomCellsNumber = canvasCellsVolume * 0.5;

    // Named Function Expression
    const getRandom = function getRandom(upperBound) {
      return parseInt(Math.random() * upperBound, 10);
    };

    const convertNumberToGridCoord = function convertFunc(number) {
      return cellSize * parseInt(number / cellSize, 10);
    };

    const randomCellsArray = [];
    for (let i = 0; i < randomCellsNumber; i += 1) {
      // Получить случайные значения в пределах размеров
      // сетки
      const randomX = getRandom(cnv.width);
      const randomY = getRandom(cnv.height);

      // Преобразовать случайные значения в координаты
      // на сетке
      const coordX = convertNumberToGridCoord(randomX);
      const coordY = convertNumberToGridCoord(randomY);

      const randomCell = new Cell(coordX, coordY);

      // Если массив пуст или не содержит
      // клетки с такими координатами
      if (randomCellsArray.length === 0 ||
          !(containsObject(randomCellsArray, randomCell))) {
        randomCellsArray.push(randomCell);
      }
    }

    gridAliveCells = randomCellsArray;
    renderCells = randomCellsArray;
    refresh();
  }

  // DOM Event Listeners
  function addListeners() {
    stepBtn.addEventListener('click', makeStep);
    clearBtn.addEventListener('click', clearGrid);

    runBtn.addEventListener('click', (/* evt */) => {
      isPause = false;
      run();
    });

    pauseBtn.addEventListener('click', (/* evt */) => {
      isPause = !isPause;
      if (!isPause) {
        run();
      }
    });

    // Клик на холсте -> клетка живая
    cnv.addEventListener('click', (evt) => {
      // определим координаты клика
      const mousePos = getMousePos(evt);

      // определим к-ты клетки
      const [xGridCellStart, yGridCellStart] = getCellCoord(
        mousePos.x,
        mousePos.y,
      );

      const cell = new Cell(xGridCellStart, yGridCellStart);

      // сохраним инф-ию о живой клетке
      gridAliveCells.push(cell);
      renderCells.push(cell);

      paintCell(xGridCellStart, yGridCellStart);
      paintCell(xGridCellStart, yGridCellStart);
    });

    speedInput.addEventListener('input', () => {
      convertSpeedInTime(+speedInput.value);
    });

    cellSizeInput.addEventListener('input', (/* evt */) => {
      cellSize = +cellSizeInput.value;
      refresh();
    });

    randomBtn.addEventListener('click', placeRandomCells);
  }

  // Main stream
  addListeners();
  // Сетка на холсте
  createGrid();
}());
