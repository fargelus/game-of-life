/* Модуль main.js
   Реализует паттерн медиатор.
   Является посредником между Life(модель) и View.
*/

const View = require('./view');
const Life = require('./life');
const Helpers = require('./helpers');

module.exports = (() => {
  const canvas = document.getElementsByTagName('canvas')[0];
  const configSelect = document.getElementById('js-config-select');

  // save config options
  const saveConfig = document.getElementById('js-save-config');
  saveConfig.style.display = 'none';

  // Отображение имени конфигурации(селект)
  // в его ко-ты на доске
  const nameToCoordsConfigMap = {};
  nameToCoordsConfigMap.updated = [];

  // ******************* Inputs ********************
  const jsRange = document.getElementById('js-range');
  const speedInput = document.getElementById('js-speed-input');
  const saveNameInput = document.getElementById('js-save-name-field');
  // ******************* End Of Inputs *************

  // ***************** Stats *********************
  const allCells = document.getElementById('js-output-cells-count');
  const aliveCellsCounter =
              document.getElementById('js-output-alive-cells-count');
  const genOutput = document.getElementById('js-output-gen');
  // ***************** End Of Stats **************

  // **************** Buttons ********************
  const randomBtn = document.getElementById('js-random-btn');
  const clearBtn = document.getElementById('js-clear-button');
  const pauseBtn = document.getElementById('js-pause-button');
  const stepBtn = document.getElementById('js-step-button');
  const runBtn = document.getElementById('js-run-button');
  const saveBtn = document.getElementById('js-save-btn');
  // **************** End Of Buttons ********************

  const view = new View(canvas);
  const life = new Life(+jsRange.value);

  /* Desc: Обработчик события клика на холсте.
     Input(evt -> DOMEvents): Объект события.
     Output(undefined) */
  function onCanvasClick(evt) {
    // к-ты отн-но документа
    const screenX = evt.pageX;
    const screenY = evt.pageY;

    // если клик за пределами доски, фишку не добавляем
    try {
      const { x, y } = view.transformScreenToView(screenX, screenY);
      life.addCell(x, y);
    } catch (err) {
      console.log(err.message);
    }

    // Отрисовка добавленной фишки
    view.renderChips(life.aliveCells);
    aliveCellsCounter.value = (+aliveCellsCounter.value) + 1;

    // Если перед добавлением клетки доска была пуста
    // на всякий случай зануляем поколение
    if (life.aliveCells.length - 1 === 0) {
      genOutput.value = 0;
    }
  }

  /* Desc: Разместить на доске случ. конф-ю.
     Input(undefined)
     Output(undefined) */
  function onRandomBtnClick() {
    // Заполним жизнь случайными клетками
    life.makeRandomConfig(view.dimensionX, view.dimensionY);
    view.renderChips(life.aliveCells);

    // Обновим статистику
    aliveCellsCounter.value = life.aliveCells.length;
    genOutput.value = 0;
  }

  /* Desc: Сброс всех фишек/клеток к нач.состоянию.
     Input(undefined)
     Output(undefined) */
  function clearState() {
    life.clear();
    view.createBoard();

    // Очистить статистику
    aliveCellsCounter.value = 0;
    genOutput.value = 0;

    configSelect.selectedIndex = 0;
  }

  /* Desc: Сделать один шаг в игре.
     Input(undefined)
     Output(undefined) */
  function step() {
    // Проверить предыдущее поколение
    const prevAlive = life.aliveCells;
    const prevAliveLen = prevAlive.length;

    // Условия останова
    if (prevAliveLen > 0) {
      life.nextGeneration();
      const currentAlive = life.aliveCells;

      // Сделать ли следующий шаг
      let makeStep = true;

      // Конфигурация является стабильной, если
      // на очередном шаге кол-во фишек и их к-ты остаются
      // неизменными.
      const arrayDistraction = Helpers.getArrayDistract;
      // Равны ли длины предыдущей конф-ии и текущей
      const isEqualLen = (prevAliveLen === currentAlive.length);
      // Если равны: проверяем координаты
      if (isEqualLen) {
        const difference = arrayDistraction(currentAlive, prevAlive);
        // Равны ли к-ты
        // Если длина > 0 => к-ты изменились, можем делать шаг
        makeStep = (difference.length > 0);
      }

      if (makeStep) {
        view.renderChips(currentAlive);
        // Обновим статистику
        genOutput.value = +genOutput.value + 1;
        aliveCellsCounter.value = currentAlive.length;
        return true;
      }
    }

    return false;
  }

  /* Desc: Преобразовать скорость(в настройках)
           в задержку вызова фун-ии step.
     Input(speed -> Number):
          Скорость расчета следующей конфигурации,
          может изменяться пользователем.
     Output(delay -> Number):
          Интервал вызова фун-ии расчета следующего
          поколения. */
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

  /* Desc: Запуск игры.
     Input(undefined)
     Output(undefined) */
  function run() {
    // Повторное нажатие на кнопку run,
    // защита от зацикливания.
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
      // Условия останова.
      if (isContinue) {
        run.intervalId = setInterval(requestDelay, timeDelay);
      }
    }, timeDelay);
  }

  /* Desc: Сделать паузу в игре.
     Input(undefined)
     Output(undefined) */
  function pause() {
    clearInterval(run.intervalId);
  }

  /* Desc: Считывает конфигурационные файлы в массив.
     Input(undefined)
     Output(Array[obj]): Объекты всех конф-ий */
  function readConfigData() {
    const configDOM = document.getElementById('js-config');

    // данные совместно с именем файла
    const rawConfigData = JSON.parse(configDOM.innerText);

    // только данные без имени файла
    const configData = Object.values(rawConfigData);

    // преобразование в допустимый формат
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

  /* Desc: Преобразование кодировки, описывающая форму
           фигуры в координаты, отн-но собственной центральной оси.
           Прим: 00 00 -> ((-40, -40), (-40, 0), (0, -40), (0, 0))
     Input(shapeEncoding -> String): Закодированная форма фигуры.
     Output(coords -> Array): Массив координат отн-но
                              собственной центральной оси */
  function transformEncodingToInnerCoord(shapeEncoding) {
    // Пробел в кодировке -> новый ряд
    const lines = shapeEncoding.split(' ');

    // Длина бокса
    const sizeY = lines.length;

    // Ширина бокса === максимальной ширине ряда
    const lenMap = lines.map(elem => elem.length);
    const sizeX = Math.max(...lenMap);

    // Рассчитать центральную ось фигуры
    const center = Helpers.getCenterCoord(sizeX, sizeY);

    const objectSize = +jsRange.value;

    const coordObj = [];
    // Сформировать к-ты отн-но центральной оси
    for (let i = 0; i < sizeY; i += 1) {
      const columnsCount = lines[i].length;
      const offsetY = center[1] - i;

      for (let j = 0; j < columnsCount; j += 1) {
        const type = lines[i][j];

        // . -- это пустой объект(как цифра 0 -> отсуствие зн-я)
        if (type !== '.') {
          const offsetX = center[0] - j;
          coordObj.push([objectSize * offsetX, objectSize * offsetY]);
        }
      }
    }

    return coordObj;
  }

  /* Desc: Преобразование кодировки,
           описывающая форму фигуры в координаты доски.
     Input(shapeEncoding -> String): Закодированная форма фигуры.
     Output(coords -> Array): Массив координат со
                              смещением отн-но центра доски. */
  function createConfigCoords(shapeEncoding) {
    const innerCoord = transformEncodingToInnerCoord(shapeEncoding);

    // К-ты центра доски
    const viewBoardCenter = view.center;

    const coordObjLen = innerCoord.length;
    // Отображение внутренних координат на доску
    const mapCoordObjToViewBoard = [];

    for (let i = 0; i < coordObjLen; i += 1) {
      const coordX = innerCoord[i][0] + viewBoardCenter[0];
      const coordY = innerCoord[i][1] + viewBoardCenter[1];
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

    // Хэш имя: конфигурация
    const encodeFigureForm = {};
    configData.forEach((elem) => {
      encodeFigureForm[elem.name] = elem.configuration;
    });

    // Хэш имя: к-ты на доске
    Object.keys(encodeFigureForm).forEach((figureName) => {
      nameToCoordsConfigMap[figureName] =
       createConfigCoords(encodeFigureForm[figureName]);
    });
  }

  /* Desc: Есть ли потомки с таким именем.
     Input(parent -> DOMNode, childName -> String)
     Output(result -> Boolean) */
  function hasTheSameChildName(parent, childName) {
    const childrens = parent.children;
    const numberOfChildrens = childrens.length;
    let result = false;

    if (numberOfChildrens !== 0) {
      for (let i = 0; i < numberOfChildrens; i += 1) {
        if (childrens[i].innerText === childName) {
          result = true;
          break;
        }
      }
    }

    return result;
  }

  /* Desc: Зашифровать коорд-ты живых фишек в вид:
           (00 00 -- прим. для Блока) и т.д.
     Input(undefined)
     Output(code -> String) */
  function encodeBoardCells() {
    const boardCells = life.aliveCells;

    // Получить к-ты фишек по оси абсцисс
    const allX = boardCells.map(elem => elem.cellX);
    // Получить к-ты фишек по оси ординат
    const allY = boardCells.map(elem => elem.cellY);

    const cellSize = +jsRange.value;

    // Рассчитаем ширину бокса
    const maxX = Math.max(...allX);
    const minX = Math.min(...allX);
    const widthBox = ((maxX - minX) / cellSize) + 1;

    // Рассчитаем высоту бокса
    const maxY = Math.max(...allY);
    const minY = Math.min(...allY);
    const heightBox = ((maxY - minY) / cellSize) + 1;

    const code = [];
    // Текущая к-та по оси абсцисс
    let iterX;
    // Текущая к-та по оси ординат
    let iterY = minY;
    const isContain = Helpers.containsObject;
    const coordObj = {};
    for (let j = 0; j < heightBox; j += 1) {
      iterY = minY + (j * cellSize);

      for (let i = 0; i < widthBox; i += 1) {
        iterX = minX + (i * cellSize);
        coordObj.x = iterX;
        coordObj.y = iterY;

        if (isContain(boardCells, coordObj)) {
          code.push('0');
        } else {
          code.push('.');
        }
      }

      if (j !== heightBox - 1) code.push(' ');
    }

    return code.join('');
  }

  /* Desc: Поставить обработчики событий на элементы UI.
     Input(undefined)
     Output(undefined) */
  function bindEvents() {
    jsRange.addEventListener('input', () => {
      // input type=range
      const jsOutput = document.getElementById('js-output');
      jsOutput.innerHTML = jsRange.value;

      view.setBoardScale(+jsRange.value);
      clearState();
      allCells.value = view.dimensionX * view.dimensionY;

      // Обновить к-ты конфигураций в соотвествии с новым
      // размером
      fillConfigMap();
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

      const conf = nameToCoordsConfigMap[name];
      for (let i = 0; i < conf.length; i += 1) {
        const x = conf[i][0];
        const y = conf[i][1];
        life.addCell(x, y);
      }

      view.renderChips(life.aliveCells);
      aliveCellsCounter.value = life.aliveCells.length;
    });

    saveBtn.addEventListener('click', () => {
      // Если на доске присуствуют фишки отобразить
      // инпут для ввода имени сохраняемой конфигурации
      const aliveLen = life.aliveCells.length;
      if (aliveLen > 0 && saveConfig.style.display === 'none') {
        saveConfig.style.display = 'inline-block';
      }
    });

    // Side effects: nameToCoordsConfigMap changed
    saveNameInput.addEventListener('change', (evt) => {
      // Найти User optgroup в селекте
      const userOptGroupSelector = 'optgroup[label="User"]';
      let userOptGroup =
          configSelect.querySelector(userOptGroupSelector);

      // Если нет User optgroup => создать его
      if (userOptGroup === null) {
        const userOptGroupTag = '<optgroup label="User"></optgroup>';
        configSelect.insertAdjacentHTML('beforeend', userOptGroupTag);
        userOptGroup = configSelect.querySelector(userOptGroupSelector);
      }

      const textInput = evt.currentTarget;
      const saveName = textInput.value;
      const isNameUnique = !(hasTheSameChildName(userOptGroup, saveName));

      if (isNameUnique) {
        const option = `<option>${saveName}</option>`;
        userOptGroup.insertAdjacentHTML('beforeend', option);

        const newConf = {};
        newConf.name = saveName;
        newConf.category = 'User';
        newConf.configuration = encodeBoardCells();

        // Обновим инф-ю о новых конф-ях для последующего
        // сохранения на диск
        nameToCoordsConfigMap.updated.push(newConf);

        // Новая конф-я ничем не отличается от старых
        nameToCoordsConfigMap[saveName] =
        createConfigCoords(newConf.configuration);

        textInput.value = '';
        document.getElementById('js-save-config').style.display = 'none';
      } else {
        // Tooltip
        const tooltip = document.getElementById('js-save-config-tooltip');
        tooltip.style.opacity = 1;
        setTimeout(() => {
          tooltip.style.opacity = 0;
        }, 3000);
      }
    });

    window.addEventListener('unload', () => {
      const updatedConf = nameToCoordsConfigMap.updated;

      // Если что-то изменилось отправляем на сервер
      if (updatedConf.length > 0) {
        const updatedData = JSON.stringify(updatedConf);
        const xhr = new XMLHttpRequest();

        // Делаем запрос синхронным, чтобы
        // иметь воз-ть обработать ответ
        xhr.open('POST', '/', false);

        // Посылаем данные в формате JSON
        xhr.setRequestHeader(
          'Content-type',
          'application/json; charset=utf-8',
        );

        xhr.onreadystatechange = () => {
          if (xhr.readyState !== 4) return;
          if (xhr.status !== 200) {
            console.log('Something bad happened.');
            console.log('Configs not saved.');
          }
        };

        xhr.send(updatedData);
      }
    });
  }

  function main() {
    // Нарисовать доску для фишек, обновить инф-ю
    // об общем кол-ве клеток
    view.setBoardScale(+jsRange.value);
    view.createBoard();
    allCells.value = view.dimensionX * view.dimensionY;

    // считать все конфигурации в селект
    renderConfigsInDOM();

    // заполним объект имя-конф-ии: к-ты
    fillConfigMap();

    bindEvents();
  }

  main();
})();
