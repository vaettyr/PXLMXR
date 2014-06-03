//main.js
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
//TODO: problem with red/blue wraparound
PXL.prototype.RGBtoHSV = function(r,g,b){
	if(r == undefined){
		r = this.red/255;
		g = this.green/255;
		b = this.blue/255;
	}
	var M = Math.max(r,g,b),
	m = Math.min(r,g,b),
	C = M - m;
	var h = 0;
	if(C>0){
		if(r>=g&&r>=b){
			h = Math.floor(((g-b)/C)*60);
		} else if (g>=r&&g>=b) {
			h = Math.floor((((b-r)/C)+2)*60);
		} else {
			h = Math.floor((((r-g)/C)+4)*60);
		}
	}
	if(h<0){h = 360 + h;}
	var v = M,
	s = (C>0)?C/v:0;
	return [h, s, v];
}
//NOTE: think about dithering and bit depth
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
//TODO: replace
function widget(element) {
	this.element = element;
};
widget.prototype.initialize = function(){
	 var className = this.constructor.name;
	 //load initialization data from html mark-up
	 var htmlAttributes = this.element.attributes;
	 for(var index in htmlAttributes){
		if(htmlAttributes[index].name!=undefined && htmlAttributes[index].name.match(/^data-(?!class)/i)){
			var content = JSON.parse(htmlAttributes[index].value),
			attribute = htmlAttributes[index].name.slice(5);
			if(attribute=="members"){content = JSON.parse(htmlAttributes[index].value);}
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
			//we need to inherit parent properties, but nothing else
			thisMember.properties = (thisMember.properties)?thisMember.properties:{};
			for(var key in this.properties){
				thisMember.properties[key] = (thisMember.properties[key])?thisMember.properties[key]:this.properties[key];
			}
			for(var attribute in thisMember){
				//write members out using JSON
				if(attribute != "tag" && attribute != "className" && attribute != "attributes" && attribute != "settings" && attribute != "members" && thisMember[attribute]){
					html += "data-"+attribute+"='";
					html += JSON.stringify(thisMember[attribute])+"'";
				}
				if(attribute == "members"){
					html += "data-members='";
					html += JSON.stringify(thisMember[attribute])+"'";
				}
			}
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
widget.prototype.onUpdate = function(){
	var parent = this.element.parentNode.data;
	parent && parent.onUpdate && parent.onUpdate.call(parent);
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
//are these necessary?
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

//base abstract class to base widgets that can be configured and have saved settings
//TODO: finish configureSelf base functionality
function configWidget(element){
	widget.call(this, element);
	this.settings = {};
}
configWidget.prototype = new widget();
configWidget.prototype.constructor = configWidget;
configWidget.prototype.initialize = function(){
	//widget.prototype.initialize.call(this);
	// get settings
	var thisSettings = this.getSettings();
	if(thisSettings){
		//load these over-top of any default settings
		for(var setting in thisSettings){
			this.settings[setting] = thisSettings[setting];
		}
	}
	// push settings to properties
	this.loadSettings();
	this.element.setAttribute("data-properties", JSON.stringify(this.properties));
	if(this.properties.style){
		for(var thisStyle in this.properties.style){
			this.element.style[thisStyle] = this.properties.style[thisStyle];
		}
	}
	//this.element.setAttribute("style", this.properties.style);
	widget.prototype.initialize.call(this);
	//spawn members and initialize them
	var parent = this;
	this.element.addEventListener("contextmenu", function(){parent.onContextMenu.call(parent, event);}, true);
}
configWidget.prototype.configureSelf = function() {
	//this is effectively a re-initialization after certain properties and members have been altered
	//add style to this object
	if(this.properties && this.properties.style){
		for(var thisStyle in this.properties.style){
			this.element.style[thisStyle] = this.properties.style[thisStyle];
		}
	}	
}
configWidget.prototype.addIntercept = function(target){
	var parent = this,
	intercept = document.createElement("div");
	intercept.classList.add("intercept");
	target.insertBefore(intercept, target.children[0]);
	intercept.addEventListener("mouseover", this.ignoreMouseEvents);
	intercept.addEventListener("mouseout", this.ignoreMouseEvents);
	intercept.addEventListener("mousemove", this.ignoreMouseEvents);
	return intercept;
}
configWidget.prototype.onContextMenu = function(event){
	event.preventDefault();
	var options = this.getContextOptions(event.target);
	if (options.length > 0){
		var contextmenu = document.createElement("div");
		contextmenu.classList.add("contextmenu");
		//add a display
		if(event.target.data){
			var label = document.createElement("h4"),
			labeltext = (event.target.data.properties.type)?event.target.data.properties.type:event.target.data.constructor.name;
			label.innerHTML = labeltext;
			contextmenu.insertBefore(label, contextmenu.children.length);
		}
		//add the options to the menu
		options.forEach(function(option){
			if(option instanceof Object){
				var thisOption = document.createElement("a");
				thisOption.innerHTML = option.name;
				thisOption.addEventListener("click", option.operator);
				contextmenu.insertBefore(thisOption, contextmenu.children.length);
			} else {
				if(option == "break"){
					var thisBreak = document.createElement("hr");
					contextmenu.insertBefore(thisBreak, contextmenu.children.length);
				} else {
					var thisTitle = document.createElement("h4");
					thisTitle.innerHTML = option;
					contextmenu.insertBefore(thisTitle, contextmenu.children.length);
				}
			}
		});
		//see if this will go off the sides of the display
		contextmenu.style.left = event.clientX+"px";
		contextmenu.style.top = event.clientY+"px";
		document.body.insertBefore(contextmenu, document.body.children[0]);
		//debugger;
		if(event.clientX + contextmenu.offsetWidth > window.innerWidth){contextmenu.style.left = (event.clientX - contextmenu.offsetWidth)+"px";}
		if(event.clientY + contextmenu.offsetHeight > window.innerHeight){contextmenu.style.top = (event.clientY - contextmenu.offsetHeight)+"px";}
		//block standard mouse events while context menu is open
		var intercept = this.addIntercept(document.body);
		parent.closeRef = function(e){parent.closeContextMenu.call(parent, e);};
		document.addEventListener("scroll", parent.closeRef);
		intercept.addEventListener("mousedown", function(e){parent.closeContextMenu.call(parent, e)});
		intercept.addEventListener("mouseup", function(e){parent.closeContextMenu.call(parent, e)});
		intercept.addEventListener("click", function(e){parent.closeContextMenu.call(parent, e)});
		intercept.addEventListener("contextmenu", function(e){parent.closeContextMenu.call(parent, e)});
		intercept.addEventListener("dblclick", function(e){parent.closeContextMenu.call(parent, e)});
	}
	event.stopImmediatePropagation();
}
configWidget.prototype.getContextOptions = function(target){
	// returns an array of objects. Each object has a name and a function
	var options = []
	parent = this;
	// default config widget options should be resize and relocate
	if(this.properties.Resizeable){
		options.push({name:"Resize",operator:function(){target.resize();parent.closeContextMenu(event);}});
	}
	if(this.properties.Relocatable){
		options.push({name:"Relocate",operator:function(){target.relocate();parent.closeContextMenu(event);}});
	}
	return options;
}
configWidget.prototype.ignoreMouseEvents = function(e){
	e.preventDefault();
	e.stopImmediatePropagation();
	return false;
}
configWidget.prototype.closeContextMenu = function(e){
	this.ignoreMouseEvents(e);
	var contextmenu = document.querySelector(".contextmenu"),
	intercept = document.querySelector(".intercept");
	document.body.removeChild(contextmenu);
	document.body.removeChild(intercept);
	document.removeEventListener("scroll", this.closeRef);
}
configWidget.prototype.getSettings = function(){
	var thisConstructor = this.constructor.name,
	thisSettings = window.localStorage.getItem(thisConstructor);
	if(thisSettings && thisSettings != ""){
		return JSON.parse(thisSettings);
	}
	return false;
}
configWidget.prototype.saveSettings = function(){
	var thisConstructor = this.constructor.name,
	thisSettings = this.settings;
	if(thisSettings && thisSettings instanceof Object && Object.keys(thisSettings).length>0){
		window.localStorage.setItem(thisConstructor, JSON.stringify(thisSettings));
		return true;
	}
	return false;
}
configWidget.prototype.loadSettings = function(){
	if(this.settings && this.settings instanceof Object){
		for(var setting in this.settings){
			this.properties[setting] = this.settings[setting];
		}
		return true;
	}
	return false;
}
configWidget.prototype.resize = function(){
	//add the interceptor
	var intercept = this.addIntercept(this.element);
	intercept.addEventListener("mousedown", this.ignoreMouseEvents);
	intercept.addEventListener("mouseup", this.ignoreMouseEvents);
	intercept.addEventListener("click", this.ignoreMouseEvents);
	intercept.addEventListener("contextmenu", this.ignoreMouseEvents);
	intercept.addEventListener("dblclick", this.ignoreMouseEvents);
	//add interceptor killers
	var removeInterceptor = function(){
		var interceptor = document.querySelector(".intercept")
		resizor = document.querySelector(".resize");
		if(interceptor){interceptor.parentNode.removeChild(interceptor);}
		if(resizor){resizor.parentNode.removeChild(resizor);}
		document.removeEventListener("mousedown", arguments.callee);
	};
	document.addEventListener("mousedown", removeInterceptor);
	//add the resize button
	var parent = this;
	resizor = document.createElement("button");
	resizor.innerHTML = "RESIZE";
	resizor.classList.add("resize");
	this.element.insertBefore(resizor, this.element.children[0]);
	resizor.addEventListener("mousedown", function(event){
		var intercept = document.querySelector(".intercept"),
		resizor = document.querySelector(".resize");
		parent.element.removeChild(intercept);
		parent.element.removeChild(resizor);
		parent.startSize = {x:parent.element.offsetWidth, y:parent.element.offsetHeight};
		parent.startMouse = {x:event.clientX, y:event.clientY};
		//add listeners
		document.addEventListener("mousemove", parent.onMouseResizeMove);
		document.addEventListener("mouseup", parent.onMouseResizeUp);
		document.lastClicked = parent;
	});

}
configWidget.prototype.setSize = function(event){
	var newWidth = (document.lastClicked.startSize.x + (event.clientX - document.lastClicked.startMouse.x)) + "px",
	newHeight = (document.lastClicked.startSize.y + (event.clientY - document.lastClicked.startMouse.y)) + "px";
	
	document.lastClicked.element.style["width"] = newWidth;
	document.lastClicked.element.style["min-width"] = newWidth;
	document.lastClicked.element.style["max-width"] = newWidth;
	document.lastClicked.element.style["height"] = newHeight;
	document.lastClicked.element.style["min-height"] = newHeight;
	document.lastClicked.element.style["max-height"] = newHeight;
	document.lastClicked.settings.style = {
		'width':newWidth,
		'min-width':newWidth,
		'max-width':newWidth,
		'height':newHeight,
		'min-height':newHeight,
		'max-height':newHeight
	}
	document.lastClicked.saveSettings();
}
configWidget.prototype.onMouseResizeMove = function(event){
	event.preventDefault();
	document.lastClicked.setSize(event);
}
configWidget.prototype.onMouseResizeUp = function(){
	document.removeEventListener("mousemove", document.lastClicked.onMouseResizeMove);
	document.removeEventListener("mouseup", document.lastClicked.onMouseResizeUp);
}
configWidget.prototype.relocate = function(){
	console.log("relocate");
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
	//set our type to number
	this.element.setAttribute("type", "number");
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
		parent.element.value = Number(value);
	}
	parent.onUpdate && parent.onUpdate.call(this);
}

//TODO: add a 'step' property for color bit depth
//slider Widget
function sliderWidget (element) {
	widget.call(this, element);
	this.properties = {
		orientation: "horizontal",
		lowerLimit:0,
		upperLimit:1,
		invertX:false,
		invertY:false,
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
	y = Math.max(Math.min(upperLimit, val),lowerLimit);
	y = (y - lowerLimit)/upperLimit;
	y = y * (this.element.offsetHeight - this.indicatorRef.offsetHeight);
	this.indicatorRef.style.top = y + "px";
}
sliderWidget.prototype.setSliderPosition = function (pageX, pageY) {
	var limits = this.element.getBoundingClientRect(),
	indicator = this.indicatorRef,
	width = indicator.offsetWidth,
	mousePosX = (pageX - limits.left) - (width/2),
	mousePosY = (pageY - limits.top) - (width/2);
	if(this.properties.invertX){mousePosX = (limits.right - pageX) - (width/2);}
	if(this.properties.invertY){mousePosY = (limits.bottom - pageY) - (width/2);}
	mousePosX = mousePosX - (document.body.scrollLeft * ((this.properties.invertX)?-1:1));
	mousePosX = Math.min(Math.max(mousePosX,0),this.element.offsetWidth-width);
	mousePosY = mousePosY - (document.body.scrollTop * ((this.properties.invertY)?-1:1));
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
sliderWidget.prototype.invertAxis = function(){
	switch(this.properties.orientation){
		case "horizontal":
			this.properties.invertX = !this.properties.invertX;
			break;
		case "vertical":
			this.properties.invertY = !this.properties.invertY;
			break
		default:
			if(arguments[0] && typeof arguments[0] == "string"){
				if(arguments[0].toUpperCase() == "X"){this.properties.invertX = !this.properties.invertX;}
				if(arguments[0].toUpperCase() == "Y"){this.properties.invertY = !this.properties.invertY;}
			} else {
				this.properties.invertX = !this.properties.invertX;
				this.properties.invertY = !this.properties.invertY;
			}
			break;
	}
	if(this.properties.invertX){this.addClass("invertX-true");} else {this.removeClass("invertX-true");}
	if(this.properties.invertY){this.addClass("invertY-true");} else {this.removeClass("invertY-true");}
}

//slider indicator
function sliderIndicator (element) {
	widget.call(this, element);
	this.properties = {	};
};
sliderIndicator.prototype = new widget();
sliderIndicator.prototype.constructor = sliderIndicator;

//ioSlider widget
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

//TODO: rename to colorWidget. Can be inherited from for palette swatches, etc
//color swatch widget
//TODO: add color utilities
function swatchWidget(element) {
	widget.call(this, element);
}
swatchWidget.prototype = new widget();
swatchWidget.prototype.constructor = swatchWidget;

//TODO: move more functionality into configWidget
//TODO: move known types to inherited versions
//TODO: add support for object in/out for value (using parameter names directly)
//TODO: hide/show output/slider?
//TODO: fix values:SET to point to sliders and not outputs
function multiSliderWidget(element) {
	widget.call(this, element);
	this.configOn = false;
	this.properties = {orientation:"horizontal"};
}
multiSliderWidget.prototype = new configWidget();
multiSliderWidget.prototype.constructor = multiSliderWidget;
multiSliderWidget.prototype.initialize = function(){
	configWidget.prototype.initialize.call(this);
	Object.defineProperty(this,"value",{
		get:function(){
			var sliders = this.element.querySelectorAll(".sliderWidget"),
			parent = this,
			values = [];
			for(var thisSlider in sliders){
				if(sliders[thisSlider].data){
					var thisValue = sliders[thisSlider].data.value;
					if(thisValue instanceof Object){
						values.push(thisValue.x);
						values.push(thisValue.y);
					} else {
						values.push(thisValue);
					}
				}
			}
			return values;
		},
		set:function(){
			if(arguments!= undefined){
				var values = arguments;
				if(arguments[0] instanceof Array){
					values = arguments[0];
				}
				var sliders = this.element.querySelectorAll(".sliderWidget")
				index = 0;
				for(var thisSlider in sliders){
					if(sliders[thisSlider].data.properties.orientation == "pane"){
						var thisValue = {
							x:values[index],
							y:values[++index]
						};
					} else {
						sliders[thisSlider].data.value = values[index];
					}
					index++;
				}
			}
		}, 
		enumerable:true,
		configuration:false
	});
}
multiSliderWidget.prototype.postInitialize = function() {
	configWidget.prototype.postInitialize.call(this);
	this.configureSelf();
}
//move these to inherited types
multiSliderWidget.prototype.knownTypes = {
	hue:{upperLimit:360,output:"int"},
	saturation:{upperLimit:100,output:"int"},
	value:{upperLimit:100,output:"int"},
	lightness:{upperLimit:100,output:"int"},
	red:{upperLimit:255,output:"int"},
	green:{upperLimit:255,output:"int"},
	blue:{upperLimit:255,output:"int"}
};
//change this from an array output to a typed object output
multiSliderWidget.prototype.getValues = function(){
	if(this.values == undefined){
		this.values = [], parent = this,
		getLowerLimit = function(type){
			var thisType = parent.knownTypes[type];
			if(thisType != undefined){
				if(thisType.lowerLimit != undefined){return thisTYpe.lowerLimit;}
			}
			return 0;
		};
		this.properties.parameters.forEach(function(param){
			parent.values.push(getLowerLimit(param));
		});
	} else {
		var sliders = this.element.querySelectorAll("[data-class=sliderWidget]"), parent = this;
		if(sliders != null && sliders[0].data != undefined){
			this.values = [];
			for(var index in sliders){
				var slider = sliders[index];
				if(slider.data != undefined){
					if(slider.data.properties.orientation == "pane"){
						var values = slider.data.value;
						parent.values.push(slider.data.value.x);
						parent.values.push(slider.data.value.y);
					} else {
						parent.values.push(slider.data.value);
					}
				}
			}
		}
	}
}
//change this to support array and typed object input
multiSliderWidget.prototype.setValues = function(){
	if(this.values == undefined){this.getValues();}
	var thisOutput = this.element.querySelectorAll("input");
	for(var index in thisOutput){
		if(thisOutput[index].data != undefined){
			thisOutput[index].data.value = this.values[index];
			thisOutput[index].data.onUpdate();
		}
	}
}
//move some functionality to configWidget
multiSliderWidget.prototype.configureSelf = function(){
	//settings are: parameters, configuration, orientation, and axis inversions
	//creates the inner html based on our settings
	this.getSettings();
	this.loadSettings();
	configWidget.prototype.configureSelf.call(this);
	this.getValues();
	var parent = this, members = [], pIndex = 0, upperLimits = [];
	//add the sliders
	parent.properties.configuration && parent.properties.configuration.forEach(function(thisConfig, index){
		//build the object
		//check our type against the parent type and switch if necessary
		if(parent.properties.orientation == thisConfig){thisConfig = (parent.properties.orientation=="horizontal")?"vertical":"horizontal";}
		var thisMember = {className:"sliderWidget",properties:{orientation:thisConfig}};
		if(thisMember.properties.orientation == "pane"){
			thisMember.properties.type = {x:parent.properties.parameters[pIndex],y:parent.properties.parameters[++pIndex]};
			if(parent.knownTypes[thisMember.properties.type.x] != undefined){
				for(var key in parent.knownTypes[thisMember.properties.type.x]){
					thisMember.properties[key+"X"] = parent.knownTypes[thisMember.properties.type.x][key];
					if(key=="upperLimit"){upperLimits.push(thisMember.properties[key+"X"]);}
				}
			}if(parent.knownTypes[thisMember.properties.type.y] != undefined){
				for(var key in parent.knownTypes[thisMember.properties.type.y]){
					thisMember.properties[key+"Y"] = parent.knownTypes[thisMember.properties.type.y][key];
					if(key=="upperLimit"){upperLimits.push(thisMember.properties[key+"Y"]);}
				}
			}
			//condense to a single string
			thisMember.properties.type = thisMember.properties.type.x+"-"+thisMember.properties.type.y;
		} else {
			thisMember.properties.type = parent.properties.parameters[pIndex];
			if(parent.knownTypes[thisMember.properties.type] != undefined){
				for(var key in parent.knownTypes[thisMember.properties.type]){
					thisMember.properties[key] = parent.knownTypes[thisMember.properties.type][key];
					if(key=="upperLimit"){upperLimits.push(thisMember.properties[key]);}
				}
			}
		}
		//store inversions
		if(parent.properties.invertXConfig && parent.properties.invertXConfig[index]) { thisMember.properties.invertX = true;}
		if(parent.properties.invertYConfig && parent.properties.invertYConfig[index]) { thisMember.properties.invertY = true;}
		pIndex++;
		members.push(thisMember);
	});
	//add our outputs
	if(parent.properties.parameters && parent.properties.showOutput){
		var outputMember = {className:"widget", members:[], attributes:{}};
		if(parent.properties.outputFirst){outputMember.attributes.style = "order:0"}
		switch(this.properties.orientation){
			case "horizontal":
				outputMember.properties = {orientation:"vertical"};
				break;
			case "vertical":
				outputMember.properties = {orientation:"horizontal"};
				break;
		}
		parent.properties.parameters.forEach(function(thisParam, index){
			var thisOutput = {className:"ioWidget", tag:"input", label:thisParam, attributes:{type:"number"}, properties:{lowerLimit:0,upperLimit:upperLimits[index]}};
			outputMember.members.push(thisOutput);
		});
		members.push(outputMember);
	}
	parent.members = members;
	widget.prototype.initialize.call(this);
	Application.initializeClasses(parent.element.children);
	//hook up output to sliders and sliders to output
	if(parent.properties && parent.properties.showOutput){
		pIndex = 0, output = parent.element.children[parent.element.children.length-1], outputs = output.querySelectorAll("input");
		parent.properties.configuration.forEach(function(value, index){
			var thisSlider = parent.element.children[index].data,
			thisOutput = outputs[pIndex].data;
			if(value == "pane"){
				var thisOtherOutput = outputs[++pIndex].data;
				thisSlider.onUpdate = function(){
					thisOutput.value = this.value.x;
					thisOtherOutput.value = this.value.y;
					var parent = this.element.parentNode;
					parent && parent.data && parent.data.onUpdate();
				}
				thisOutput.onUpdate = function(){
					thisSlider.value = {x:this.value, y:thisSlider.value.y};
					var parent = this.parentNode;
					parent && parent.data && parent.data.onUpdate();
				}
				thisOtherOutput.onUpdate = function(){
					thisSlider.value = {x:thisSlider.value.x, y:this.value};
					var parent = this.parentNode;
					parent && parent.data && parent.data.onUpdate();
				}
				thisSlider.start();
			} else {
				thisSlider.onUpdate = function(){
					thisOutput.value = this.value;
					var parent = this.element.parentNode;
					parent && parent.data && parent.data.onUpdate();
				};
				thisOutput.onUpdate = function(){
					thisSlider.value = this.value;
					var parent = this.parentNode;
					parent && parent.data && parent.data.onUpdate();
				};
			}
			pIndex++;
		});
	}
	parent.setValues();
}
multiSliderWidget.prototype.getContextOptions = function(target){
	if(target.data == undefined){return [];}
	var options = [],
	index = Array.prototype.indexOf.call(this.element.children, target),
	next = (this.properties.orientation == "horizontal")?"right":"down",
	previous = (this.properties.orientation == "horizontal")?"left":"up",
	parent = this;
	switch(target.data.constructor.name){
		case "sliderWidget":
			if(target.data.properties.orientation == "pane"){
				options.push({name:"Split X & Y axes", operator:function(){parent.split(index); parent.closeContextMenu(event);}});
				options.push({name:"Swap X & Y axes", operator:function(){parent.swap(index); parent.closeContextMenu(event);}});
				options.push({name:"Invert X axis", operator:function(){parent.invert(index, "x"); parent.closeContextMenu(event);}});
				options.push({name:"Invert Y axis", operator:function(){parent.invert(index, "y"); parent.closeContextMenu(event);}});
			} else {
				if(index > 0 && this.element.children[index-1].data && this.element.children[index-1].data.properties.orientation != "pane"){
					options.push({name:"Combine with previous", operator:function(){parent.combine(index, -1); parent.closeContextMenu(event);}});
				}
				if(index < this.properties.configuration.length-1 && this.element.children[index+1].data && this.element.children[index+1].data.properties.orientation != "pane"){
					options.push({name:"Combine with next", operator:function(){parent.combine(index, 1); parent.closeContextMenu(event);}});
				}
				options.push({name: "Invert Axis", operator:function(){parent.invert(index); parent.closeContextMenu(event);}});
			}
			if(options.length>1){options.push("break");}
			if(index > 0) {
				options.push({name: "Move "+previous, operator:function(){parent.move(index, -1); parent.closeContextMenu(event);}});
			}
			if(index < this.properties.configuration.length-1){
				options.push({name: "Move "+next, operator:function(){parent.move(index, 1); parent.closeContextMenu(event);}});
			}
			break;
		case "widget":
			options.push({name:(target.style.order == "")?"Move "+previous:"Move "+next, operator:function(){parent.toggleOrder();parent.closeContextMenu(event);}});
			break;
	}
	options.push("break");
	if(parent.name){options.push(parent.name)};
	options.push({name: "Rotate", operator:function(){parent.rotate(); parent.closeContextMenu(event);}});
	options.push({name: (parent.properties.showOutput)?"Hide Output":"Show Output", operator:function(){parent.toggleOutput();parent.closeContextMenu(event);}});
	//get base options
	options.push("break");
	options = options.concat(configWidget.prototype.getContextOptions.call(parent, parent));
	return options;
}
multiSliderWidget.prototype.configToArray = function(){
	var totalConfig = [], pIndex = 0, parent = this;
	this.settings.configuration.forEach(function(value, index){
		var thisConfig = {orientation:value};
		if(value == "pane") {
			thisConfig.type = [parent.settings.parameters[pIndex], parent.settings.parameters[++pIndex]];
		} else {
			thisConfig.type = [parent.settings.parameters[pIndex]];
		}
		totalConfig.push(thisConfig);
		pIndex++;
	});
	return totalConfig;
}
multiSliderWidget.prototype.arrayToConfig = function(totalConfig){
	var config = [], params = [], pIndex = 0;
	totalConfig.forEach(function(value, index){
		config.push(value.orientation);
		value.type.forEach(function(type){
			params.push(type);
		});
	});
	this.settings.configuration = config;
	this.settings.parameters = params;
}
multiSliderWidget.prototype.move = function(index, direction){
	var totalConfig = this.configToArray();
	totalConfig[index] = totalConfig.splice(index+direction, 1, totalConfig[index])[0];
	this.arrayToConfig(totalConfig);
	this.configureSelf();
	this.saveSettings();
}
multiSliderWidget.prototype.toggleOrder = function(){
	this.settings.outputFirst = !this.settings.outputFirst;
	this.configureSelf();
	this.saveSettings();
}
multiSliderWidget.prototype.combine = function(index, direction){
	var totalConfig = this.configToArray();
	totalConfig.splice((direction>0)?index:index+direction,2,{orientation:"pane",type:[totalConfig[index].type[0],totalConfig[index+direction].type[0]]});
	this.arrayToConfig(totalConfig);
	this.configureSelf();
	this.saveSettings();
}
multiSliderWidget.prototype.split = function(index){
	var thisOrientation = (this.properties.orientation == "horizontal")?"vertical":"horizontal";
	this.settings.configuration.splice(index, 1, thisOrientation, thisOrientation);
	this.configureSelf();
	this.saveSettings();
}
multiSliderWidget.prototype.swap = function(index){
	var totalConfig = this.configToArray();
	totalConfig[index].type = [totalConfig[index].type[1],totalConfig[index].type[0]];
	this.arrayToConfig(totalConfig);
	this.configureSelf();
	this.saveSettings();
}
multiSliderWidget.prototype.invert = function(index, axis){
	this.element.querySelectorAll("[data-class=sliderWidget]")[index].data.invertAxis(axis);
	if(this.settings.invertXConfig == undefined){this.settings.invertXConfig = new Array(this.settings.configuration.length);}
	if(this.settings.invertYConfig == undefined){this.settings.invertYConfig = new Array(this.settings.configuration.length);}
	if(axis == undefined || axis.toUpperCase() != "Y"){this.settings.invertXConfig[index] = !this.settings.invertXConfig[index];}
	if(axis == undefined || axis.toUpperCase() != "X"){this.settings.invertYConfig[index] = !this.settings.invertYConfig[index];}
	this.saveSettings();
}
multiSliderWidget.prototype.rotate = function(){
	var parent = this, flipSlider = function(){
		parent.settings.configuration.forEach(function(orientation, index){
			if(orientation == "horizontal"){
				parent.settings.configuration[index] = "vertical";
			} else if(orientation == "vertical"){
				parent.settings.configuration[index] = "horizontal";
			}
		});
	};
	if(this.settings.orientation == "vertical"){
		this.settings.orientation = "horizontal";
		flipSlider();
	} else {
		this.settings.orientation = "vertical";
		flipSlider();
	}
	this.configureSelf();
	this.saveSettings();
}
multiSliderWidget.prototype.toggleOutput = function(){
	this.settings.showOutput = !this.settings.showOutput;
	this.configureSelf();
	this.saveSettings();
}

//some saved configurations of a multiSliderWidget
function rgbWidget(element){
	multiSliderWidget.call(this, element);
	this.settings = {
		parameters:["red", "green", "blue"],
		configuration:["horizontal", "horizontal", "horizontal"],
		orientation:"vertical"
	}
	//this.properties.color = new PXL();
	this.properties.Resizeable = true;
}
rgbWidget.prototype = new multiSliderWidget();
rgbWidget.prototype.constructor = rgbWidget;
rgbWidget.prototype.initialize = function(){
	multiSliderWidget.prototype.initialize.call(this);
	this.properties.color = new PXL();
}
rgbWidget.prototype.onUpdate = function(){
	this.properties.color.red = this.value[this.properties.parameters.indexOf("red")];
	this.properties.color.green = this.value[this.properties.parameters.indexOf("green")];
	this.properties.color.blue = this.value[this.properties.parameters.indexOf("blue")];
	multiSliderWidget.prototype.onUpdate.call(this);
}

function hsvWidget(element){
	multiSliderWidget.call(this, element);
	this.settings = {
		parameters:["hue", "saturation", "value"],
		configuration:["vertical", "pane"]
	}
	//this.properties.color = new PXL();
	this.properties.Resizeable = true;
}
hsvWidget.prototype = new multiSliderWidget();
hsvWidget.prototype.constructor = hsvWidget;
hsvWidget.prototype.initialize = function(){
	multiSliderWidget.prototype.initialize.call(this);
	this.properties.color = new PXL();
}
hsvWidget.prototype.setBackground = function(){
	var satSlider = this.element.querySelector(".type-saturation");
	if(satSlider != null){
		var hue = this.value[this.properties.parameters.indexOf("hue")];
		hue = this.properties.color.HSVtoRGB(hue, 1, 1);
		satSlider.style.background = "rgb("+hue[0]+","+hue[1]+","+hue[2]+")";
	}
	var valSlider = this.element.querySelector(".type-value");
	if(valSlider != null){
		var hue = this.value[this.properties.parameters.indexOf("hue")];
		var sat = this.value[this.properties.parameters.indexOf("saturation")];
		hue = this.properties.color.HSVtoRGB(hue, sat/100, 1);
		valSlider.style.background = "rgb("+hue[0]+","+hue[1]+","+hue[2]+")";
	}
	var satvalSlider = this.element.querySelector(".type-saturation-value, .type-value-saturation");
	if(satvalSlider != null){
		var hue = this.value[this.properties.parameters.indexOf("hue")];
		hue = this.properties.color.HSVtoRGB(hue, 1, 1);
		satvalSlider.style.background = "rgb("+hue[0]+","+hue[1]+","+hue[2]+")";
	}
}
hsvWidget.prototype.onUpdate = function(){
	this.setBackground();
	var RGB = this.properties.color.HSVtoRGB(this.value[this.properties.parameters.indexOf("hue")],
		this.value[this.properties.parameters.indexOf("saturation")]/100, 
		(100-this.value[this.properties.parameters.indexOf("value")])/100);
	this.properties.color.red = RGB[0];
	this.properties.color.green = RGB[1];
	this.properties.color.blue = RGB[2];
	multiSliderWidget.prototype.onUpdate.call(this);
}

function hslWidget(element){
	multiSliderWidget.call(this, element);
	this.settings = {
		parameters:["hue", "saturation", "lightness"],
		configuration:["pane", "vertical"]
	};
	this.properties.Resizeable = true;
}
hslWidget.prototype = new multiSliderWidget();
hslWidget.prototype.constructor = hslWidget;
hslWidget.prototype.initialize = function(){
	multiSliderWidget.prototype.initialize.call(this);
	this.properties.color = new PXL();
}
hslWidget.prototype.onUpdate = function(){
	var satSlider = this.element.querySelector(".type-saturation");
	if(satSlider != null){
		var hue = this.value[this.properties.parameters.indexOf("hue")];
		hue = this.properties.color.HSVtoRGB(hue, 1, 1);
		satSlider.style.background = "rgb("+hue[0]+","+hue[1]+","+hue[2]+")";
	}
	var lightSlider = this.element.querySelector(".type-lightness");
	if(lightSlider != null){
		var hue = this.value[this.properties.parameters.indexOf("hue")];
		var sat = this.value[this.properties.parameters.indexOf("saturation")];
		hue = this.properties.color.HSVtoRGB(hue, sat/100, 0.5);
		lightSlider.style.background = "rgb("+hue[0]+","+hue[1]+","+hue[2]+")";
	}
	var satlightSlider = this.element.querySelector(".type-lightness-saturation, .type-saturation-lightness");
	if(satlightSlider != null){
		var hue = this.value[this.properties.parameters.indexOf("hue")];
		hue = this.properties.color.HSVtoRGB(hue, 1, 1);
		satlightSlider.style.background = "rgb("+hue[0]+","+hue[1]+","+hue[2]+")";
	}
	multiSliderWidget.prototype.onUpdate.call(this);
}

//color picker
function colorPickerWidget (element) {
	configWidget.call(this, element);
	this.members = [
	    { className:"hsvWidget", name:"hsv"},
	    { className:"rgbWidget", name:"rgb"},
		{ className:"swatchWidget", name:"color"}
	    ];
	this.properties = {
		orientation:"horizontal",
		Resizeable: true,
		Relocatable: true,
		parameters:[]
	};
}
colorPickerWidget.prototype = new configWidget();
colorPickerWidget.prototype.constructor = colorPickerWidget;
colorPickerWidget.prototype.getContextOptions = function(target){
	//get the config widget we're pointed at
	var thisConfigWidget = target,
	options = [];
	//put in an escape here
	while(!(thisConfigWidget.data instanceof configWidget)){
		if(thisConfigWidget.parentNode){
			thisConfigWidget = thisConfigWidget.parentNode;
		} else {
			thisConfigWidget = undefined;
			break;
		}
	}
	if(thisConfigWidget && !(thisConfigWidget.data instanceof colorPickerWidget)){
		options = thisConfigWidget.data.getContextOptions(target);
	}
	options.push("break");
	options.push("Color Picker");
	options = options.concat(configWidget.prototype.getContextOptions.call(this, this));
	var parent = this;
	options.push({name:"Rotate",operator:function(e){
		//debugger;
		parent.settings.orientation = (parent.properties.orientation == "vertical")?"horizontal":"vertical";
		//swap width and height
		var newWidth = parent.settings.style.height, newHeight = parent.settings.style.width;
		parent.settings.style = {
			'width':newWidth,
			'min-width':newWidth,
			'max-width':newWidth,
			'height':newHeight,
			'min-height':newHeight,
			'max-height':newHeight
		};
		for(var thisStyle in parent.settings.style){
			parent.element.style[thisStyle] = parent.settings.style[thisStyle];
		}
		parent.configureSelf();
		parent.saveSettings();
		parent.closeContextMenu(e);
	}});
	return options;
}
colorPickerWidget.prototype.configureSelf = function(){
	//get our settings and set our classes appropriately
	this.getSettings();
	this.loadSettings();
	widget.prototype.initialize.call(this);
	Application.initializeClasses(parent.element.children);
}
colorPickerWidget.prototype.initialize = function(){
	configWidget.prototype.initialize.call(this);
}
colorPickerWidget.prototype.onUpdate = function(){
	//debugger;
	//use document.lastClicked to find out which one was updated
	var newColor = document.lastClicked.parentNode.data.properties.color;
	this.color.style.background = "rgb("+newColor.red+","+newColor.green+","+newColor.blue+")";
	if(document.lastClicked.parentNode.data instanceof hsvWidget){
		this.rgb.data.value = [newColor.red, newColor.green, newColor.blue];
		//debugger;
	}
	if(document.lastClicked.parentNode.data instanceof rgbWidget){
		var hsv = newColor.RGBtoHSV();
		this.hsv.data.value = [hsv[0],hsv[1]*100,100 - (hsv[2]*100)];
		this.hsv.data.setBackground();
	}
	//debugger;
	//console.log("blah");
}