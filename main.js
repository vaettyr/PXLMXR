//main.js
//TODO: Move functions out of constructors. 
//They get duplicated with each instantiation.
//Declare them in a prototype instead.
//http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
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
	if(val >= 0 && val <=1 && val.indexOf(".")>-1){ outValue = Math.floor(val * 255);}
	outValue = Math.max(0,Math.min(255,Math.floor(outValue)));
	return outValue;
}
PXL.prototype.toColor = function(){
	var output;
	switch(typeof arguments[0]){
		case "string":
			switch(arguments[0]){
				case "rgb":
					output = this.red+","+this.green+","+this.blue;
					break;
			}
			break;
		default:
			output = this.red+","+this.green+","+this.blue+","+this.alpha;
			break;
	}
	return output;
}
PXL.prototype.HSVtoRGB = function(h,s,v){
	var c = v * s,
	newH = h/60,
	x = c * (1 - Math.abs(newH%2-1)),
	color;
	switch (newH - (newH%1)){
		case 0:
			color = [c,x,0];
			break;
		case 1:
			color = [x,c,0];
			break
		case 2:
			color = [0,c,x];
			break;
		case 3:
			color = [0,x,c];
			break;
		case 4:
			color = [x,0,c];
			break;
		default:
			color = [c,0,x];
			break;
	}
	var m = v - c;
	color = [Math.round(255*(color[0]+m)), Math.round(255*(color[1]+m)), Math.round(255*(color[2]+m))];
	return color;	
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

//initialization sequence is as follows:
//initialize (set variables, no children spawned yet)
//postinitialize (immediate children spawned, siblings may not be active)
//start (all children and siblings spawned)
//TODO: add support for compound selectors (csv)
var Application = {
	initialize: function(elementList){
		/*
		document.addEventListener("contextmenu", function(event){
			event.preventDefault();
			event.stopPropagation();
			return false;
		});
		*/
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
		this.startClasses();
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
				thisNode.data.initialize();
				app.initializeClasses(thisNode.children);
				thisNode.data.postInitialize();
			}
		}
	},
	startClasses: function(elementList){
		var app = this;
		if(elementList == undefined) { elementList = document.querySelectorAll("[data-class]");}
		for(var index in elementList){
			var member = elementList[index].data;
			if(member != undefined){
				elementList[index].data.start();
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
	 //load initialization data from html mark-up
	 var htmlAttributes = this.element.attributes;
	 for(var index in htmlAttributes){
		if(htmlAttributes[index].name!=undefined && htmlAttributes[index].name.match(/^data-(?!class)/i)){
			var content = this.parseHTML(htmlAttributes[index].value),
			attribute = htmlAttributes[index].name.slice(5);
			if(this[attribute] == undefined || typeof content != "object" || content instanceof Array){
				this[attribute] = content;
			} else {
				for(var key in content){
					this[attribute][key] = content[key];
				}
			}
		}
	 }
	 //set classes based on properties and settings
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
		//each object can have className, properties, attributes, and a tag
		var html = "";
		for(var i=0;i<this.members.length;i++){
			var thisMember = this.members[i];
			//add an optional label
			if(thisMember.label != undefined){
				html += "<label>"+thisMember.label+"</label>";
			}
			var tag = (thisMember.tag == undefined)?"div":thisMember.tag;
			html += "<"+tag+" data-class='"+thisMember.className+"'";
			//add class properties
			//we need to inherit parent properties and settings, but nothing else
			thisMember.properties = (thisMember.properties)?thisMember.properties:{};
			for(var key in this.properties){
				thisMember.properties[key] = (thisMember.properties[key])?thisMember.properties[key]:this.properties[key];
			}
			thisMember.settings = (thisMember.settings||this.settings)?(thisMember.settings)?thisMember.settings:{}:undefined;
			for(var key in this.settings){
				thisMember.settings[key] = (thisMember.settings[key])?thisMember.settings[key]:this.settings[key];
			}
			for(var attribute in thisMember){
				if(attribute != "tag" && attribute != "className" && attribute != "attributes" && thisMember[attribute]){
					html += "data-"+attribute+"='";
					html += this.toHTML(thisMember[attribute])+"'";
				}
			}
			/*
			if(thisMember.properties != undefined || this.properties != undefined){
				//build a master list of properties, including overridden properties
				var theseProperties = (this.properties == undefined)?{}:this.properties;
				for(var key in thisMember.properties){
					theseProperties[key] = thisMember.properties[key];
				}
				html += " data-properties='";
				var htmlProperties = "";	
				for(var key in theseProperties){
					if (htmlProperties.length > 0){htmlProperties +=";";}
					htmlProperties += key + ":" + theseProperties[key];
				}
				htmlProperties += "'";
				html += htmlProperties;
			}
			*/
			//add tag attributes
			if(thisMember.attributes != undefined){
				for(var key in thisMember.attributes){
					html += " " + key + "=" + thisMember.attributes[key];
				}
			}
			html += "></"+tag+">";
		}
		this.element.innerHTML = html;
		//save references to each
		for(var i=0;i<this.members.length;i++){
			this[this.members[i].name] = this.element.children[i];
		}
	 }
};
widget.prototype.parseHTML = function(html){
	var parsed;
	var parseInnerHTML = function(element){
		var thisValue;
		if(element.trim().indexOf(":") >= 0){
			//object
			thisValue = {};
			element = element.trim().split(";");
			for(var index in element){
				var pair = element[index].split(":");
				if(pair[0] != ""){
					thisValue[pair[0]] = pair[1];
				}
			}
		} else if(element.trim().indexOf(" ") >= 0){
			//array
			thisValue = element.trim().split(" ");
		} else {
			//string
			thisValue = element.trim();
		}
		return thisValue;
	}
	if(html.indexOf(",")>=0){
		parsed = [];
		html = html.split(",");
		html.forEach(function(element){
			parsed.push(parseInnerHTML(element));
		});
	} else {
		parsed = parseInnerHTML(html);
	}
	return parsed;
}
widget.prototype.toHTML = function(element){
	//takes an object (probably from this.members) and formats it as an html element
	var html = "";
	//can output arrays, strings, objects
	var toInnerHTML = function(elem){
		var thisHTML = "";
		if(elem instanceof Object){
			for(var key in elem){
				thisHTML += key+":"+elem[key]+";";
			}
		} else if (elem instanceof Array){
			elem.forEach(function(value, index){
				if(index>0){thisHTML += " ";}
				thisHTML += value;
			});
		} else {
			thisHTML += elem;
		}
		return thisHTML;
	}
	if(element instanceof Array){
		element.forEach(function(value, index){
			if(index>0){html += ",";}
			html += toInnerHTML(value);
		});
	} else {
		html = toInnerHTML(element);
	}
	return html;
}
widget.prototype.postInitialize = function(){
	for(var index in this.element.attributes){
		var thisName = this.element.attributes[index].name;
		if(thisName && thisName.match(/^data-(?!class)/i)){
			this.element.removeAttribute(this.element.attributes[index].name);
		}
	}
	//placeholder function that is called when all of a widget's members have been initialized
}
widget.prototype.start = function(){
	for(var index in this.element.attributes){
		var thisName = this.element.attributes[index].name;
		if(thisName && thisName.match(/^data-(?!class)/i)){
			this.element.removeAttribute(this.element.attributes[index].name);
		}
	}
	//placeholder function that is called when the entire application is initialized
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
widget.prototype.getClasses = function () {
	return this.element.className.split(" ");
}
widget.prototype.setClasses = function () {
	var classes = "", 
	classlist = (typeof arguments[0] === "string") ? arguments : arguments[0];
	for(var i=0;i<classlist.length;i++){
		if(i>0){classes += " ";};
		classes += classlist[i];
	}
	this.element.className = classes;
}
widget.prototype.hasClass = function (classname) {
	return this.getClasses().indexOf(classname) >= 0;
}
widget.prototype.addClass = function (classname) {
	if(!this.hasClass(classname)){
		var classes = this.getClasses();
		classes.push(classname);
		this.setClasses(classes);
		return true;
	}
	return false;
}
widget.prototype.removeClass = function (classname) {
	if(this.hasClass(classname)){
		var classes = this.getClasses();
		classes.splice(classes.indexOf(classname),1);
		this.setClasses(classes);
	}
	return false;
}
widget.prototype.animate = function (property, value, time, callback){
	if(callback != undefined){
		var parent = this,
		callbackFunction = function(){
			callback();
			parent.element.removeEventListener('webkitTransitionEnd', callbackFunction);
		};
		this.element.addEventListener('webkitTransitionEnd', callbackFunction);
	}
	this.element.style.transition = property + " " + time +"ms";
	this.element.style[property] = value;
}

//base abstract class to contain multiple widgets
//unneccessary? not currently being used
function containerWidget(element){
	widget.call(this, element);
}
containerWidget.prototype = new widget();
containerWidget.prototype.constructor = containerWidget;
containerWidget.prototype.initialize = function(){
	widget.prototype.initialize.call(this);
	//spawn members and initialize them
}
containerWidget.prototype.configureSelf = function() {
	
}

//input/output widget
function ioWidget (element) {
	widget.call(this, element);
}
ioWidget.prototype = new widget();
ioWidget.prototype.constructor = ioWidget;
ioWidget.prototype.initialize = function () {
	//ensure that we're on an input tag
	if(this.element.tagName != "INPUT"){ return; }
	widget.prototype.initialize.call(this);
	//hook up onUpdate default handler
	this.element.onchange = this.onChange;
	Object.defineProperty(this, "value", {
		get: function(){return this.element.value;},
		set: function(value){this.element.value = value;},
		enumerable: true,
		configurable: false
	});
}
ioWidget.prototype.onChange = function() {
	var parent = this.data;
	if(parent.element.getAttribute("type") == "number"){
		var value = parent.element.value;
		value = Math.max(parent.properties.lowerLimit,Math.min(parent.properties.upperLimit, value));
		if(parent.properties.output == "int"){
			value = Math.round(value);
		}
		parent.element.value = value;
	}
	parent.onUpdate && parent.onUpdate.call(this);
}

//slider Widget
function sliderWidget (element) {
	widget.call(this, element);
	this.properties = {
		orientation: "horizontal",
		lowerLimit:0,
		upperLimit:1,
		output:"float"
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
	//orientation settings
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
		set : function(value) {
			switch(this.properties.orientation){
				case "horizontal":
					this.setHorizontal(value);
					break;
				case "vertical":
					this.setVertical(value);
					break;
				default:
					this.setHorizontal(value.x);
					this.setVertical(value.y);
					break;
			}
		},
		enumerable: true,
		configurable: false 
    });
};
sliderWidget.prototype.start = function(){
	widget.prototype.start.call(this);
	if(this.properties.orientation == "pane"){
		this.setHeight();
	}
}
sliderWidget.prototype.setHeight = function(val){
	if(val != undefined){
		this.element.style.height = val + "px";
		this.element.style["min-height"] = val + "px";
	} else {
		this.element.style.height = this.element.offsetWidth + "px";
		this.element.style["min-height"] = this.element.offsetWidth + "px";
	}
}
sliderWidget.prototype.getHorizontal = function() {
	if(this.indicatorRef == undefined){return;}
	var x = this.indicatorRef.style.left; 
	x = x.slice(0,x.length-2); //remove 'px' and cast to number
	x = x / (this.element.offsetWidth - this.indicatorRef.offsetWidth);
	//get limits
	var lowerLimit = (this.properties.lowerLimitX != undefined)?this.properties.lowerLimitX:this.properties.lowerLimit,
	upperLimit = (this.properties.upperLimitX != undefined)?this.properties.upperLimitX:this.properties.upperLimit;
	x = (lowerLimit * (1 - x)) + (upperLimit * x);
	if(this.properties.orientation != "pane" && this.properties.output == "int"){x = Math.round(x);}
	if(this.properties.orientation == "pane" && this.properties.outputX == "int"){x = Math.round(x);}
	return x;
}
sliderWidget.prototype.setHorizontal = function(val) {
	if(this.indicatorRef == undefined){return;}
	//get limits
	var lowerLimit = (this.properties.lowerLimitX != undefined)?this.properties.lowerLimitX:this.properties.lowerLimit,
	upperLimit = (this.properties.upperLimitX != undefined)?this.properties.upperLimitX:this.properties.upperLimit,
	x = Math.max(Math.min(upperLimit, val),lowerLimit);
	x = (x - lowerLimit)/upperLimit;
	x = x * (this.element.offsetWidth - this.indicatorRef.offsetWidth);
	this.indicatorRef.style.left = x + "px";
}
sliderWidget.prototype.getVertical = function() {
	if(this.indicatorRef == undefined){return;}
	var y = this.indicatorRef.style.top;
	y = y.slice(0,y.length-2); //remove 'px' and cast to number
	y = y / (this.element.offsetHeight - this.indicatorRef.offsetHeight);
	//get limits
	var lowerLimit = (this.properties.lowerLimitY != undefined)?this.properties.lowerLimitY:this.properties.lowerLimit,
	upperLimit = (this.properties.upperLimitY != undefined)?this.properties.upperLimitY:this.properties.upperLimit;
	y = (lowerLimit * (1 - y)) + (upperLimit * y);
	if(this.properties.orientation != "pane" && this.properties.output == "int"){y = Math.round(y);}
	if(this.properties.orientation == "pane" && this.properties.outputY == "int"){y = Math.round(y);}
	return y;
}
sliderWidget.prototype.setVertical = function(val) {
	if(this.indicatorRef == undefined){return;}
	//get limits
	var lowerLimit = (this.properties.lowerLimitY != undefined)?this.properties.lowerLimitY:this.properties.lowerLimit,
	upperLimit = (this.properties.upperLimitY != undefined)?this.properties.upperLimitY:this.properties.upperLimit,
	y = Math.max(Math.min(this.properties.upperLimit, val),this.properties.lowerLimit);
	y = (y - this.properties.lowerLimit)/this.properties.upperLimit;
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
	if(event.button != 0){return;}
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
//TODO: re-work changeViewMode function
//or, REMOVE
function ioSliderWidget(element) {
	widget.call(this,element);
	this.properties = { 
		viewMode:"both", 
		orientation:"horizontal",
		upperLimit: 1,
		lowerLimit:0
	};
	this.members = [
		{className:"sliderWidget", name:"slider"},
		{className:"ioWidget", name:"output", tag:"input", properties:{output:"int"}, attributes:{type:"number", size:3, pattern:"/d/d/d", step:1}},
		{className:"ioWidget", name:"outputX", tag:"input", properties:{output:"int"}, attributes:{type:"number", size:3, pattern:"/d/d/d", step:1}},
		{className:"ioWidget", name:"outputY", tag:"input", properties:{output:"int"}, attributes:{type:"number", size:3, pattern:"/d/d/d", step:1}}
	];
}
ioSliderWidget.prototype = new widget();
ioSliderWidget.prototype.constructor = ioSliderWidget;
ioSliderWidget.prototype.initialize = function () {
	widget.prototype.initialize.call(this);
	if(this.properties.orientation == "vertical" || this.properties.orientation == "horizontal"){
		this.element.removeChild(this.outputX);
		this.element.removeChild(this.outputY);
		this.outputX = undefined;
		this.outputY = undefined;
		//set virtual property
		Object.defineProperty(this, "value", {
			get: function(){
				return this.output.value;
			},
			set: function(value){
				this.output.value = value;
				this.output.onUpdate();
			},
			enumerable:true,
			configurable:false
		});
	} else {
		this.element.removeChild(this.output);
		this.output = undefined;
		//set virtual property
		Object.defineProperty(this, "value", {
			get: function(){
				return {x:this.outputX.value, y:this.outputY.value};
			},
			set: function(value){
				this.outputX.value = value[0];
				this.outputY.value = value[1];
				this.outputX.onUpdate();
				this.outputY.onUpdate();
			},
			enumerable:true,
			configurable:false
		});
	}
	
};
ioSliderWidget.prototype.postInitialize = function () {
	widget.prototype.postInitialize.call(this);
	var slider = this.slider.data,
	parent = this;
	if(this.properties.orientation == "vertical" || this.properties.orientation == "horizontal"){
		var output = this.output.data;
		output.onUpdate = function () { slider.value = output.value; parent.onUpdate();};
		slider.onUpdate = function () {output.value = slider.value; parent.onUpdate();};
		if(this.properties.viewMode != "output"){output.value = slider.value;}
	} else {
		var outputX = this.outputX.data, outputY = this.outputY.data;
		outputX.onUpdate = function () { slider.value = {x:outputX.value, y:outputY.value};parent.onUpdate();};
		outputY.onUpdate = function () { slider.value = {x:outputX.value, y:outputY.value};parent.onUpdate();};
		slider.onUpdate = function () { outputX.value = slider.value.x; outputY.value = slider.value.y;parent.onUpdate();};
		if(this.properties.viewMode != "output"){
			outputX.value = slider.value.x;
			outputY.value = slider.value.y;
		}
	}
}
ioSliderWidget.prototype.onUpdate = function(){
	//placeholder function for other objects to override
}
ioSliderWidget.prototype.changeViewMode = function (viewmode) {
	if(viewmode===this.properties.viewMode){return;}
	/*
	if(this.properties.viewMode != "both" || viewmode != "both"){
		var parent = this,
		elements = [this, this.slider.data];
		if(this.properties.orientation == "pane"){
			elements.push(this.outputX.data);
			elements.push(this.ouputY.data);
		} else {
			elements.push(this.output.data);
		}
		elements.forEach(function(element){
			element.addClass("viewMode-"+viewmode);
			element.removeClass("viewMode-"+parent.properties.viewMode);
		});
	} 
	*/
	var parent = this,
	startViewMode = this.properties.viewMode,
	slider = this.slider.data,
	output = (this.properties.orientation == "pane")?[this.ouputX.data, this.outputY.data]:[this.output.data];
	switch(viewmode){
		case "slider":
			//hide outputs
			output.forEach(function(element){ element.animate("width","0em",200, function(){
				output.forEach(function(element){ element.animate("opacity",0,100, function(){
					output.forEach(function(element){element.element.style.display = "none";});
					//show sliders
					if(startViewMode == "output"){
						slider.element.style.display = null;
						slider.animate("opacity", 1, 100, function(){
							slider.animate("width", "100%", 200);
						});
					} else {
						slider.animate("width", "100%", 200);
					}
				})});
			})});
			break;
		case "output":
			//hide slider
			slider.animate("width", "0%", 200, function(){
				slider.animate("opacity", 0, 100, function(){
					slider.element.style.display = "none";
					if(startViewMode == "slider"){
						//display the output
						output.forEach(function(element){
							element.element.style.display = null;
							element.animate("opacity", 1, 100);
							element.animate("width", "3em", 200);
						});
					} 
				});
			});
			break;
		default:
		
			break;
	}
	this.properties.viewMode = viewmode;
}

//TODO: rename to colorWidget. Can be inherited from for palette swatches, etc
//color swatch widget
//TODO: add color utilities
function swatchWidget(element) {
	widget.call(this, element);
}
swatchWidget.prototype = new widget();
swatchWidget.prototype.constructor = swatchWidget;

//TODO: make a single, configurable multi-slider widget
//TODO: this should inherit from containerWidget
//TODO: this should be able to initialize at a particular value set
function multiSliderWidget(element) {
	widget.call(this, element);
}
multiSliderWidget.prototype = new widget();
multiSliderWidget.prototype.constructor = multiSliderWidget;
multiSliderWidget.prototype.postInitialize = function() {
	widget.prototype.postInitialize.call(this);
	this.configureSelf();
}
multiSliderWidget.prototype.knownTypes = {
	hue:{upperLimit:360,output:"int"},
	saturation:{upperLimit:100,output:"int"},
	value:{upperLimit:100,output:"int"},
	lightness:{upperLimit:100,output:"int"},
	red:{upperLimit:255,output:"int"},
	green:{upperLimit:255,output:"int"},
	blue:{upperLimit:255,output:"int"}
};
multiSliderWidget.prototype.configureSelf = function(){
	//creates the inner html based on our settings
	//parameters are all of the values that we're going to manipulate
	//configuration is how those parameters are grouped and displayed as sliders
	var parent = this, members = [], pIndex = 0;
	//add the sliders
	parent.configuration && parent.configuration.forEach(function(thisConfig){
		//build the object
		var thisMember = {className:"sliderWidget",properties:{orientation:thisConfig}};
		if(thisMember.properties.orientation == "pane"){
			thisMember.properties.type = {x:parent.parameters[pIndex],y:parent.parameters[++pIndex]};
			if(parent.knownTypes[thisMember.properties.type.x] != undefined){
				for(var key in parent.knownTypes[thisMember.properties.type.x]){
					thisMember.properties[key+"X"] = parent.knownTypes[thisMember.properties.type.x][key];
				}
			}if(parent.knownTypes[thisMember.properties.type.y] != undefined){
				for(var key in parent.knownTypes[thisMember.properties.type.y]){
					thisMember.properties[key+"Y"] = parent.knownTypes[thisMember.properties.type.y][key];
				}
			}
			//condense to a single string
			thisMember.properties.type = thisMember.properties.type.x+"-"+thisMember.properties.type.y;
		} else {
			thisMember.properties.type = parent.parameters[pIndex];
			if(parent.knownTypes[thisMember.properties.type] != undefined){
				for(var key in parent.knownTypes[thisMember.properties.type]){
					thisMember.properties[key] = parent.knownTypes[thisMember.properties.type][key];
				}
			}
		}
		pIndex++;
		members.push(thisMember);
	});
	//add our outputs
	if(parent.parameters){
		var outputMember = {className:"widget", members:[]};
		switch(this.properties.orientation){
			case "horizontal":
				outputMember.properties = {orientation:"vertical"};
				break;
			case "vertical":
				outputMember.properties = {orientation:"horizontal"};
				break;
		}
		parent.parameters.forEach(function(thisParam){
			var thisOutput = {className:"ioWidget", tag:"input", label:thisParam};
			outputMember.members.push(thisOutput);
		});
		members.push(outputMember);
	}
	parent.members = members;
	parent.initialize();
	Application.initializeClasses(parent.element.children);
	//hook up output to sliders and sliders to output
	pIndex = 0, output = parent.element.children[parent.element.children.length-1], outputs = output.querySelectorAll("input");
	parent.configuration.forEach(function(value, index){
		var thisSlider = parent.element.children[index].data,
		thisOutput = outputs[pIndex].data;
		if(value == "pane"){
			var thisOtherOutput = outputs[++pIndex].data;
			thisSlider.onUpdate = function(){
				thisOutput.value = this.value.x;
				thisOtherOutput.value = this.value.y;
			}
			thisOutput.onUpdate = function(){
				thisSlider.value = {x:this.value, y:thisSlider.value.y};
			}
			thisOtherOutput.onUpdate = function(){
				thisSlider.value = {x:thisSlider.value.x, y:this.value};
			}
			thisSlider.start();
		} else {
			thisSlider.onUpdate = function(){
				thisOutput.value = this.value;
			};
			thisOutput.onUpdate = function(){
				thisSlider.value = this.value;
			};
		}
		pIndex++;
	});
	parent.element.addEventListener("mousedown", parent.onRightClick);
}
multiSliderWidget.prototype.onRightClick = function(event){
	if(event.button != 2){return;}
	event.preventDefault();
	event.stopPropagation();
	this.data.showConfig();
}
multiSliderWidget.prototype.showConfig = function(){
	//things we can edit (about sliders)
	//orientation (overall)
	//invert axis?
	var parent = this, sliders = parent.element.querySelectorAll("[data-class=sliderWidget]");
	var addButton = function(htmlClass, onPress, element){
		var thisButton = document.createElement("button");
		thisButton.classList.add(htmlClass);
		thisButton.addEventListener("click", onPress);
		element.insertBefore(thisButton, element.children[element.children.length]);
	}
	var configOverlay = document.createElement("div");
	configOverlay.classList.add("multiOverlay");
	parent.element.insertBefore(configOverlay, parent.element.children[0]);
	configOverlay.addEventListener("mousedown",function(e){e.stopPropagation();e.preventDefault();parent.configureSelf();return false;});
	this.configuration.forEach(function(value, index){
		//get the associated slider
		thisSlider = sliders[index].data;
		var newElement = document.createElement("div");
		newElement.classList.add("overlay");
		thisSlider.element.insertBefore(newElement, thisSlider.element.children[0]);
		newElement.addEventListener("mousedown",function(e){e.preventDefault();e.stopPropagation();if(e.button == 2){parent.configureSelf();}return false;});
		//build the necessary config buttons for this element
		if(thisSlider.properties.orientation == "pane"){
			addButton("split", function(e){parent.split(index);console.log("pressed split");}, newElement); //split into separate sliders
			addButton("swap", function(e){console.log("pressed swap");}, newElement); // swap axes
		} else {
			if(index>0 && sliders[index-1].data.properties.orientation != "pane"){addButton("comPrev", function(e){parent.combine(index,-1);console.log("pressed combine previous");}, newElement);} //combine prev
			if(index < parent.configuration.length-1 && sliders[index+1].data.properties.orientation != "pane"){addButton("comNext", function(e){parent.combine(index,1);console.log("pressed combine next");}, newElement);}//combine next
		}
		if(index>0){addButton("movePrev", function(e){parent.move(index, -1);}, newElement);} //move prev
		if(index < parent.configuration.length-1){addButton("moveNext", function(e){parent.move(index, 1);}, newElement);}//move next
			});
}
multiSliderWidget.prototype.move = function(index, direction){
	//package everything up into objects
	var totalConfig = [], pIndex = 0, parent = this;
	this.configuration.forEach(function(value, index){
		var thisConfig = {orientation:value};
		if(value=="pane"){thisConfig.type = [parent.parameters[pIndex],parent.parameters[++pIndex]];}else{thisConfig.type = [parent.parameters[pIndex]];}
		totalConfig.push(thisConfig);
		pIndex++;
	});
	//sort the objects
	totalConfig[index] = totalConfig.splice(index+direction, 1, totalConfig[index])[0];
	//unpack them
	var config = [], params = [], pIndex = 0;
	totalConfig.forEach(function(value, index){
		config.push(value.orientation);
		value.type.forEach(function(type){
			params.push(type);
		});
	});
	this.configuration = config;
	this.parameters = params;
	this.configureSelf();
	this.showConfig();
}
multiSliderWidget.prototype.combine = function(index, direction){
	//package everything up into objects
	var totalConfig = [], pIndex = 0, parent = this;
	this.configuration.forEach(function(value, index){
		var thisConfig = {orientation:value};
		if(value=="pane"){thisConfig.type = [parent.parameters[pIndex],parent.parameters[++pIndex]];}else{thisConfig.type = [parent.parameters[pIndex]];}
		totalConfig.push(thisConfig);
		pIndex++;
	});
	//combine the two targets
	totalConfig.splice((direction>0)?index:index+direction,2,{orientation:"pane",type:[totalConfig[index].type[0],totalConfig[index+direction].type[0]]});
	//unpack them
	var config = [], params = [], pIndex = 0;
	totalConfig.forEach(function(value, index){
		config.push(value.orientation);
		value.type.forEach(function(type){
			params.push(type);
		});
	});
	this.configuration = config;
	this.parameters = params;
	this.configureSelf();
	this.showConfig();
}
multiSliderWidget.prototype.split = function(index){
	//package everything up into objects
	var totalConfig = [], pIndex = 0, parent = this;
	this.configuration.forEach(function(value, index){
		var thisConfig = {orientation:value};
		if(value=="pane"){thisConfig.type = [parent.parameters[pIndex],parent.parameters[++pIndex]];}else{thisConfig.type = [parent.parameters[pIndex]];}
		totalConfig.push(thisConfig);
		pIndex++;
	});
	//split the config
	var thisOrientation = (this.properties.orientation == "horizontal")?"vertical":"horizontal";
	this.configuration.splice(index,1, thisOrientation, thisOrientation);
	//rebuild
	this.configureSelf();
	this.showConfig();
}

//rgb widget
function rgbWidget(element) {
	widget.call(this, element);
	this.members = [
		{ className:"ioSliderWidget", name:"red", 
	        properties:{orientation:"horizontal", type:"red", upperLimit:255, output:"int"}},
	    { className:"ioSliderWidget", name:"green", 
	        properties:{orientation:"horizontal",type:"green", upperLimit:255, output:"int" }},
	    { className:"ioSliderWidget", name:"blue", 
	        properties:{orientation:"horizontal",type:"blue", upperLimit:255, output:"int" }},
		{ className:"swatchWidget", name:"swatch" }
	];
	this.color = new PXL();
}
rgbWidget.prototype = new widget();
rgbWidget.prototype.constructor = rgbWidget;
rgbWidget.prototype.initialize = function(){
	widget.prototype.initialize.call(this);
	Object.defineProperty(this, "color", {
	
	});
}
rgbWidget.prototype.postInitialize = function() {
	widget.prototype.postInitialize.call(this);
	var parent = this,
	parentSetColor = function(){parent.setColor.call(parent);};
	this.red.data.onUpdate = parentSetColor;
	this.green.data.onUpdate = parentSetColor;
	this.blue.data.onUpdate = parentSetColor;
}
rgbWidget.prototype.setColor = function() {
	this.color.red = this.color.setValue(this.red.data.value);
	this.color.green = this.color.setValue(this.green.data.value);
	this.color.blue = this.color.setValue(this.blue.data.value);
	var thisColor = "rgb("+this.color.toColor("rgb")+")";
	this.swatch.data.element.style.background = thisColor;
}
rgbWidget.prototype.setValues = function(){
	//drive the sliders from external inputs
}

//hsl widget
//hsv widget
function hsvWidget(element){
	widget.call(this,element);
	this.members = [
		{ className:"ioSliderWidget", name:"satval", properties:{
			orientation:"pane", type:"satval", upperLimit:100, output:"int"}},
		{ className:"ioSliderWidget", name:"hue", properties:{
			orientation:"vertical", type:"hue", upperLimit:360, output:"int"}},
		{ className:"swatchWidget", name:"swatch" }
	];
	this.color = new PXL();
}
hsvWidget.prototype = new widget();
hsvWidget.prototype.constructor = hsvWidget;
hsvWidget.prototype.postInitialize = function(){
	widget.prototype.postInitialize.call(this);
	//hook up specialized behavior
	var parent = this;
	this.hue.data.onUpdate = function(){ parent.setHue();};
	this.satval.data.onUpdate = function(){parent.setColor();};
}
hsvWidget.prototype.setHue = function(){
	var color = this.color.HSVtoRGB(this.hue.data.value,1,1);
	this.satval.data.slider.data.element.style.background = "-webkit-linear-gradient(left, white, rgb("+color[0]+","+color[1]+","+color[2]+")";
	this.setColor();
}
hsvWidget.prototype.setColor = function(){
	var color = this.color.HSVtoRGB(this.hue.data.value,this.satval.data.value.x/100, 1 - (this.satval.data.value.y/100));
	this.swatch.data.element.style.background = "rgb("+color[0]+","+color[1]+","+color[2]+")";
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
