// const Universe = require('./universe');
const View = require('./view');
const Life = require('./life');
const Helpers = require('./helpers');

module.exports = (() => {
  const canvas = document.getElementsByTagName('canvas')[0];
  const storageDB = window.localStorage;

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
  const life = new Life([], +jsRange.value);

  function updateAliveCellsInStats() {
    const alive = life.aliveCells;
    // Обновим инф-ю о живых клетках в статистике
    aliveCellsCounter.value = alive.length;
  }

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
    updateAliveCellsInStats();
  }

  function onRandomBtnClick() {
    life.makeRandomConfig(view.dimensionX, view.dimensionY);
    view.renderChips(life.aliveCells);

    updateAliveCellsInStats();
  }

  function clearState() {
    const cellSize = +jsRange.value;

    life.clear();
    life.cellSize = cellSize;

    view.setBoardScale(cellSize);
    view.createBoard();

    updateAliveCellsInStats();
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
        storageDB.setItem('life', JSON.stringify(currentAlive));
      }
    } else {
      // не сохраняем пустую конфигурацию
      storageDB.clear();
    }
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

      step();
      run.intervalId = setInterval(requestDelay, timeDelay);
    }, timeDelay);
  }

  function pause() {
    clearInterval(run.intervalId);
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
      storageDB.clear();
      clearState();
    });

    runBtn.addEventListener('click', run);
    pauseBtn.addEventListener('click', pause);
    stepBtn.addEventListener('click', step);
  }

  function restorePreviousState() {
    const initConfig = storageDB.getItem('life');
    if (initConfig) {
      const lostConf = JSON.parse(initConfig);
      const len = lostConf.length;
      const cellSize = lostConf[0].size;
      for (let i = 0; i < len; i += 1) {
        life.addCell(
          lostConf[i].cellX,
          lostConf[i].cellY,
          cellSize,
        );
      }

      view.renderChips(life.aliveCells);
    }
  }

  function main() {
    clearState();
    bindEvents();
    restorePreviousState();
  }

  main();
})();
