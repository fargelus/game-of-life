const $ = require('jquery');
require('./universe');

$(document).ready(() => {
  const $configJSON = $('#config').html();
  const configObj = JSON.parse($configJSON);

  const $standardConfigList = $('#standard-config-list');

  const configObjKeys = Object.keys(configObj);
  const configObjKeysLen = configObjKeys.length;

  for (let i = 0; i < configObjKeysLen; i += 1) {
    const option = document.createElement('option');
    option.innerHTML = configObjKeys[i];
    $standardConfigList.append(option);
  }
});

$('#js-range').on('input change', function rangeEventHandler() {
  $('#js-output').text($(this).val());
});
