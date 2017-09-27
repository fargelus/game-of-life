// helpers.js -- вспомогательные функции

 module.exports = (function () {

  let unit = {};

  // содержит ли массив объект
  function containsObject (arr, obj) {
    return arr.some(el => el.x === obj.x && el.y === obj.y);
  }

  // вычитание массивов координат
  function getArrayDistract(minuendArr, subtrahendArr) {
    return minuendArr.filter( val => !containsObject(subtrahendArr, val) );
  }

  // содержит ли массив объект
  unit.containsObject = containsObject;

  // вычитание массивов координат
  unit.getArrayDistract = getArrayDistract;

  return unit;

}());
