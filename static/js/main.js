// require('./universe');

// const helpers = require('./helpers');
const obelisk = require('obelisk.js');

// холст
const cnv = document.getElementsByTagName('canvas')[0];

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
const dimension = new obelisk.BrickDimension(
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
const color = new obelisk.SideColor().getByInnerColor(gray);

// кирпич -- клетка в изометрии
const brick = new obelisk.Brick(dimension, color);

const placeTile = (x, y, tile) => {
  // TODO?
  const realZ = 0;
  const p3d = new obelisk.Point3D(x, y, realZ);
  pixelView.renderObject(tile, p3d);
};

let iterY = 0;
let iterX = 0;

// Заполнить массив значениями по умолчанию
const fillArrayWithValue = (value, len) => {
  // Одалживаем метод => arr = [undefined, * len]
  let arr = Array(...Array(len));
  arr = arr.map(() => value);
  return arr;
};

const cellCols = fillArrayWithValue(0, tileNumberEdge);

let gridCellsArr = fillArrayWithValue(0, tileNumberDiagonal);
// копируем по значению
gridCellsArr = gridCellsArr.map(() => cellCols.slice());

// grid
for (let i = 0; i < tileNumberDiagonal; i += 1) {
  for (let j = 0; j < tileNumberEdge; j += 1) {
    placeTile(iterX, iterY, brick);
    // gridCellsArr.push({ x: iterX, y: iterY });
    iterX += brickSize;

    const coord = { x: iterX, y: iterY };
    gridCellsArr[i][j] = coord;
  }

  iterX = 0;
  iterY += brickSize;
}


// cube
const cubeDimension = new obelisk.CubeDimension(
  brickSize, brickSize,
  brickSize / 2,
);

// cube color
const cubeColorInstance = new obelisk.CubeColor();
const cubeColor = cubeColorInstance.getByHorizontalColor(0xFF0000);

const cube = new obelisk.Cube(cubeDimension, cubeColor);
placeTile(0, 0, cube);

/* Экранные координаты -> координаты сетки
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

cnv.addEventListener('click', (evt) => {
  // преобразуем экранные координаты в к-ты сетки
  const matrixCoords = transformScreenToView(
    evt.clientX,
    evt.clientY,
  );

  // aliases
  const row = matrixCoords.y;
  const col = matrixCoords.x - 1;

  // клик над сеткой
  const isUpper = row < 0 || col < 0;
  // клик под сеткой
  const isUnder = row > tileNumberDiagonal || col > tileNumberEdge;

  if (isUpper || isUnder) {
    return;
  }

  console.log(`row = ${row}`);
  console.log(`col = ${col}`);
  console.log(gridCellsArr[0][0].x);

  // aliases
  const gridX = gridCellsArr[row][col].x;
  const gridY = gridCellsArr[row][col].y;

  console.log(`gridX = ${gridX}`);
  console.log(`gridY = ${gridY}`);

  // разместим куб по клику
  placeTile(gridX, gridY, cube);
});

// cnv.addEventListener('mousemove', (evt) => {
//   console.log('mousemove');
// });


// window.addEventListener('load', () => {
//   const configJSON = document.getElementById('config').innerText;
//   const configObj = JSON.parse(configJSON);
//
//   const standardConfigList =
//                      document.getElementById('standard-config-list');
//
//   const configObjKeys = Object.keys(configObj);
//   const configObjKeysLen = configObjKeys.length;
//
//   for (let i = 0; i < configObjKeysLen; i += 1) {
//     const option = document.createElement('option');
//     option.innerHTML = configObjKeys[i];
//     standardConfigList.appendChild(option);
//   }
// });
//

// const jsRange = document.getElementById('js-range');
// jsRange.addEventListener('input', () => {
//   const jsOutput = document.getElementById('js-output');
//   jsOutput.innerHTML = jsRange.value;
// });
