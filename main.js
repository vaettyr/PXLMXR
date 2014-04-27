//main.js
function PXL (){
	//This is schema is optimized for memory, but is slow on performance
	/*
	this.value = String.fromCharCode(0,255);
	this.lowerBit = function(val) { return val % 256; }
	this.upperBit = function(val) { return (val - (val % 256))/256; } 
	Object.defineProperty(this,"red",{
		get: function() {return this.upperBit(this.value.charCodeAt(0));},
		set : function(val) {this.value = String.fromCharCode(this.lowerBit(this.value.charCodeAt(0)) + val*256,this.value.charCodeAt(1));},
		enumerable: true,
		configurable: false
	});
	Object.defineProperty(this,"green",{
		get: function() { return this.lowerBit(this.value.charCodeAt(0));},
		set: function(val) {this.value  = String.fromCharCode(this.upperBit(this.value.charCodeAt(0))*256 + val,this.value.charCodeAt(1));},
		enumerable: true,
		configurable: false
	});
	Object.defineProperty(this,"blue",{
		get: function() { return this.upperBit(this.value.charCodeAt(1));},
		set: function(val) { this.value = String.fromCharCode(this.value.charCodeAt(0), this.lowerBit(this.value.charCodeAt(1)) + val * 256);},
		enumerable: true,
		configurable: false
	});
	Object.defineProperty(this, "alpha",{
		get: function() { return this.lowerBit(this.value.charCodeAt(1));},
		set: function(val) { this.value = String.fromCharCode(this.value.charCodeAt(0),
		this.upperBit(this.value.charCodeAt(1)) * 256 + val);},
		enumerable: true,
		configurable: false
	});
	*/
	this.red = 0;
	this.green = 0;
	this.blue = 0;
	this.alpha = 255;
	this.setValue = function(val) {
		var outValue = val;
		if(val >= 0 && val <=1){ outValue = Math.floor(val * 255);}
		outValue = Math.max(0,Math.min(255,Math.floor(outValue)));
		return outValue;
	}
	if(arguments != undefined){
		if(typeof arguments[0] === "number" && arguments.length <= 4 ) {
			for ( var i = 0; i < arguments.length; i++) {
				this[["red","green","blue","alpha"][i]] = this.setValue(arguments[i]);
			}
		}
		if(typeof arguments[0] ==="object"){ //check if it's a PXL object and duplicate it
			if ( arguments[0] instanceof PXL) {
				this.value = arguments[0].value;
			}
		}
		if(typeof arguments[0] === "string"){
			switch(arguments[0].toUpperCase()){
				case "WHITE":
					this.red = 255;this.blue=255;this.green=255;this.alpha=255;break;
				case "RED":
					this.red=255;break;
				case "GREEN":
					this.green=255;break;
				case "BLUE":
					this.blue=255;break;
				default:
					if(arguments[0].length > 1 && arguments[0].length <=7 && arguments[0].substr(0,1)=="#"){
						for (var i=0;i<(arguments[0].length)/3;i++){
							this[this.channels[i]] = parseInt(arguments[0].substr((i*2)+1,2),16
							);
						}
					}
					break;
			}
		}
	}
}

function PXLmap (){
	this.pxls = [];
	this.width = 0;
	this.height = 0;
	if(arguments != undefined){
		if(toString.call(arguments[0]) === "[object Array]"){
			//argument is an array. Validate the call and populate our data
			if(arguments.length == 3 && typeof arguments[1] == "number" && typeof arguments[2] == "number" && arguments[0].length == (arguments[1] * arguments[2])){
				var thesePXLs = [];
				for(var i=0;i<arguments[0].length;i++){
					if((arguments[0])[i] instanceof PXL){
						thesePXLS.push((arguments[0])[i]);
					} else {
						//console.log("Invalid object in PXLmap constructor");
					}
				}
			}
		}
		if(arguments[0] instanceof ImageData) {
			this.width = arguments[0].width;
			this.height = arguments[0].height;
			for ( var i = 0; i < arguments[0].data.length; i += 4) {
				this.pxls.push(new PXL(arguments[0].data[i],arguments[0].data[i+1],arguments[0].data[i+2],arguments[0].data[i+3]));
			}
		}
	}
	this.toImageData = function(){
		if(this.canvas == undefined){
			this.canvas = document.createElement("canvas").getContext("2d");
		}
		var thisImageData = this.canvas.createImageData(this.width,this.height),
		thisData = [];
		for(var i = 0; i < this.pxls.length; i++){
			thisData.push(this.pxls[i].red);
			thisData.push(this.pxls[i].green);
			thisData.push(this.pxls[i].blue);
			thisData.push(this.pxls[i].alpha);
		}
		thisImageData.data.set(thisData);
		return thisImageData;
	}
}

var Application = {
	initialize: function(elementList){
		var app = this;
		if(elementList == undefined) { elementList = $("[data-class]");}
		elementList.each(function(){
			var thisClass = $(this).attr("data-class");
			if(thisClass != undefined && thisClass != ""){
				$(this).data(new window[thisClass](this));
				$(this).data().initialize();
				app.initialize($(this).children());
			}
		});
	}
};
//base abstract class to base all widgets on
function widget(element) {
	this.element = element;
};
widget.prototype.initialize = function(){
	 var className = this.constructor.name;
	 if(this.properties != undefined){
		for(var property in this.properties){
			className += " "+ this.properties[property];
		}
	 }
	 this.element.className = className;
};

function sliderWidget (element) {
	widget.call(this, element);
	this.properties = {
		orientation: "horizontal",
		type: "hue"
	};
	this.indicator = "<div data-class='sliderIndicator'></div>";
	//check the rest of our args to see if we need to set any other properties
}
sliderWidget.prototype = new widget();
sliderWidget.prototype.constructor = sliderWidget;
sliderWidget.prototype.initialize = function() {
	//call the base initializer
	widget.prototype.initialize.call(this);
	//add the slider indicator
	this.element.innerHTML = this.indicator;
	//save a reference to the indicator
	this.indicatorRef = this.element.childNodes[0];
	//hook up mouse events
	this.element.addEventListener("mousedown",this.onMouseDown);
};
sliderWidget.prototype.onMouseDown = function (event) {
	//bind the other mouse events.
	document.addEventListener("mousemove", $(this).data().onMouseMove);
	document.addEventListener("mouseup", $(this).data().onMouseUp);
	document.lastClicked = this;
	var lowerLimit = this.offsetLeft, 
	upperLimit = lowerLimit + this.offsetWidth,
	mousePos = event.screenX,
	sliderPos = (mousePos-lowerLimit)/upperLimit;
};
sliderWidget.prototype.onMouseMove = function(event){

};
sliderWidget.prototype.onMouseUp = function (event) {
	document.removeEventListener("mousemove", $(document.lastClicked).data().onMouseMove);
	document.removeEventListener("mouseup", $(document.lastClicked).data().onMouseUp);
};	

function sliderIndicator (element) {
	widget.call(this, element);
	this.properties = {	};
};
sliderIndicator.prototype = new widget();
sliderIndicator.prototype.constructor = sliderIndicator;