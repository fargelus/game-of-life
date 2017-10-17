require('./universe');

// main module
class Main {
  constructor() {
    Main.loadConfig();

    // input type=range
    const jsRange = document.getElementById('js-range');
    jsRange.addEventListener('input', () => {
      const jsOutput = document.getElementById('js-output');
      jsOutput.innerHTML = jsRange.value;
    });
  }

  static loadConfig() {
    // load Config
    // JSON с сервера
    const configJSON = document.getElementById('config').innerText;
    const configObj = JSON.parse(configJSON);

    // select - option (HTML)
    const standardConfigList =
    document.getElementById('standard-config-list');

    const configObjKeys = Object.keys(configObj);
    const configObjKeysLen = configObjKeys.length;

    // Заполняем select конфигами
    for (let i = 0; i < configObjKeysLen; i += 1) {
      const option = document.createElement('option');
      option.innerHTML = configObjKeys[i];
      standardConfigList.appendChild(option);
    }
  }
}

window.addEventListener('load', new Main());
