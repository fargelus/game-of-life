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

// const gridCellsArr = [];

// grid
for (let i = 0; i < tileNumberDiagonal; i += 1) {
  for (let j = 0; j < tileNumberEdge; j += 1) {
    placeTile(iterX, iterY, brick);
    // gridCellsArr.push({ x: iterX, y: iterY });
    iterX += brickSize;
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

cnv.addEventListener('click', (evt) => {
  // const rect = cnv.getBoundingClientRect();

  let x = evt.clientX;
  let y = evt.clientY;
  const viewPoint = new obelisk.Point3D();

  x -= isometricOriginX;
  y -= isometricOriginY;

  let divident = (x + (2 * y)) / 2;
  const isoX = Math.floor(divident / brickSize);

  divident = ((y * 2) - x) / 2;
  const isoY = Math.floor(divident / brickSize);
  // const factorX = parseInt(evtX / brickSize, 10);
  // const factorY = parseInt(evtY / brickSize, 10);
  //
  // const cartX = factorX * brickSize;
  // const cartY = factorY * brickSize;
  //
  // const isoX = cartX + (brickSize / 2);
  // const isoY
  //
  //
  console.log(`x = ${isoX}`);
  console.log(`y = ${isoY}`);
});

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
