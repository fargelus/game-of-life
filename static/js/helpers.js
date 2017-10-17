// helpers.js -- вспомогательные функции

// IIFE не засоряет глобальное пространство имён
module.exports = (function Helpers() {
  const unit = {};

  // содержит ли массив объект
  function containsObject(arr, obj) {
    return arr.some(el => el.x === obj.x && el.y === obj.y);
  }

  // вычитание массивов координат
  function getArrayDistract(minuendArr, subtrahendArr) {
    return minuendArr.filter(val => !containsObject(subtrahendArr, val));
  }

  // Заполнить массив значениями по умолчанию
  function fillArrayWithValue(value, len) {
    // Одалживаем метод => arr = [undefined, * len]
    let arr = Array(...Array(len));
    arr = arr.map(() => value);
    return arr;
  }

  // содержит ли массив объект
  unit.containsObject = containsObject;

  // вычитание массивов координат
  unit.getArrayDistract = getArrayDistract;

  unit.fillArrayWithValue = fillArrayWithValue;

  return unit;
}());
