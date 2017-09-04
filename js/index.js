"use strict"

var cnv = document.getElementById("canvas");

var coordsArr = [];

createGrid();

// canvas grid click
cnv.addEventListener("click", function (evt) {
	
	var mousePos = getMousePos(evt);
	
	let [xGridCellStart, yInsideGridCell] = getCellCoord(mousePos.x, 
														 mousePos.y);	
	// сохраняем координаты клетки
	let coordObj = {x: xGridCellStart, 
					y: yInsideGridCell};

	coordsArr.push(coordObj);

	// FIX?
	paintCell(xGridCellStart, yInsideGridCell);
	paintCell(xGridCellStart, yInsideGridCell);

	// debug output
	// for (var i = 0; i < coordsArr.length; ++i) {
	// 	console.log("x: " + coordsArr[i].x + "\ny: " + coordsArr[i].y);
	// }
});


var step = document.getElementById("step-button");
step.addEventListener("click", makeStep);	



// ***************** Module Functions *********************
function refresh(){

	createGrid();	

	// рендерим все живые клетки
	for(let i = 0; i < coordsArr.length; ++i) {		
		paintCell(coordsArr[i].x, coordsArr[i].y);
		paintCell(coordsArr[i].x, coordsArr[i].y);
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
	
	// проверка на гибель на след. шаге
	let newCoords = [];
	for(let i = 0; i < coordsArr.length; ++i) {

		let aliveNeigbours = countNeighbours(coordsArr[i].x, 
											 coordsArr[i].y);		

		if (aliveNeigbours == 2 || aliveNeigbours == 3)
			newCoords.push( coordsArr[i] );
	}
	
	coordsArr = newCoords;
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
function getCellCoord(x, y){

	let factorX = parseInt(x / 20);
	let factorY = parseInt(y / 20);	

	return [factorX * 20, factorY * 20];
}

// содержит ли массив объект
function containsObject(arr, obj){
	return arr.some(el => el.x === obj.x && el.y === obj.y);	
}

// подсчет кол-ва живых соседей
function countNeighbours(checkedCellX, checkedCellY) {		
	// console.log("x: " + checkedCellX, "y: " + checkedCellY);

	let neighbours = 0;

	for(let currentCellY = checkedCellY - 20; 
			currentCellY <= checkedCellY + 20; 
			currentCellY += 20)

		for(let currentCellX = checkedCellX - 20; 
				currentCellX <= checkedCellX + 20; 
				currentCellX += 20)
		{

			if (currentCellX === checkedCellX 
				&& currentCellY === checkedCellY) continue;

			
			let currentCellCoord = {x: currentCellX, y: currentCellY};

			if (containsObject(coordsArr, currentCellCoord))
				neighbours++;
		}

	return neighbours;
}

// *********************************************************