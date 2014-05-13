//main.js
//TODO: Move functions out of constructors. 
//They get duplicated with each instantiation.
//Declare them in a prototype instead.
//This is not built on jquery, so don't use those functions
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
PXL.prototype.setValue = function(val) {
	var outValue = val;
	if(val >= 0 && val <=1){ outValue = Math.floor(val * 255);}
	outValue = Math.max(0,Math.min(255,Math.floor(outValue)));
	return outValue;
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

//TODO: add support for compound selectors (csv)
var Application = {
	initialize: function(elementList){
		this.classes = [];
		for(var styleSheet in document.styleSheets){
			for(var rule in document.styleSheets[styleSheet].rules){
				var thisSelector = document.styleSheets[styleSheet].rules[rule].selectorText;
				if(thisSelector != undefined){
					var selectors = thisSelector.split(".");
					for(var selector in selectors){
						if(selectors[selector] != ""){
							if(this.classes.indexOf(selectors[selector])<0){
								this.classes.push(selectors[selector]);
							} 
						}
					}
				}
			}
		}
		this.initializeClasses();
	},
	initializeClasses: function(elementList){
		var app = this;
		if(elementList == undefined) { elementList = document.querySelectorAll("[data-class]");}
		for(var i=0;i<elementList.length;i++){
			var thisNode = elementList[i],
			thisClass = thisNode.getAttribute("data-class");
			if(thisClass != undefined && thisClass != "" && window[thisClass] != undefined){
				var newClassObject = new window[thisClass](thisNode);
				if(thisNode.data == undefined) {
					thisNode.data = newClassObject;
				} else {
					for(key in newClassObject){
						thisNode.data[key] = newClassObject[key];
					}
				}
				//thisNode.data = new window[thisClass](thisNode);
				thisNode.data.initialize();
				app.initializeClasses(thisNode.children);
				thisNode.data.postInitialize();
			}
		}
	}
};

//base abstract class to base all widgets on
function widget(element) {
	this.element = element;
};
widget.prototype.initialize = function(){
	 var className = this.constructor.name;
	 //get properties
	 var htmlProperties = this.element.getAttribute("data-properties");
	 if(htmlProperties != undefined && htmlProperties != ""){
		var pairs = htmlProperties.split(",");
		for( var i=0; i < pairs.length; i++ ){
			var keyValue = pairs[i].split(":");
			if(keyValue.length == 2 && keyValue[0].trim()!="" && keyValue[1].trim() != ""){
				this.properties[keyValue[0].trim()] = keyValue[1].trim();
			}
		}
	 }
	 //set classes
	if(this.properties != undefined){
		for(var property in this.properties){
			//check to see if this class (or a derivative) exists before adding it
			if(Application.classes.indexOf(property+"-"+this.properties[property])>=0){
				className += " " + property + "-" + this.properties[property];
			}
		}
	 }
	 this.element.className = className;
	 //spawn members
	 if(this.members != undefined){
		//members should be an array of objects
		//each object has className and properties
		var html = "";
		for(var i=0;i<this.members.length;i++){
			var thisMember = this.members[i];
			html += "<div data-class='"+thisMember.className+"'";
			if(thisMember.properties != undefined || this.properties != undefined){
				//build a master list of properties, including overridden properties
				var theseProperties = (this.properties == undefined)?{}:this.properties;
				for(var key in thisMember.properties){
					theseProperties[key] = thisMember.properties[key];
				}
				html += " data-properties='";
				var htmlProperties = "";	
				for(var key in theseProperties){
					if (htmlProperties.length > 0){htmlProperties +=",";}
					htmlProperties += key + ":" + theseProperties[key];
				}
				htmlProperties += "'";
				html += htmlProperties;
			}
			html += "></div>";
		}
		this.element.innerHTML = html;
		//save references to each
		for(var i=0;i<this.members.length;i++){
			this[this.members[i].name] = this.element.children[i];
		}
	 }
};
widget.prototype.postInitialize = function(){
	//placeholder function that is called when all of a widget's members have been initialized
}
widget.prototype.getPropertiesString = function () {
	if(this.properties != undefined){
		var propertiesString = "";
		for(var prop in this.properties){
			//only add properties that are in our class list
			if(Application.classes.indexOf(prop+"-"+this.properties[prop])>=0){
				if(propertiesString.length > 0 ) { propertiesString += ",";}
				propertiesString += prop +":"+this.properties[prop];
			}
		}
		return propertiesString;
	}
}

//input/output widget
function ioWidget (element) {
	widget.call(this, element);
	this.properties = { type: "number" , size: "3"};
}
ioWidget.prototype = new widget();
ioWidget.prototype.constructor = ioWidget;
ioWidget.prototype.initialize = function () {
	widget.prototype.initialize.call(this);
	//add our input
	this.element.innerHTML = "<input type='"+this.properties.type+"' size='"+this.properties.size+"' style='width:"+this.properties.size+"em;'/>";
	this.input = this.element.children[0];
	if(this.properties.width != undefined){
		this.input.style.width = this.properties.width + "em";
	}
	//hook up onUpdate default handler
	this.input.onchange = this.onChange;
	//set virtual 'value' property
	Object.defineProperty(this, "value", {
		get: function () {
			return this.input.value;
		},
		set: function (val) {
			this.input.value = val;
		},
		enumerable: true,
		configurable: false 
	});
}
ioWidget.prototype.onChange = function() {
	var parent = this.parentNode.data;
	parent.onUpdate.call(this);
}

//slider Widget
function sliderWidget (element) {
	widget.call(this, element);
	this.properties = {
		orientation: "horizontal",
		lowerLimit:0,
		upperLimit:1
	};
	this.members = [{className:"sliderIndicator", name:"indicatorRef"}];
}
sliderWidget.prototype = new widget();
sliderWidget.prototype.constructor = sliderWidget;
sliderWidget.prototype.initialize = function() {
	widget.prototype.initialize.call(this);
	//hook up mouse events
	this.element.addEventListener("mousedown",this.onMouseDown);
	//hook up mobile touch event
	this.element.addEventListener("touchstart", this.onMouseDown);
	Object.defineProperty(this,"value",{
		get: function() {
			switch(this.properties.orientation){
				case "horizontal":
					return this.getHorizontal();
					break;
				case "vertical":
					return this.getVertical();
					break;
				default:
					return {x:this.getHorizontal(), y:this.getVertical()};
					break;
			}
		},
		set : function() {
			switch(this.properties.orientation){
				case "horizontal":
					this.setHorizontal(arguments[0]);
					break;
				case "vertical":
					this.setVertical(arguments[0]);
					break;
				default:
					this.setHorizontal(arguments[0]);
					this.setVertical(arguments[1]);
					break;
			}
		},
		enumerable: true,
		configurable: false 
    });
};
sliderWidget.prototype.getHorizontal = function() {
	if(this.indicatorRef == undefined){return;}
	var x = this.indicatorRef.style.left; 
	x = x.slice(0,x.length-2); //remove 'px' and cast to number
	x = x / (this.element.offsetWidth - this.indicatorRef.offsetWidth);
	x = (this.properties.lowerLimit * (1 - x)) + (this.properties.upperLimit * x);
	return x;
}
sliderWidget.prototype.setHorizontal = function(val) {
	if(this.indicatorRef == undefined){return;}
	var x = Math.max(Math.min(this.properties.upperLimit, val),this.properties.lowerLimit);
	x = (x - this.properties.lowerLimit)/this.properties.upperLimit;
	x = x * (this.element.offsetWidth - this.indicatorRef.offsetWidth);
	this.indicatorRef.style.left = x + "px";
}
sliderWidget.prototype.getVertical = function() {
	if(this.indicatorRef == undefined){return;}
	var y = this.indicatorRef.style.top;
	y = y.slice(0,y.length-2); //remove 'px' and cast to number
	y = y / (this.element.offsetHeight - this.indicatorRef.offsetHeight);
	y = (this.properties.lowerLimit * (1 - y)) + (this.properties.upperLimit * y);
	return y;
}
sliderWidget.prototype.setVertical = function(val) {
	if(this.indicatorRef == undefined){return;}
	var y = Math.max(Math.min(this.properties.upperLimit, val),this.properties.lowerLimit);
	y = (y - this.properties.lowerLimit)/this.proerties.upperLimit;
	y = y * (this.element.offsetHeight - this.indicatorRef.offsetHeight);
	this.indicatorRef.style.top = y + "px";
}
sliderWidget.prototype.setSliderPosition = function (pageX, pageY) {
	var limits = this.element.getBoundingClientRect(),
	indicator = this.indicatorRef,
	width = indicator.offsetWidth,
	mousePosX = (pageX - limits.left) - (width/2),
	mousePosY = (pageY - limits.top) - (width/2);	
	mousePosX = mousePosX - document.body.scrollLeft;
	mousePosX = Math.min(Math.max(mousePosX,0),this.element.offsetWidth-width);
	mousePosY = mousePosY - document.body.scrollTop;
	mousePosY = Math.min(Math.max(mousePosY, 0), this.element.offsetHeight - width);
	
	if(this.properties.orientation != 'vertical'){	indicator.style.left = mousePosX + "px";}
	if(this.properties.orientation != 'horizontal'){ indicator.style.top = mousePosY + "px";}
	//execute any callback events
	if(this.onUpdate != undefined){this.onUpdate(this);}
}
sliderWidget.prototype.onMouseDown = function (event) {
	//bind the other mouse events.
	document.addEventListener("mousemove", this.data.onMouseMove);
	document.addEventListener("mouseup", this.data.onMouseUp);
	//bind mobile touch events
	document.addEventListener("touchmove", this.data.onMouseMove);
	document.addEventListener("touchend", this.data.onMouseUp);
	document.lastClicked = this;
	this.data.setSliderPosition(event.pageX, event.pageY);
	event.preventDefault();
};
sliderWidget.prototype.onMouseMove = function(event){
	document.lastClicked.data.setSliderPosition(event.pageX,event.pageY);
	event.preventDefault();
};
sliderWidget.prototype.onMouseUp = function (event) {
	document.removeEventListener("mousemove", document.lastClicked.data.onMouseMove);
	document.removeEventListener("mouseup", document.lastClicked.data.onMouseUp);
	//remove mobile touch events
	document.removeEventListener("touchmove", document.lastClicked.data.onMouseMove);
	document.removeEventListener("touchend", document.lastClicked.data.onMouseUp);
	event.preventDefault();
};	

//slider indicator
function sliderIndicator (element) {
	widget.call(this, element);
	this.properties = {	};
};
sliderIndicator.prototype = new widget();
sliderIndicator.prototype.constructor = sliderIndicator;

//ioSlider widget
function ioSliderWidget (element) {
	widget.call(this,element);
	this.properties = { viewMode:"both", orientation:"horizontal"};
	this.members = [
		{className:"sliderWidget", name:"slider"}
	];
}
ioSliderWidget.prototype = new widget();
ioSliderWidget.prototype.constructor = ioSliderWidget;
ioSliderWidget.prototype.initialize = function () {
	if(this.properties.orientation != "vertical" || this.properties.orientation != "horizontal"){
		this.members.push({className:"ioWidget", name:"output"});
	} else {
		this.members.push({className:"ioWidget", name:"outputX"});
		this.members.push({className:"ioWidget", name:"outputY"});
	}
	widget.prototype.initialize.call(this);
};
ioSliderWidget.prototype.postInitialize = function () {
	widget.prototype.postInitialize.call(this);
	var slider = this.slider.data;
	if(this.properties.orientation != "vertical" || this.properties.orientation != "horizontal"){
		var output = this.output.data;
		output.onUpdate = function () { slider.value = ouput.value; };
		slider.onUpdate = function () {output.value = slider.value; };
		if(this.properties.viewMode != "output"){output.value = slider.value;}
	} else {
		var outputX = this.outputX.data, outputY = this.outputY.data;
		outputX.onUpdate = function () { slider.value = [outputX.value, outputY.value];};
		outputY.onUpdate = function () { slider.value = [outputX.value, outputY.value];};
		slider.onUpdate = function () { outputX.value = slider.value.x; outputY.value = slider.value.y;};
		if(this.properties.viewMode != "output"){
			outputX.value = slider.value.x;
			outputY.value = slider.value.y;
		}
	}
}
ioSliderWidget.prototype.changeViewMode = function (viewmode) {
	if(viewmode===this.properties.viewMode){return;}
	if(this.properties.viewMode != "both" || viewmode != "both"){
		//toggling one for the other
		//modify to use className instead of classList
		this.element.classList.add("viewMode-"+viewmode);
		this.element.classList.remove("viewMode-"+this.properties.viewMode);
		this.slider.classList.add("viewMode-"+viewmode);
		this.slider.classList.remove("viewMode-"+this.properties.viewMode);
		this.output.classList.add("viewMode-"+viewmode);
		this.output.classList.remove("viewMode-"+this.properties.viewMode);
	} 
}


//rgb widget
function rgbWidget (element) {
	widget.call(this, element);
	this.members = [
		{ className:"sliderWidget", name:"red", 
	        properties:{orientation:"horizontal",type:"red" , upperLimit:255 }},
	    { className:"sliderWidget", name:"green", 
	        properties:{orientation:"horizontal",type:"green" , upperLimit:255 }},
	    { className:"sliderWidget", name:"blue", 
	        properties:{orientation:"horizontal",type:"blue" , upperLimit:255 }}
	];
	this.color = new PXL();
}
rgbWidget.prototype = new widget();
rgbWidget.prototype.constructor = rgbWidget;
rgbWidget.prototype.initialize = function() {
	widget.prototype.initialize.call(this);
	var parent = this,
	parentSetColor = function(){parent.setColor.call(parent);};
	this.red.data = {onUpdate : parentSetColor};
	this.green.data = {onUpdate : parentSetColor};
	this.blue.data = {onUpdate : parentSetColor};
}
rgbWidget.prototype.setColor = function() {
	this.color.red = this.color.setValue(this.red.data.value);
	this.color.green = this.color.setValue(this.green.data.value);
	this.color.blue = this.color.setValue(this.blue.data.value);
}
rgbWidget.prototype.setValues = function(){
	//drive the sliders from external inputs
}

//color picker
function colorPickerWidget (element) {
	widget.call(this, element);
	this.members = [
	    { className:"sliderWidget", name:"satValPane", 
	        properties:{orientation:"pane",type:"sat-val"}},
	    { className:"sliderWidget", name:"hueSlider", 
	        properties:{orientation:"vertical",type:"hue" }}
	    ];
}
colorPickerWidget.prototype = new widget();
colorPickerWidget.prototype.constructor = colorPickerWidget;
