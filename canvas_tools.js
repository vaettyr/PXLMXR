//canvas tools
function canvasWidget(element){
	widget.call(this, element);
}
canvasWidget.prototype = new widget();
canvasWidget.prototype.constructor = configWidget;
canvasWidget.prototype.initialize = function(){
	//ensure that we're on a canvas tag
	if(this.element.tagName != "CANVAS"){ return; }
	widget.prototype.initialize.call(this);
	var ctx = this.element.getContext("2d");
	/*
	ctx.fillStyle = "#FF0000";
	ctx.fillRect(0,0,150,75);
	ctx.imageSmoothingEnabled = false;
	*/
	/*
	var img = new Image();
	img.src = 'Pixelart-tv-iso.png';
	ctx.imageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.mozImageSmoothingEnabled = false;
	ctx.drawImage(img, 0, 0, 64, 64);
	*/
}