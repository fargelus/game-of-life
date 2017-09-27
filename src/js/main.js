"use strict"

const Universe = require('./universe');
const $ = require('jquery');
const util = require('util');

$(document).ready(function () {

  let $configJSON = $('#config').html();
  let configObj = JSON.parse($configJSON);

  let $standardConfigList = $('#standard-config-list');

  for(let key in configObj){
      let option = document.createElement('option');
      option.innerHTML = key;
      $standardConfigList.append(option);
  }
});
