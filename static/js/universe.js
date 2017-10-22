// universe.js -- Вселенная состоящая из клеток

// const Cell = require('./cell');
const Helpers = require('./helpers');
const obelisk = require('obelisk.js');
const _ = require('underscore');
require('underscore-observe')(_);

module.exports = (function Universe() {
  // HTML5 canvas
  const cnv = document.getElementsByTagName('canvas')[0];

  // ************* obelisk init **************
  // для расчета кол-ва тайлов
  const cnvCenterX = cnv.width / 2;
  const cnvCenterY = cnv.height / 2;

  // Начало координат изометрической сетки(200, 100)
  const isometricOriginX = cnvCenterX;
  const isometricOriginY = 100;
  const point = new obelisk.Point(
    isometricOriginX,
    isometricOriginY,
  );

  // контейнер( сцена )
  const pixelView = new obelisk.PixelView(cnv, point);

  let brickSize = 40;

  // Кол-во тайлов на грани ромба
  let tileNumberEdge;

  // Кол-во тайлов на диагонали ромба
  let tileNumberDiagonal;

  // кирпич -- клетка в изометрии
  let brick;

  // цвет
  // color alias
  const gray = obelisk.ColorPattern.GRAY;
  const brickColor = new obelisk.SideColor().getByInnerColor(gray);

  // cube
  let cube;

  // ************** Helpers *****************
  const { containsObject } = Helpers;
  const { fillArrayWithValue } = Helpers;
  // ************** End of helpers **********

  // коорд-ты всех клеток на сетке
  let cellCols = [];
  let gridCells = [];

  // ************** End of obelisk init **************

  // buttons
  // const stepBtn = document.getElementById('step-button');
  const clearBtn = document.getElementById('clear-button');
  // const runBtn = document.getElementById('run-button');
  // const pauseBtn = document.getElementById('pause-button');
  const randomBtn = document.getElementById('random-btn');

  // inputs
  // const speedInput = document.getElementById('speed-input');
  // let time = 250;

  // stats
  // const genOutput = document.getElementById('js-output-gen');
  const cellsCounterOutput =
            document.getElementById('js-output-cells-count');
  const aliveCellsCounter =
            document.getElementById('js-output-alive-cells-count');

  const brickSizeRange = document.getElementById('js-range');


  // ******* Фишки *********
  // изометрические к-ты фишек
  let chips = [];
  const updateAliveCellsCounter = () => {
    aliveCellsCounter.value = chips.length;
  };

  // callback вызывается при изменении элементов в массиве
  _.observe(chips, 'create', updateAliveCellsCounter);
  _.observe(chips, 'delete', updateAliveCellsCounter);

  // коорд-ты клетки
  // на двумерной конечной плоскости
  // let renderCells = [];

  // **********************

  // let isPause = false;

  // ********** module functions *************

  /* Desc: Расположить тайл на сетке
     Input(x -> Number, y -> Number, tile -> obelisk):
        x -- изометрическая к-та по оси абсцисс,
        y -- изометрическая к-та по оси ординат,
        tile -- инстанс отображаемого тайла
     Output(undefined) */
  function placeTile(x, y, z, tile) {
    const p3d = new obelisk.Point3D(x, y, z);
    pixelView.renderObject(tile, p3d);
  }

  /* Desc: Инициализация значимых переменных: obelisk, stats...
     Input(undefined)
     Output(undefined) */
  function initVariables() {
    // размер кирпича(делаем ромб)
    // x -- ширина, y -- высота(в плоскости xy),
    // z -- высота в пр-ве(xyz)
    const brickDimension = new obelisk.BrickDimension(
      brickSize,
      brickSize,
    );

    // Кол-во тайлов на гранях ромба
    tileNumberEdge = parseInt(cnvCenterX / brickSize, 10);
    // Кол-во тайлов на диагонали ромба
    tileNumberDiagonal = parseInt(cnvCenterY / brickSize, 10);
    // Всего клеток (output)
    cellsCounterOutput.value = tileNumberEdge * tileNumberDiagonal;

    // кирпич -- клетка в изометрии
    brick = new obelisk.Brick(brickDimension, brickColor);

    // cube
    const cubeDimension = new obelisk.CubeDimension(
      brickSize, brickSize,
      brickSize / 2,
    );

    // cube color
    const cubeColorInstance = new obelisk.CubeColor();
    const cubeColor = cubeColorInstance.getByHorizontalColor(0xFF0000);

    cube = new obelisk.Cube(cubeDimension, cubeColor);

    // К-ты всех ячеек на доске (row, col)
    cellCols = fillArrayWithValue(0, tileNumberEdge);
    gridCells = fillArrayWithValue(0, tileNumberDiagonal);
    gridCells = gridCells.map(() => cellCols.slice());
  }

  /* Desc: Создание изометрической доски для размещения фишек
     Input(undefined)
     Output(undefined) */
  function createGrid() {
    pixelView.clear();
    initVariables();

    let iterY = 0;
    let iterX = 0;

    // grid
    for (let i = 0; i < tileNumberDiagonal; i += 1) {
      for (let j = 0; j < tileNumberEdge; j += 1) {
        const coord = { x: iterX, y: iterY };
        gridCells[i][j] = coord;

        placeTile(iterX, iterY, 0, brick);
        iterX += brickSize;
      }

      iterX = 0;
      iterY += brickSize;
    }
  }

  /* Desc: Экранные координаты -> координаты сетки
     Input(x, y): экранные координаты
     Output(Object): матричные коорд-ты сетки */
  function transformScreenToView(x, y) {
    /* смещение отн-но начала координат
       изометрической плоскости */
    const offsetX = x - isometricOriginX;
    const offsetY = y - isometricOriginY;

    // It's kind a magic
    let divident = (offsetX + (2 * offsetY)) / 2;
    const isoX = Math.floor(divident / brickSize);

    divident = ((offsetY * 2) - offsetX) / 2;
    const isoY = Math.floor(divident / brickSize);

    return { x: isoX, y: isoY };
  }

  /* Desc: Перерисовка фишек по порядку
           их расположения на доске(решение
           проблемы проекции)
     Input(undefined)
     Output(undefined) */
  function renderChipsByOrder() {
    // Очищаем доску
    createGrid();

    let isoCoordX = 0;
    let isoCoordY = 0;
    for (let i = 0; i < tileNumberDiagonal; i += 1) {
      isoCoordY = i * brickSize;

      for (let j = 0; j < tileNumberEdge; j += 1) {
        isoCoordX = j * brickSize;

        const isometricCoords = { x: isoCoordX, y: isoCoordY };

        // гарантируем порядок расположения фишек
        if (containsObject(chips, isometricCoords)) {
          placeTile(isoCoordX, isoCoordY, 0, cube);
        }
      }
    }
  }

  /* Desc: Добавить фишку на доску по клику
     Input(x, y): экранные координаты
     Output(undefined) */
  function addChip(x, y) {
    // преобразуем экранные координаты в к-ты сетки
    const matrixCoords = transformScreenToView(x, y);

    // aliases
    const row = matrixCoords.y;
    const col = matrixCoords.x;

    // клик над
    const isUpper = row < 0 || col < 0;
    // клик под
    const isUnder = row > tileNumberDiagonal - 1
                    || col > tileNumberEdge - 1;

    if (isUpper || isUnder) {
      return;
    }

    // console.log(`row = ${row}`);
    // console.log(`col = ${col}`);

    // aliases
    const gridX = gridCells[row][col].x;
    const gridY = gridCells[row][col].y;

    // если тек.к-ты нет в массиве фишек =>
    // добавить фишку и перерисовать все фишки сохраняя порядок
    const isometricCoords = { x: gridX, y: gridY };
    if (containsObject(chips, isometricCoords) === false) {
      chips.push(isometricCoords);
      renderChipsByOrder();
    }
  }

  /* Desc: Случайная кон-я фишек
     Input(undefined)
     Output(undefined) */
  function placeRandomCells() {
    // Очищаем сетку
    createGrid();

    // Кол-во клеток в случайной конфигурации
    // cellsCounter -- всего клеток
    const cellsCounter = +cellsCounterOutput.value;
    const randomCellsNumber = cellsCounter * 0.5;

    // Named Function Expression
    const getRandom = function getRandom(upperBound) {
      return parseInt(Math.random() * upperBound, 10);
    };

    const randomCellsArray = [];
    for (let i = 0; i < randomCellsNumber; i += 1) {
      const row = getRandom(tileNumberDiagonal);
      const col = getRandom(tileNumberEdge);

      // Случайная координата
      const randomCoord = {
        x: row,
        y: col,
      };

      // const randomCell = new Cell(coordX, coordY);

      // Если массив пуст или не содержит
      // клетки с такими координатами
      if (randomCellsArray.length === 0 ||
          !(containsObject(randomCellsArray, randomCoord))) {
        randomCellsArray.push(randomCoord);

        // преобразуем в изометрические к-ты
        const isoX = gridCells[row][col].x;
        const isoY = gridCells[row][col].y;
        placeTile(isoX, isoY, 0, cube);
      }
    }

    // gridAliveCells = randomCellsArray;
  //   renderCells = randomCellsArray;
  //   refresh();
  }

  /* Desc: Зарегистрировать обработчики событий элементов
           управления
     Input(undefined)
     Output(undefined) */
  function addListeners() {
  //   stepBtn.addEventListener('click', makeStep);
    clearBtn.addEventListener('click', () => {
      // Для наблюдателя
      const arrLen = chips.length;
      for (let i = 0; i < arrLen; i += 1) {
        chips.shift();
      }

      createGrid();
    });
  //
  //   runBtn.addEventListener('click', (/* evt */) => {
  //     isPause = false;
  //     run();
  //   });
  //
  //   pauseBtn.addEventListener('click', (/* evt */) => {
  //     isPause = !isPause;
  //     if (!isPause) {
  //       run();
  //     }
  //   });
  //
    // Положить фишку по клику
    cnv.addEventListener('click', (evt) => {
      addChip(evt.clientX, evt.clientY);
    });
  //   speedInput.addEventListener('input', () => {
  //     convertSpeedInTime(+speedInput.value);
  //   });
  //
    brickSizeRange.addEventListener('input', (/* evt */) => {
      brickSize = +brickSizeRange.value;

      // TODO
      createGrid();
    });

    randomBtn.addEventListener('click', placeRandomCells);
  }

  // Main stream
  addListeners();
  // Сетка на холсте
  createGrid();
}());
