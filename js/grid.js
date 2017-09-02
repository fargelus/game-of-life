"use strict"

var cnv = document.getElementById("canvas");
createGrid();

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

