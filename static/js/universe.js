// universe.js -- Вселенная состоящая из клеток

// const Cell = require('./cell');
const Helpers = require('./helpers');
const obelisk = require('obelisk.js');


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

  // размер кирпича(делаем ромб)
  // x -- ширина, y -- высота(в плоскости xy),
  // z -- высота в пр-ве(xyz)
  const brickSize = 40;
  const brickDimension = new obelisk.BrickDimension(
    brickSize,
    brickSize,
  );

  // Кол-во тайлов на гранях ромба
  const tileNumberEdge = parseInt(cnvCenterX / brickSize, 10);
  // Кол-во тайлов на диагонали ромба
  const tileNumberDiagonal = parseInt(cnvCenterY / brickSize, 10);

  // цвет
  // color alias
  const gray = obelisk.ColorPattern.GRAY;
  const brickColor = new obelisk.SideColor().getByInnerColor(gray);

  // кирпич -- клетка в изометрии
  const brick = new obelisk.Brick(brickDimension, brickColor);

  // cube
  const cubeDimension = new obelisk.CubeDimension(
    brickSize, brickSize,
    brickSize / 2,
  );

  // cube color
  const cubeColorInstance = new obelisk.CubeColor();
  const cubeColor = cubeColorInstance.getByHorizontalColor(0xFF0000);

  const cube = new obelisk.Cube(cubeDimension, cubeColor);

  // коорд-ты всех клеток на сетке
  // ************** Helpers *****************
  const { containsObject } = Helpers;
  const { fillArrayWithValue } = Helpers;
  // ************** End of helpers **********

  const cellCols = fillArrayWithValue(0, tileNumberEdge);
  let gridCells = fillArrayWithValue(0, tileNumberDiagonal);

  // значение по умол-ю
  const initGridCells = gridCells.map(() => cellCols.slice());
  // копируем по значению
  gridCells = initGridCells.slice();

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
  cellsCounterOutput.value = tileNumberEdge * tileNumberDiagonal;
  // const aliveCellsCounter =
  //           document.getElementById('js-output-alive-cells-count');
  //
  // const cellSizeInput = document.getElementById('js-range');


  // ******* Клетки *********
  // корд-ты клеток в бесконечной вселенной
  // let aliveCells = [];

  // коорд-ты клетки
  // на двумерной конечной плоскости
  // let renderCells = [];

  // **********************

  // let isPause = false;

  // ********** module functions *************
  function placeTile(x, y, tile) {
    // TODO?
    const realZ = 0;
    const p3d = new obelisk.Point3D(x, y, realZ);
    pixelView.renderObject(tile, p3d);
  }

  function createGrid() {
    pixelView.clear();

    let iterY = 0;
    let iterX = 0;

    // grid
    for (let i = 0; i < tileNumberDiagonal; i += 1) {
      for (let j = 0; j < tileNumberEdge; j += 1) {
        const coord = { x: iterX, y: iterY };
        gridCells[i][j] = coord;

        placeTile(iterX, iterY, brick);
        iterX += brickSize;
      }

      iterX = 0;
      iterY += brickSize;
    }
  }

  /* Desc: Экранные координаты -> координаты сетки
     Input(x, y): экранные координаты
     Output(Object): матричные коорд-ты сетки
  */
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

  // Desc: Положить фишку по клику
  // Input(x, y): экранные координаты
  // Output(undefined)
  function putChip(x, y) {
    // преобразуем экранные координаты в к-ты сетки
    const matrixCoords = transformScreenToView(x, y);

    // Сохраняем к-ты живой клетки
    // aliveCells.push(matrixCoords);

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

    // console.log(`gridX = ${gridX}`);
    // console.log(`gridY = ${gridY}`);

    // разместим куб по клику
    placeTile(gridX, gridY, cube);
  }

  // function refresh() {
  //   createGrid();
  //
  //   // рендерим все живые клетки
  //   const renderCellsLen = renderCells.length;
  //   for (let i = 0; i < renderCellsLen; i += 1) {
  //     paintCell(renderCells[i].x, renderCells[i].y);
  //     paintCell(renderCells[i].x, renderCells[i].y);
  //   }
  // }
  //
  function clearGrid(/* evt */) {
    // сброс всех клеток => перерисовка view
    gridCells = initGridCells.slice();
    // renderCells = [];
    // genOutput.value = 0;

    // FIX ME
    // aliveCellsCounter.value = 0;
    createGrid();
  }

  // Преобразование скорости(выбор пол-ля)
  // во время задержки вызова фун-и makeStep
  // function convertSpeedInTime(speed) {
  //   const initialDelay = 500;
  //   const ratio = 2;
  //
  //   let resDelay = initialDelay;
  //   let counter = 1;
  //
  //   while (counter !== speed) {
  //     resDelay /= ratio;
  //     counter += 1;
  //   }
  //
  //   time = resDelay;
  // }

  // Вышла ли коорд-та за пределы?
  // 1 -- смещение положительное
  // -1 -- смещение отрицательное
  // 0 -- смещения нет
  // function isCoordOverBound(coord, bound) {
  //   if (coord < 0) {
  //     return -1;
  //   } else if (coord > bound) {
  //     return 1;
  //   }
  //   return 0;
  // }

  // расчет координаты смещения при выходе
  // за пределы вселенной
  // function calculateOffsetCoord(coord, bound) {
  //   // положительное смещение
  //   if (coord >= bound) {
  //     return coord % bound;
  //   }
  //
  //   // отрицательное смещение
  //   return bound - Math.abs(coord % bound);
  // }

  // Описание: Вышла ли клетка за границы вселенной
  // Вход: Коорд-ты рожденной клетки
  // Выход: Новые коорд-ты клетки
  // function updateBeyondBoundsCoords(coordX, coordY) {
  //   // Кэшируем на всякий случай
  //   const gridWidth = cnv.width;
  //   const gridHeight = cnv.height;
  //
  //   // граница -- это ширина/высота минус размер клетки
  //   const boundX = gridWidth - cellSize;
  //   const boundY = gridHeight - cellSize;
  //
  //   // Вышла ли координата за границы вселенной
  //   const resX = isCoordOverBound(coordX, boundX);
  //   const resY = isCoordOverBound(coordY, boundY);
  //
  //   let toroidCoordX = coordX;
  //   // Если смещение по Х -> перерасчет координаты Х
  //   if (resX !== 0) {
  //     toroidCoordX = calculateOffsetCoord(coordX, gridWidth);
  //   }
  //
  //   let toroidCoordY = coordY;
  //   // Если смещение по Y -> перерасчет координат Y
  //   if (resY !== 0) {
  //     toroidCoordY = calculateOffsetCoord(coordY, gridHeight);
  //   }
  //
  //   return [].concat(toroidCoordX, toroidCoordY);
  // }

  // Обновляем отображаемые клетки
  // function updateRenderCells() {
  //   renderCells = [];
  //   const aliveCellNumber = gridAliveCells.length;
  //   for (let i = 0; i < aliveCellNumber; i += 1) {
  //     const aliveCellX = gridAliveCells[i].x;
  //     const aliveCellY = gridAliveCells[i].y;
  //
  //     const [renderCoordX, renderCoordY] =
  //                         updateBeyondBoundsCoords(
  //                           aliveCellX,
  //                           aliveCellY,
  //                         );
  //
  //     const renderCell = new Cell(renderCoordX, renderCoordY);
  //     renderCells.push(renderCell);
  //   }
  // }

  // На очередном шаге клетка узнает о живых соседях
  // function updateLivingCellNeighbours() {
  //   // обновим инф-ю в клетках и их соседях
  //   // о живых клетках
  //   const aliveCellsNumber = gridAliveCells.length;
  //   for (let i = 0; i < aliveCellsNumber; i += 1) {
  //     const aliveCell = gridAliveCells[i];
  //
  //     // при обновлении клетка меняет своё состояние
  //     aliveCell.updateNeighbours(gridAliveCells);
  //   }
  // }

  // function makeStep() {
  //   const nextGen = [];
  //
  //   // Клетка узнает о своих соседях => изменяет
  //   // своё состояние
  //   updateLivingCellNeighbours();
  //
  //   const len = gridAliveCells.length;
  //   for (let i = 0; i < len; i += 1) {
  //     const aliveCell = gridAliveCells[i];
  //     const neighbours = aliveCell.emptyNeighbours;
  //     const neighboursLen = neighbours.length;
  //
  //     for (let j = 0; j < neighboursLen; j += 1) {
  //       if (neighbours[j].isAlive &&
  //         !containsObject(nextGen, neighbours[j])) {
  //         const cell = new Cell(neighbours[j].x, neighbours[j].y);
  //         nextGen.push(cell);
  //       }
  //     }
  //
  //     if (aliveCell.isAlive) {
  //       const cell = new Cell(aliveCell.x, aliveCell.y);
  //       nextGen.push(cell);
  //     }
  //   }
  //
  //   gridAliveCells = nextGen;
  //
  //   updateRenderCells();
  //
  //   refresh();
  //
  //   // Обновляем статистику
  //   // Подсчет поколений
  //   let genCounter = +genOutput.value;
  //   genCounter += 1;
  //   genOutput.value = genCounter;
  // }

  // Условия остановки: конфигурация является
  // стабильной(конфигурация на предыдущем шаге === текущей)
  // Прим.: Блок
  // function isConfigStable(prevGen) {
  //   let retVal = false;
  //   const prevGenLen = prevGen.length;
  //   let counter = 0;
  //   for (; counter < prevGenLen; counter += 1) {
  //     // Если хотя бы одна клетка отлична => прерываем цикл
  //     if (!containsObject(gridAliveCells, prevGen[counter])) {
  //       break;
  //     }
  //   }
  //
  //   if (counter === prevGenLen) {
  //     retVal = true;
  //   }
  //
  //   return retVal;
  // }

  // function run() {
  //   if (isPause) {
  //     return;
  //   }
  //
  //   const prevGen = gridAliveCells.slice();
  //
  //   makeStep();
  //
  //   // Условия останова
  //   if (isConfigStable(prevGen) || gridAliveCells.length === 0) {
  //     return;
  //   }
  //
  //   setTimeout(run, time);
  // }

  function placeRandomCells() {
    // Очищаем сетку
    clearGrid();
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
        placeTile(isoX, isoY, cube);
      }
    }

    // gridAliveCells = randomCellsArray;
  //   renderCells = randomCellsArray;
  //   refresh();
  }

  // function calculateCellsCount() {
  //   // Кол-во рядов/колонок на сетке
  //   // Берем нижнюю границу(26.6 рядов !== 27)
  //   const rowsNumber = Math.floor(cnv.height / cellSize);
  //   const colsNumber = Math.floor(cnv.width / cellSize);
  //
  //   // Общее число клеток
  //   cellsCounterOutput.value = rowsNumber * colsNumber;
  // }

  // DOM Event Listeners
  function addListeners() {
  //   stepBtn.addEventListener('click', makeStep);
    clearBtn.addEventListener('click', clearGrid);
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
      putChip(evt.clientX, evt.clientY);
    });
  //   speedInput.addEventListener('input', () => {
  //     convertSpeedInTime(+speedInput.value);
  //   });
  //
  //   cellSizeInput.addEventListener('input', (/* evt */) => {
  //     cellSize = +cellSizeInput.value;
  //     calculateCellsCount();
  //     refresh();
  //   });

    randomBtn.addEventListener('click', placeRandomCells);
  }

  // Main stream
  addListeners();
  // Сетка на холсте
  createGrid();

  // Обновить инф-ю о кол-ве клеток
  // calculateCellsCount();
}());
