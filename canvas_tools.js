//canvas tools
//changes
//should be a div. 
//spawn the canvas inside of it to better control zoom, etc
function canvasWidget(element){
	widget.call(this, element);
	this.properties = {
		height:200,
		width:200, 
		zoom:1
	};
}
canvasWidget.prototype = new widget();
canvasWidget.prototype.constructor = canvasWidget;
canvasWidget.prototype.initialize = function(){
	//ensure that we're on a canvas tag
	if(this.element.tagName != "CANVAS"){ return; }
	widget.prototype.initialize.call(this);
	this.ctx = this.element.getContext("2d");
	this.element.width = this.properties.width * this.properties.zoom;
	this.element.height = this.properties.height * this.properties.zoom;
	this.PXLs = new PXLmap(this.ctx.getImageData(0,0,this.element.width,this.element.height));
	//event listeners
	var parent = this;
	this.element.addEventListener("click", function(event){parent.pencilTool.call(parent, event);});
}
canvasWidget.prototype.refresh = function(){
	this.element.width = this.properties.width * this.properties.zoom;
	this.element.height = this.properties.height * this.properties.zoom;
}
canvasWidget.prototype.pencilTool = function(event){
	this.ctx.strokeStyle = "#FF0000";
	var limits = this.element.getBoundingClientRect(),
	mousePosX = event.clientX - limits.left,
	mousePosY = event.clientY - limits.top;
	this.ctx.strokeRect(mousePosX, mousePosY, 1,1);
	//save it to pxldata
	this.PXLs.setPXL(mousePosX, mousePosY, new PXL(255,0,0));
}
//container
function containerWidget(element){
	configWidget.call(this, element);
	this.properties = {Resizeable:true, Relocatable:true};
	this.members = [{className:"canvasWidget", tag:"canvas", name:"canvas"}];
}
containerWidget.prototype = new configWidget();
containerWidget.prototype.constructor = containerWidget;
containerWidget.prototype.getContextOptions = function(){
	return configWidget.prototype.getContextOptions.call(this, this);
}