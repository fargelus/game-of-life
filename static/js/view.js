const obelisk = require('obelisk.js');
const Helpers = require('./helpers');

// private methods
const initCoordinateSystem = Symbol('initCoordinateSystem');
const initBrick = Symbol('initBrick');
const initChip = Symbol('initChip');
const initBoardCells = Symbol('initBoardCells');

class View {
  constructor(canvas) {
    this.cnv = canvas;
    this[initCoordinateSystem]();
    this.chips = [];
  }

  [initCoordinateSystem]() {
    // Начало координат изометрической сетки(200, 100)
    this.isometricOriginX = this.cnv.width / 2;
    this.isometricOriginY = 100;
    const point = new obelisk.Point(
      this.isometricOriginX,
      this.isometricOriginY,
    );

    // контейнер( сцена )
    this.pixelView = new obelisk.PixelView(this.cnv, point);
  }

  [initBoardCells]() {
    const cellCols = Helpers.fillArrayWithValue(
      0,
      this.tileNumberEdge,
    );

    this.boardCells = Helpers.fillArrayWithValue(
      0,
      this.tileNumberDiagonal,
    );

    this.boardCells = this.boardCells.map(() => cellCols.slice());
  }

  setBoardScale(scale) {
    this.brickSize = scale;
    this[initBrick]();
    this[initChip]();
    this[initBoardCells]();
  }

  [initBrick]() {
    // для расчета кол-ва тайлов
    const cnvCenterX = this.cnv.width / 2;
    const cnvCenterY = this.cnv.height / 2;

    // Кол-во тайлов на грани ромба
    this.tileNumberEdge = parseInt(cnvCenterX /
                                   this.brickSize, 10);

    // Кол-во тайлов на диагонали ромба
    this.tileNumberDiagonal = parseInt(cnvCenterY /
                                       this.brickSize, 10);

    // цвет
    // color alias
    const gray = obelisk.ColorPattern.GRAY;
    const brickColor = new obelisk.SideColor().getByInnerColor(gray);

    // размер кирпича(делаем ромб)
    // x -- ширина, y -- высота(в плоскости xy),
    // z -- высота в пр-ве(xyz)
    const brickDimension = new obelisk.BrickDimension(
      this.brickSize,
      this.brickSize,
    );

    this.brick = new obelisk.Brick(brickDimension, brickColor);
  }

  [initChip]() {
    // cube
    const cubeDimension = new obelisk.CubeDimension(
      this.brickSize, this.brickSize,
      this.brickSize / 2,
    );

    // cube color
    const cubeColorInstance = new obelisk.CubeColor();
    const cubeColor = cubeColorInstance.getByHorizontalColor(0xFF0000);

    this.cube = new obelisk.Cube(cubeDimension, cubeColor);
  }

  /* Desc: Расположить тайл на доске
     Input(x -> Number, y -> Number, tile -> obelisk):
        x -- изометрическая к-та по оси абсцисс,
        y -- изометрическая к-та по оси ординат,
        tile -- инстанс отображаемого тайла
     Output(undefined) */
  placeTile(x, y, z, tile) {
    const p3d = new obelisk.Point3D(x, y, z);
    this.pixelView.renderObject(tile, p3d);
  }

  /* Desc: Создание изометрической доски для размещения фишек
     Input(undefined)
     Output(undefined) */
  createBoard() {
    this.pixelView.clear();

    let iterY = 0;
    let iterX = 0;

    // grid
    for (let i = 0; i < this.tileNumberDiagonal; i += 1) {
      for (let j = 0; j < this.tileNumberEdge; j += 1) {
        const coord = { x: iterX, y: iterY };
        this.boardCells[i][j] = coord;

        this.placeTile(iterX, iterY, 0, this.brick);
        iterX += this.brickSize;
      }

      iterX = 0;
      iterY += this.brickSize;
    }
  }

  /* Desc: Экранные координаты -> координаты сетки
     Input(x, y): экранные координаты
     Output(Object): матричные коорд-ты сетки
     Except */
  transformScreenToView(x, y) {
    /* смещение отн-но начала координат
       изометрической плоскости */
    const offsetX = x - this.isometricOriginX;
    const offsetY = y - this.isometricOriginY;

    // It's kind a magic
    let divident = (offsetX + (2 * offsetY)) / 2;
    const col = Math.floor(divident / this.brickSize);

    divident = ((offsetY * 2) - offsetX) / 2;
    const row = Math.floor(divident / this.brickSize);

    /* Если текущие матричн. к-ты отображаются на сетку
       вернуть их изометрический аналог
       В противном случае выброс исключения */
    if (this.isExceedLimits(row, col)) {
      throw new Error('One or more passed coords out of board!');
    }

    // aliases
    const isoX = this.boardCells[row][col].x;
    const isoY = this.boardCells[row][col].y;
    return { x: isoX, y: isoY };
  }

  isExceedLimits(row, col) {
    // клик над
    const isUpper = row < 0 || col < 0;
    // клик под
    const isUnder = row > this.tileNumberDiagonal - 1
    || col > this.tileNumberEdge - 1;

    return isUpper || isUnder;
  }

  static isCoordOverBound(coord, bound) {
    if (coord < 0 || coord > bound) return -1;

    return 0;
  }

  static calculateOffsetCoord(coord, bound) {
    // положительное смещение
    if (coord >= bound) {
      return coord % bound;
    }

    // отрицательное смещение
    return bound - Math.abs(coord % bound);
  }


  /* Desc: Расположить фишки по порядку
             на доске(решение проблемы проекции)
    Input(undefined)
    Output(undefined) */
  renderChips(chips) {
    this.createBoard();

    // this.makeToroid(chips);
    let isoCoordX = 0;
    let isoCoordY = 0;

    // Сохраним к-ты отрисованных клеток
    const renderedChips = [];
    for (let i = 0; i < this.tileNumberDiagonal; i += 1) {
      isoCoordY = i * this.brickSize;

      for (let j = 0; j < this.tileNumberEdge; j += 1) {
        isoCoordX = j * this.brickSize;

        const isometricCoords = { x: isoCoordX, y: isoCoordY };

        // гарантируем порядок расположения фишек
        if (Helpers.containsObject(chips, isometricCoords)) {
          this.placeTile(isoCoordX, isoCoordY, 0, this.cube);
          renderedChips.push(isometricCoords);
        }
      }
    }

    // Если некоторые клетки не отрисовали => они
    // вышли за пределы доски
    if (renderedChips.length !== chips.length) {
      const difference = Helpers.getArrayDistract;
      const offsetChips = difference(chips, renderedChips);
      const offsetLen = offsetChips.length;

      const width = this.tileNumberEdge * this.brickSize;
      const height = this.tileNumberDiagonal * this.brickSize;

      for (let i = 0; i < offsetLen; i += 1) {
        const chipX = offsetChips[i].x;
        const chipY = offsetChips[i].y;

        const isBeyondX = View.isCoordOverBound(chipX, width);
        const isBeyondY = View.isCoordOverBound(chipY, height);

        let toroidX = chipX;
        let toroidY = chipY;

        if (isBeyondX) {
          toroidX = View.calculateOffsetCoord(chipX, width);
        }

        if (isBeyondY) {
          toroidY = View.calculateOffsetCoord(chipY, height);
        }

        this.placeTile(toroidX, toroidY, 0, this.cube);
      }
    }
  }

  get dimensionX() {
    return this.tileNumberEdge;
  }

  get dimensionY() {
    return this.tileNumberDiagonal;
  }
}

module.exports = View;
