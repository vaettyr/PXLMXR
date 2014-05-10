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
				thisNode.data = new window[thisClass](thisNode);
				thisNode.data.initialize();
				app.initializeClasses(thisNode.children);
			}
		}
	}
};
//base abstract class to base all widgets on
//TODO: add ability to spawn children from a list (with references)
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
			if(keyValue.length == 2 && keyValue[0]!="" && keyValue[1] != ""){
				this.properties[keyValue[0]] = keyValue[1];
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

//slider Widget
function sliderWidget (element) {
	widget.call(this, element);
	this.properties = {
		orientation: "horizontal",
		lowerLimit:0,
		upperLimit:1
	};
	//this.indicator = "<div data-class='sliderIndicator'></div>";
	this.members = [{className:"sliderIndicator", name:"indicatorRef"}];
	//check the rest of our args to see if we need to set any other properties
    Object.defineProperty(this,"value",{
     get: function() {return this.upperBit(this.value.ch;},
		set : function(val) {this.value = String.fromCharCode(this.lowerBit(this.value.charCodeAt(0)) + val*256,this.value.charCodeAt(1));},
		enumerable: true,
		configurable: false 
    });
}
sliderWidget.prototype = new widget();
sliderWidget.prototype.constructor = sliderWidget;
sliderWidget.prototype.initialize = function() {
	//call the base initializer
	widget.prototype.initialize.call(this);
	//add the slider indicator
	//this.element.innerHTML = this.indicator;
	//save a reference to the indicator
	//this.indicatorRef = this.element.childNodes[0];
	//var propertiesString = this.getPropertiesString();
	//this.indicatorRef.setAttribute("data-properties",propertiesString);
	//hook up mouse events
	this.element.addEventListener("mousedown",this.onMouseDown);
};

sliderWidget.prototype.setSliderPosition = function (pageX, pageY) {
	limits = this.element.getBoundingClientRect(),
	indicator = this.indicatorRef,
	width = indicator.offsetWidth,
	mousePosX = (pageX - limits.left) - (width/2);	
	mousePosX = mousePosX - document.body.scrollLeft;
	mousePosX = Math.min(Math.max(mousePosX,0),this.element.offsetWidth-width);
	mousePosY = (pageY - limits.top) - (width/2);
	mousePosY = mousePosY - document.body.scrollTop;
	mousePosY = Math.min(Math.max(mousePosY, 0), this.element.offsetHeight - width);
	
	if(this.properties.orientation != 'vertical'){	indicator.style.left = mousePosX;}
	if(this.properties.orientation != 'horizontal'){ indicator.style.top = mousePosY;}
	
	this.sliderVal = mousePosX/(this.element.offsetWidth-width);	
	if(this.properties.output!= undefined){
		this.properties.output.innerHTML = (this.properties.lowerLimit * (1 - this.sliderVal)) + this.properties.upperLimit * this.sliderVal;
	}
}
sliderWidget.prototype.onMouseDown = function (event) {
	//bind the other mouse events.
	document.addEventListener("mousemove", this.data.onMouseMove);
	document.addEventListener("mouseup", this.data.onMouseUp);
	document.lastClicked = this;
	this.data.setSliderPosition(event.pageX, event.pageY);
};
sliderWidget.prototype.onMouseMove = function(event){
	document.lastClicked.data.setSliderPosition(event.pageX,event.pageY);
};
sliderWidget.prototype.onMouseUp = function (event) {
	document.removeEventListener("mousemove", document.lastClicked.data.onMouseMove);
	document.removeEventListener("mouseup", document.lastClicked.data.onMouseUp);
};	

//slider indicator
function sliderIndicator (element) {
	widget.call(this, element);
	this.properties = {	};
};
sliderIndicator.prototype = new widget();
sliderIndicator.prototype.constructor = sliderIndicator;

//color picker
function colorPickerWidget (element) {
	widget.call(this, element);
	//console.log("test");
	this.members = [
	    { className:"sliderWidget", name:"satValPane", 
	        properties:{orientation:"pane",type:"sat-val"},
	    { className:"sliderWidget", name:"hueSlider", 
	        properties:{orientation:"vertical",type:"hue" },
	    { className:"sliderWidget", name:"redSlider", 
	        properties:{orientation:"horizontal",type:"red" },
	    { className:"sliderWidget", name:"greenSlider", 
	        properties:{orientation:"horizontal",type:"green" },
	    { className:"sliderWidget", name:"blueSlider", 
	        properties:{orientation:"horizontal",type:"blue" }
	    ];
}
colorPickerWidget.prototype = new widget();
colorPickerWidget.prototype.constructor = colorPickerWidget;
