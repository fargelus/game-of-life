// require('./universe');

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
const brickSize = 20;
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

const placeBrick = (x, y) => {
  // TODO?
  const realZ = 0;
  const p3d = new obelisk.Point3D(x, y, realZ);
  pixelView.renderObject(brick, p3d);
};

let iterY = 0;
let iterX = 0;

for (let i = 0; i < tileNumberDiagonal; i += 1) {
  for (let j = 0; j < tileNumberEdge; j += 1) {
    placeBrick(iterX, iterY);
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

const cubeColorInstance = new obelisk.CubeColor();
const cubeColor = cubeColorInstance.getByHorizontalColor(0xFF0000);

const cube = new obelisk.Cube(cubeDimension, cubeColor);
const cubeCoord = new obelisk.Point3D(0, 0, -100);
pixelView.renderObject(cube, cubeCoord);

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
