"use strict"

var cnv = document.getElementById("canvas");

var livingCellCoords = [];

createGrid();

// canvas grid click
cnv.addEventListener("click", function (evt) {
	
	var mousePos = getMousePos(evt);
	
	let [xGridCellStart, yInsideGridCell] = getCellCoord(mousePos.x, 
														 mousePos.y);	
	// сохраняем координаты клетки
	let coordObj = {x: xGridCellStart, 
					y: yInsideGridCell};

	livingCellCoords.push(coordObj);

	// FIX?
	paintCell(xGridCellStart, yInsideGridCell);
	paintCell(xGridCellStart, yInsideGridCell);

	// debug output
	// for (var i = 0; i < livingCellCoords.length; ++i) {
	// 	console.log("x: " + livingCellCoords[i].x + "\ny: " + livingCellCoords[i].y);
	// }
});


var step = document.getElementById("step-button");
step.addEventListener("click", makeStep);	



// ***************** Module Functions *********************
function refresh(){

	createGrid();	

	// рендерим все живые клетки
	for(let i = 0; i < livingCellCoords.length; ++i) {		
		paintCell(livingCellCoords[i].x, livingCellCoords[i].y);
		paintCell(livingCellCoords[i].x, livingCellCoords[i].y);
	}
	
}

function createGrid() {

	let context = cnv.getContext("2d");	

	context.clearRect(0, 0, cnv.width, cnv.height);

	context.fillStyle = "white"; // canvas color
	context.fillRect(0, 0, cnv.width, cnv.height);

	context.strokeStyle = "black";	// cell stroke color

	// grid rendering
	let stepVal = 20;	
	for (let posX = 0; posX <= cnv.width; posX += stepVal) {

		context.beginPath();
			context.moveTo(posX, 0);
			context.lineTo(posX, cnv.height);
			context.stroke();
		context.closePath();

	}

	for(let posY = 0; posY <= cnv.height; posY += stepVal) {

		context.beginPath();
			context.moveTo(0, posY);
			context.lineTo(cnv.width, posY);
			context.stroke();
		context.closePath();
	}
}

function makeStep() {	
	
	let birthArr = [];
	let nextGen = [];

	for(let i = 0; i < livingCellCoords.length; ++i) {

		let x = livingCellCoords[i].x;
		let y = livingCellCoords[i].y;
		
		let allNeighbours = getNeighbours(x, y);


		// ***** DEBUG ***** //
		if (i > 0)
			console.log("\n");

		console.log("cellX: " + x + "\ncellY: " + y);
		// ***************** //

		// получить пустых соседей клетки
		let emptyNeighbours = getArrayDistract(allNeighbours, 
			livingCellCoords);		

		for (let j = 0; j < emptyNeighbours.length; ++j) {

			let emptyCellX = emptyNeighbours[j].x;
			let emptyCellY = emptyNeighbours[j].y;

			// ***** DEBUG ***** //
			console.log("neighbourX: " + emptyCellX + 
				"\nneighbourY: " + emptyCellY);

			console.log( "Live Neighbours: " 
				+ isBirth(emptyCellX, emptyCellY) );
			// ***************** //

			if ( isBirth(emptyCellX, emptyCellY) ) {
				
				// устраняем дублирование
				if ( containsObject(birthArr, emptyNeighbours[j]) === false )
					birthArr.push( emptyNeighbours[j] );
		
			}

		}

		let aliveNeighbours = countLiveNeighbours( allNeighbours );

		if (aliveNeighbours === 2 || aliveNeighbours === 3)
			nextGen.push( livingCellCoords[i] );
	}

	// console.log( birthArr );

	// console.log("Before concat: " + nextGen);
	nextGen = nextGen.concat( birthArr );	

	livingCellCoords = nextGen;
	refresh();
}

// получить к-ты клика пользователя на сетке
function getMousePos(evt) {

	var rect = cnv.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

// раскрасить живую клетку
function paintCell(xGridCellStart, yInsideGridCell) {
	
	let context = cnv.getContext("2d");

	context.strokeStyle = "rgba(135, 0, 0, 1)";
	
	let yGridCellEnd = yInsideGridCell + 20;

	while (yInsideGridCell < yGridCellEnd){

		context.beginPath();
			context.moveTo(xGridCellStart, yInsideGridCell);
			context.lineTo(xGridCellStart + 20, yInsideGridCell);
			context.stroke();
		context.closePath();

		++yInsideGridCell;
	}
}

// получить к-ты начала клетки (левый верхний угол)
function getCellCoord(x, y) {

	let factorX = parseInt(x / 20);
	let factorY = parseInt(y / 20);	

	return [factorX * 20, factorY * 20];
}

// содержит ли массив объект
function containsObject(arr, obj) {
	return arr.some(el => el.x === obj.x && el.y === obj.y);	
}

// вычитание массивов координат
function getArrayDistract(minuendArr, subtrahendArr) {
	return minuendArr.filter( val => !containsObject(subtrahendArr, val) );
}

// рождается ли пустая клетка
function isBirth(x, y) {
	
	let neighboursCoords = getNeighbours(x, y);
	let neigboursAliveNumber = countLiveNeighbours(neighboursCoords);	

	return neigboursAliveNumber === 3;
}

// подсчет кол-ва живых соседей
function countLiveNeighbours(neighboursCoords) {

	// counter -> текущее знач-е счетчика
	// coordObj -> текущие кординаты проверяемой клетки
	return neighboursCoords.reduce( (counter, coordObj) => {

		if ( containsObject(livingCellCoords, coordObj) )
			counter++;

		return counter;
	}, 0);			
}

// получить координаты всех соседей клетки
function getNeighbours(checkedCellX, checkedCellY){

	let neighboursCoords = [];

	for(let currentCellY = checkedCellY - 20; 
			currentCellY <= checkedCellY + 20; 
			currentCellY += 20)

		for(let currentCellX = checkedCellX - 20; 
				currentCellX <= checkedCellX + 20; 
				currentCellX += 20)
		{
			if (currentCellX === checkedCellX 
				&& currentCellY === checkedCellY) continue;

			neighboursCoords.push({x: currentCellX, y: currentCellY});
		}

	return neighboursCoords;
}

// *********************************************************