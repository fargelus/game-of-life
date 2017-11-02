// const Universe = require('./universe');
const View = require('./view');
const Life = require('./life');
const Helpers = require('./helpers');

module.exports = (() => {
  const canvas = document.getElementsByTagName('canvas')[0];
  const configSelect = document.getElementById('config-select');

  const nameToCoordsConfigMap = {};

  // ******************* Inputs ********************
  const jsRange = document.getElementById('js-range');
  const speedInput = document.getElementById('speed-input');
  // ******************* End Of Inputs *************

  // ***************** Stats *********************
  const allCells = document.getElementById('js-output-cells-count');
  const aliveCellsCounter =
              document.getElementById('js-output-alive-cells-count');
  const genOutput = document.getElementById('js-output-gen');
  // ***************** End Of Stats **************

  // **************** Buttons ********************
  const randomBtn = document.getElementById('random-btn');
  const clearBtn = document.getElementById('clear-button');
  const pauseBtn = document.getElementById('pause-button');
  const stepBtn = document.getElementById('step-button');
  const runBtn = document.getElementById('run-button');
  // **************** End Of Buttons ********************

  const view = new View(canvas);
  const life = new Life(+jsRange.value);

  function onCanvasClick(evt) {
    const screenX = evt.pageX;
    const screenY = evt.pageY;

    try {
      const { x, y } = view.transformScreenToView(screenX, screenY);
      life.addCell(x, y);
    } catch (err) {
      console.log(err.message);
    }

    view.renderChips(life.aliveCells);
    aliveCellsCounter.value = (+aliveCellsCounter.value) + 1;

    // Если перед добавлением клетки доска была пуста
    // на всякий случай зануляем поколение
    if (life.aliveCells.length - 1 === 0) {
      genOutput.value = 0;
    }
  }

  function onRandomBtnClick() {
    life.makeRandomConfig(view.dimensionX, view.dimensionY);
    view.renderChips(life.aliveCells);

    aliveCellsCounter.value = life.aliveCells.length;
    genOutput.value = 0;
  }

  function clearState() {
    const cellSize = +jsRange.value;

    life.clear();
    life.cellSize = cellSize;

    view.setBoardScale(cellSize);
    view.createBoard();

    aliveCellsCounter.value = 0;
    genOutput.value = 0;
    allCells.value = view.dimensionX * view.dimensionY;
  }

  function step() {
    const prevAlive = life.aliveCells;
    const prevAliveLen = prevAlive.length;

    // Условия останова
    if (prevAliveLen > 0) {
      life.nextGeneration();
      const currentAlive = life.aliveCells;

      const arrayDistraction = Helpers.getArrayDistract;
      const difference = arrayDistraction(prevAlive, currentAlive);

      // Если есть разница => отобразить изменения
      if (difference.length) {
        view.renderChips(currentAlive);
        genOutput.value = +genOutput.value + 1;
        aliveCellsCounter.value = currentAlive.length;
        return true;
      }
    }

    return false;
  }

  function convertSpeedInTime(speed) {
    const initialDelay = 500;
    const ratio = 2;

    let resDelay = initialDelay;
    let counter = 1;

    while (counter !== speed) {
      resDelay /= ratio;
      counter += 1;
    }

    return resDelay;
  }

  function run() {
    if (run.intervalId !== undefined) clearInterval(run.intervalId);

    let timeDelay = convertSpeedInTime(+speedInput.value);

    // Возможность менять интервал вызова функции во
    // время выполнения
    run.intervalId = setInterval(function requestDelay() {
      const currentDelay = convertSpeedInTime(+speedInput.value);
      clearInterval(run.intervalId);

      if (currentDelay !== timeDelay) {
        timeDelay = currentDelay;
      }

      const isContinue = step();
      if (isContinue) {
        run.intervalId = setInterval(requestDelay, timeDelay);
      }
    }, timeDelay);
  }

  function pause() {
    clearInterval(run.intervalId);
  }


  /* Desc: Считывает конфигурационные файлы в массив
     Input(undefined)
     Output(Array[obj]): Объекты всех конф-ий */
  function readConfigData() {
    const configDOM = document.getElementById('config');

    // данные совместно с именем файла
    const rawConfigData = JSON.parse(configDOM.innerText);

    // только данные без имени файла
    const configData = Object.values(rawConfigData);

    const configsObj = [];
    configData.forEach((currentData) => {
      const configObject = JSON.parse(currentData);
      configsObj.push(configObject);
    });

    return configsObj;
  }

  /* Desc: Отображение конфиг.файлов в DOM(select)
     Input(undefined)
     Output(undefined) */
  function renderConfigsInDOM() {
    const configData = readConfigData();

    // Заполнить optgroup
    const categories = configData.map(elem => elem.category);
    const uniqueCategories = new Set(categories);
    uniqueCategories.forEach((elem) => {
      const optGroupHTML = `<optgroup label=${elem}></optgroup>`;
      configSelect.insertAdjacentHTML('beforeend', optGroupHTML);
    });

    // Получить DOMNode на optgroup
    const optGroupDOM = configSelect.getElementsByTagName('optgroup');
    // Преобразовать в js Array
    const optGroupDOMList = Array.prototype.slice.call(optGroupDOM);

    // Заполнить option
    const len = configData.length;
    for (let i = 0; i < len; i += 1) {
      const { name, category } = configData[i];
      optGroupDOMList.forEach((domNode) => {
        if (domNode.label === category) {
          const optionDOM = document.createElement('option');
          optionDOM.value = '';
          optionDOM.innerText = name;
          domNode.append(optionDOM);
        }
      });
    }
  }

  function getCenterCoord(width, height) {
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    return [].concat(centerX, centerY);
  }

  /* Desc: Преобразование кодировки, описывающая форму
           фигуры в координаты.
     Input(shapeEncoding -> String): Закодированная форма фигуры.
     Output(coords -> Array): Массив координат со
                              смещением отн-но центра. */
  function createConfigCoords(shapeEncoding) {
    const lines = shapeEncoding.split(' ');
    const sizeY = lines.length;

    const lenMap = lines.map(elem => elem.length);
    const sizeX = Math.max(...lenMap);

    const center = getCenterCoord(sizeX, sizeY);
    const objectSize = +jsRange.value;

    const coordObj = [];
    for (let i = 0; i < sizeY; i += 1) {
      const columnsCount = lines[i].length;
      const offsetY = center[1] - i;

      for (let j = 0; j < columnsCount; j += 1) {
        const type = lines[i][j];
        if (type !== '.') {
          const offsetX = center[0] - j;
          coordObj.push([objectSize * offsetX, objectSize * offsetY]);
        }
      }
    }

    // TODO вычислить один раз и сохранить
    const viewBoardCenter = getCenterCoord(
      view.dimensionX,
      view.dimensionY,
    );
    viewBoardCenter[0] *= objectSize;
    viewBoardCenter[1] *= objectSize;

    const coordObjLen = coordObj.length;
    const mapCoordObjToViewBoard = [];

    for (let i = 0; i < coordObjLen; i += 1) {
      const coordX = coordObj[i][0] + viewBoardCenter[0];
      const coordY = coordObj[i][1] + viewBoardCenter[1];
      mapCoordObjToViewBoard.push([coordX, coordY]);
    }

    return mapCoordObjToViewBoard;
  }

  /* Desc: Заполнение хэш таблицы(имя конф-ии: к-ты)
           для последующей выборки из select
     Input(undefined)
     Output(undefined)
     SideEffects: изменение configMap */
  function fillConfigMap() {
    const configData = readConfigData();
    const encodeFigureForm = {};
    configData.forEach((elem) => {
      encodeFigureForm[elem.name] = elem.configuration;
    });

    Object.keys(encodeFigureForm).forEach((figureName) => {
      nameToCoordsConfigMap[figureName] =
       createConfigCoords(encodeFigureForm[figureName]);
    });
  }

  function bindEvents() {
    jsRange.addEventListener('input', () => {
      // input type=range
      const jsOutput = document.getElementById('js-output');
      jsOutput.innerHTML = jsRange.value;

      clearState();
    });

    canvas.addEventListener('click', onCanvasClick);

    randomBtn.addEventListener('click', onRandomBtnClick);
    clearBtn.addEventListener('click', () => {
      pause();
      clearState();
    });

    runBtn.addEventListener('click', run);
    pauseBtn.addEventListener('click', pause);
    stepBtn.addEventListener('click', step);

    configSelect.addEventListener('change', (evt) => {
      const select = evt.currentTarget;
      const name = select.options[select.selectedIndex].text;

      life.clear();
      life.cellSize = +jsRange.value;
      fillConfigMap();

      const conf = nameToCoordsConfigMap[name];
      for (let i = 0; i < conf.length; i += 1) {
        const x = conf[i][0];
        const y = conf[i][1];
        life.addCell(x, y);
      }

      view.renderChips(life.aliveCells);
    });
  }

  function main() {
    renderConfigsInDOM();

    clearState();
    fillConfigMap();

    bindEvents();

    // onRandomBtnClick();
  }

  main();
})();
