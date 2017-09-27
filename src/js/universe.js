// universe.js -- Вселенная состоящая из клеток

"use strict"

const Cell = require('./cell');
const _ = require('underscore');
const Helpers = require('./helpers');


module.exports = (function (){

		// HTML5 canvas
		const cnv = document.getElementById("canvas");

		// buttons
		const stepBtn = document.getElementById("step-button");
		const clearBtn = document.getElementById("clear-button");
		const runBtn = document.getElementById("run-button");
		const pauseBtn = document.getElementById("pause-button");

		// Helpers
		let containsObject = Helpers.containsObject;

		//******* Клетки *********
		const cellSize = 20;

		// корд-ты клеток в бесконечной плоскости
		let gridAliveCells = [];

		// коорд-ты клетки
		// на двумерной конечной плоскости
		let renderCells = [];

		// **********************

		let isPause = false;

		// Сетка на холсте

		// Main stream
		addListeners();
		createGrid();

		// ********** module functions *************
		function refresh() {
			createGrid();

			// рендерим все живые клетки
			let renderCellsLen = renderCells.length;
			for(let i = 0; i < renderCellsLen; ++i) {
				paintCell(renderCells[i].x, renderCells[i].y);
				paintCell(renderCells[i].x, renderCells[i].y);
			}
		}

		function createGrid(){

			let context = cnv.getContext("2d");

			let width = cnv.width;
			let height = cnv.height;

			// after prev call
			context.clearRect(0, 0, width, height);

			context.fillStyle = "white"; // canvas color
			context.fillRect(0, 0, width, height);

			context.strokeStyle = "black";	// cell stroke color

			// grid rendering
			let stepVal = cellSize;	// default cellSize(20)

			for (let posX = 0; posX <= width; posX += stepVal) {
					context.beginPath();
						context.moveTo(posX, 0);
						context.lineTo(posX, height);
						context.stroke();
					context.closePath();
			}

			for(let posY = 0; posY <= height; posY += stepVal) {
					context.beginPath();
						context.moveTo(0, posY);
						context.lineTo(width, posY);
						context.stroke();
					context.closePath();
				}
		}

		function onClearClick(evt){
			gridAliveCells = [];
			createGrid();
		}

		// получить коо-ты клика на холсте
		function getMousePos(evt) {
			let rect = cnv.getBoundingClientRect();
			return {
				x: evt.clientX - rect.left,
				y: evt.clientY - rect.top
			};
		}

		// получить к-ты начала клетки (левый верхний угол)
		function getCellCoord(x, y) {
			let factorX = parseInt(x / 20);
			let factorY = parseInt(y / 20);

			return [factorX * 20, factorY * 20];
		}

		// раскрасить живую клетку
		function paintCell(xGridCellStart, yGridCellStart) {

			let context = cnv.getContext("2d");

			context.strokeStyle = "rgba(135, 0, 0, 1)";

			let yGridCellEnd = yGridCellStart + cellSize;

			while (yGridCellStart < yGridCellEnd) {

				context.beginPath();
					context.moveTo(xGridCellStart, yGridCellStart);
					context.lineTo(xGridCellStart +
						cellSize, yGridCellStart);
					context.stroke();
				context.closePath();

				++yGridCellStart;
			}
		}

		// Обновляем отображаемые клетки
		function updateRenderCells() {
			renderCells = [];
			let aliveCellNumber = gridAliveCells.length;
			for(let i = 0; i < aliveCellNumber; ++i) {

				let aliveCellX = gridAliveCells[i].x;
				let aliveCellY = gridAliveCells[i].y;

				let [renderCoordX, renderCoordY] =
													 updateBeyondBoundsCoords(aliveCellX,
												 														aliveCellY);

				let renderCell = new Cell(renderCoordX, renderCoordY);
				renderCells.push(renderCell);
			}
		}

		function makeStep() {

			let nextGen = [];

			updateLivingCellNeighbours();

			let len = gridAliveCells.length;
			for(let i = 0; i < len; ++i) {

				let aliveCell = gridAliveCells[i];
				let neighbours = aliveCell.emptyNeighbours;
				let neighboursLen = neighbours.length;

				for(let j = 0; j < neighboursLen; ++j) {
					if (neighbours[j].isAlive && !containsObject(nextGen, neighbours[j])) {

						let cell = new Cell(neighbours[j].x, neighbours[j].y);
						nextGen.push(cell);
					}
				}

				if (aliveCell.isAlive) {
					let cell = new Cell(aliveCell.x, aliveCell.y);
					nextGen.push(cell);
				}
			}

			gridAliveCells = nextGen;

			updateRenderCells();

			console.log(gridAliveCells);

			refresh();
		}

		function run() {
			if (isPause)
				return;

			let prevGen = gridAliveCells.slice();

			makeStep();

			if ( _.isEqual(gridAliveCells, prevGen)
				|| gridAliveCells.length === 0){

				console.log("break");
				return;
			}

			setTimeout(run, 200);
		}

		// DOM Event Listeners
		function addListeners() {

			stepBtn.addEventListener("click", makeStep);

			clearBtn.addEventListener("click", onClearClick);
			runBtn.addEventListener("click", function (evt) {
				isPause = false;
				run();
			});

			pauseBtn.addEventListener("click", function (evt) {
			 	isPause = !isPause;
			 	if (!isPause)
			 		run();
			 });

			// Клик на холсте -> клетка живая
			cnv.addEventListener("click", function(evt){
				// определим координаты клика
				let mousePos = getMousePos(evt);

				// определим к-ты клетки
				let [xGridCellStart, yGridCellStart] =
											getCellCoord(mousePos.x, mousePos.y);

				let cell = new Cell(xGridCellStart, yGridCellStart);

				// сохраним инф-ию о живой клетке
				gridAliveCells.push(cell);
				renderCells.push(cell);

				paintCell(xGridCellStart, yGridCellStart);
				paintCell(xGridCellStart, yGridCellStart);
			});

		}

		// Вышла ли коорд-та за пределы?
		// 1 -- смещение положительное
		// -1 -- смещение отрицательное
		// 0 -- смещения нет
		function isCoordOverBound(coord, bound) {
			if (coord < 0)
				return -1;
			else if (coord > bound)
				return 1;
			return 0;
		}

		// расчет координаты смещения при выходе
		// за пределы вселенной
		function calculateOffsetCoord(coord, bound) {
			// положительное смещение
			if (coord >= bound)
				return coord % bound;

			// отрицательное смещение
			return bound - Math.abs(coord % bound);
		}

		// Описание: Вышла ли клетка за границы вселенной
		// Вход: Коорд-ты рожденной клетки
		// Выход: Новые коорд-ты клетки
		function updateBeyondBoundsCoords(coordX, coordY){

			// Кэшируем на всякий случай
			let gridWidth = cnv.width;
			let gridHeight = cnv.height;

			// граница -- это ширина/высота минус размер клетки
			let boundX = gridWidth - cellSize;
			let boundY = gridHeight - cellSize;

			// Вышла ли координата за границы вселенной
			let resX = isCoordOverBound(coordX, boundX);
			let resY = isCoordOverBound(coordY, boundY);

			let toroidCoordX = coordX;
			// Если смещение по Х -> перерасчет координаты Х
			if (resX != 0)
				toroidCoordX = calculateOffsetCoord(coordX, gridWidth);

			let toroidCoordY = coordY;
			// Если смещение по Y -> перерасчет координат Y
			if (resY != 0)
				toroidCoordY = calculateOffsetCoord(coordY, gridHeight);

			return [].concat(toroidCoordX, toroidCoordY);
		}

		// На очередном шаге клетка узнает о живых соседях
		function updateLivingCellNeighbours() {
			// обновим инф-ю в клетках и их соседях
			// о живых клетках
			let aliveCellsNumber = gridAliveCells.length;
			for(let i = 0; i < aliveCellsNumber; ++i) {

				let aliveCell = gridAliveCells[i];

				// при обновлении клетка меняет своё состояние
				aliveCell.updateNeighbours(gridAliveCells);
			}
		}

}());
