"use strict"

var cnv = document.getElementById("canvas");
createGrid();

cnv.addEventListener("click", function (evt) {
	
	var mousePos = getMousePos(cnv, evt);
	
	let [xGridCellStart, yInsideGridCell] = getCellCoord(mousePos.x, 
														 mousePos.y);

	// FIX?
	paintCell(xGridCellStart, yInsideGridCell, cnv);
	paintCell(xGridCellStart, yInsideGridCell, cnv);

});


var step = document.getElementById("step-button");
step.addEventListener("click", function(){
	
});



// ***************** Module Functions *********************
function createGrid() {
	
	let context = cnv.getContext("2d");	

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

function getMousePos(canvas, evt) {

	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

function paintCell(xGridCellStart, yInsideGridCell, canvas) {
	
	let context = canvas.getContext("2d");
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

function getCellCoord(x, y){

	let factorX = parseInt(x / 20);
	let factorY = parseInt(y / 20);	

	return [factorX * 20, factorY * 20];
}
// *********************************************************