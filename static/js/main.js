require('./universe');

window.addEventListener('load', () => {
  const configJSON = document.getElementById('config').innerText;
  const configObj = JSON.parse(configJSON);

  const standardConfigList =
                     document.getElementById('standard-config-list');

  const configObjKeys = Object.keys(configObj);
  const configObjKeysLen = configObjKeys.length;

  for (let i = 0; i < configObjKeysLen; i += 1) {
    const option = document.createElement('option');
    option.innerHTML = configObjKeys[i];
    standardConfigList.appendChild(option);
  }
});

const jsRange = document.getElementById('js-range');
jsRange.addEventListener('input', () => {
  const jsOutput = document.getElementById('js-output');
  jsOutput.innerHTML = jsRange.value;
});
