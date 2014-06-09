//color widgets

//TODO: move known types to inherited versions
//TODO: update slider indicator positions on configure self
function multiSliderWidget(element) {
	widget.call(this, element);
	this.configOn = false;
	this.properties = {orientation:"horizontal"};
}
multiSliderWidget.prototype = new configWidget();
multiSliderWidget.prototype.constructor = multiSliderWidget;
multiSliderWidget.prototype.initialize = function(){
	configWidget.prototype.initialize.call(this);
	if(!('value' in this)){
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
						if(sliders[thisSlider].data){
							if(sliders[thisSlider].data.properties.orientation == "pane"){
								var thisValue = {
									x:values[index],
									y:values[++index]
								};
								sliders[thisSlider].data.value = thisValue;
							} else {
								sliders[thisSlider].data.value = values[index];
							}
							index++;
						}
					}
				}
			}, 
			enumerable:true,
			configuration:false
		});
	}
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
		if(sliders.length > 0 && sliders[0].data != undefined){
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
//move some functionality to configWidget (?)
multiSliderWidget.prototype.configureSelf = function(){
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
	var options = [],
	index = Array.prototype.indexOf.call(this.element.children, target.element),
	next = (this.properties.orientation == "horizontal")?"right":"down",
	previous = (this.properties.orientation == "horizontal")?"left":"up",
	parent = this;
	switch(target.constructor.name){
		case "sliderWidget":
			if(target.properties.orientation == "pane"){
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
		case "ioWidget":
			options.push({name:(target.element.parentNode.style.order == "")?"Move "+previous:"Move "+next, operator:function(){parent.toggleOrder();parent.closeContextMenu(event);}});
			break;
		case "widget":
			options.push({name:(target.element.style.order == "")?"Move "+previous:"Move "+next, operator:function(){parent.toggleOrder();parent.closeContextMenu(event);}});
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

//TODO: rename to colorWidget. Can be inherited from for palette swatches, etc
//color swatch widget
//TODO: add color utilities
function swatchWidget(element) {
	configWidget.call(this, element);
	this.configOn = false;//?
	this.properties = {
		Resizeable:true
	};
}
swatchWidget.prototype = new configWidget();
swatchWidget.prototype.constructor = swatchWidget;
swatchWidget.prototype.initialize = function(){
	configWidget.prototype.initialize.call(this);
	this.properties.color = new PXL();
}
swatchWidget.prototype.configureSelf = function(){
	configWidget.prototype.configureSelf.call(this);
	
}


//some saved configurations of a multiSliderWidget
//update the numbers as sliders are manipulated from outside the widget
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
		configuration:["vertical", "pane"],
		showOutput:true,
		invertYConfig:[false, true]
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
		(this.value[this.properties.parameters.indexOf("value")])/100);
	this.properties.color.red = RGB[0];
	this.properties.color.green = RGB[1];
	this.properties.color.blue = RGB[2];
	multiSliderWidget.prototype.onUpdate.call(this);
}
hsvWidget.prototype.configureSelf = function(){
	multiSliderWidget.prototype.configureSelf.call(this);
	this.setBackground();
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
	this.members = [{ className:"hsvWidget", name:"hsv"}];
	this.settings = {parameters:[{className:"hsvWidget",name:"hsv"}],swatchFirst:true};
	this.properties = {
		orientation:"horizontal",
		Resizeable: true,
		Relocatable: true,
		parameters:[{className:"hsvWidget",name:"hsv"}]
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
		options = thisConfigWidget.data.getContextOptions(target.data);
	}
	//get a list of all currently visible widgets
	var activeWidgets = [];
	this.properties.parameters.forEach(function(thisParameter){
		activeWidgets.push(thisParameter.className);
	});
	if(activeWidgets.indexOf(thisConfigWidget.data.constructor.name)>=0){
		var index = activeWidgets.indexOf(thisConfigWidget.data.constructor.name);
		options.push({name:"Remove "+thisConfigWidget.data.constructor.name, operator:function(e){
			parent.settings.parameters.splice(index,1);
			parent.configureSelf();
			parent.saveSettings();
			parent.closeContextMenu(e);
		}});
		//move previous
		if(index > 0){
			options.push({name:"Move left", operator: function(e){
				parent.settings.parameters[index] = parent.settings.parameters.splice(index-1, 1, parent.settings.parameters[index])[0];
				parent.configureSelf();
				parent.saveSettings();
				parent.closeContextMenu(e);
			}});
		}
		//move right
		if(index < this.properties.parameters.length-1){
			options.push({name:"Move right", operator: function(e){
				parent.settings.parameters[index] = parent.settings.parameters.splice(index+1, 1, parent.settings.parameters[index])[0];
				parent.configureSelf();
				parent.saveSettings();
				parent.closeContextMenu(e);
			}});
		}
	};
	//swatch widget options
	if(target.data instanceof swatchWidget){
		if(!this.properties.swatchFirst){
			options.push({
				name:"Move Left",
				operator:function(e){
					parent.settings.swatchFirst = true;
					parent.configureSelf();
					parent.saveSettings();
					parent.closeContextMenu(e);
				}
			});
		} else {
			options.push({
				name:"Move Right",
				operator:function(e){
					parent.settings.swatchFirst = false;
					parent.configureSelf();
					parent.saveSettings();
					parent.closeContextMenu(e);
				}
			});
		}
	}
	options.push("break");
	options.push("Color Picker");
	options = options.concat(configWidget.prototype.getContextOptions.call(this, this));
	var parent = this;
	options.push({name:"Rotate",operator:function(e){
		parent.getValues();
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
		parent.configureSelf();
		parent.saveSettings();
		parent.closeContextMenu(e);
	}});
	options.push("break");
	//get a list of all currently visible widgets
	if(activeWidgets.indexOf("rgbWidget")<0){
		options.push({name:"Show RGB", operator:function(e){
			parent.settings.parameters.push({className:"rgbWidget", name:"rgb"});
			parent.configureSelf();
			parent.saveSettings();
			parent.closeContextMenu(e);
			}
		});
	}
	if(activeWidgets.indexOf("hsvWidget")<0){
		options.push({name:"Show HSV", operator:function(e){
			parent.settings.parameters.push({className:"hsvWidget", name:"hsv"});
			parent.configureSelf();
			parent.saveSettings();
			parent.closeContextMenu(e);
			}
		});
	}
	if(activeWidgets.indexOf("hslWidget")<0){
		options.push({name:"Show HSL", operator:function(e){
			parent.settings.parameters.push({className:"hslWidget", name:"hsl"});
			parent.configureSelf();
			parent.saveSettings();
			parent.closeContextMenu(e);
			}
		});
	}
	return options;
}
colorPickerWidget.prototype.getValues = function(){
	var values = {}, parent = this;
	for(var thisParam in this.properties.parameters){
		var child = parent.properties.parameters[thisParam].name,
		value = parent[child].data.value;
		values[child] = value;
	}
	this.values = values;
}
colorPickerWidget.prototype.configureSelf = function(){
	//get our settings and set our classes appropriately
	this.getSettings();
	this.loadSettings();
	configWidget.prototype.configureSelf.call(this);
	var members = [],
	parent = this;
	//spawn our members accordingly
	this.properties.parameters.forEach(function(thisParameter){
		if(parent.values && parent.values[thisParameter.name]){
			thisParameter.values = parent.values[thisParameter.name];
		}
		members.push(thisParameter);
	});
	if(!this.properties.swatchFirst){
		members.push({className:"swatchWidget", name:"color"});
	} else {
		members.unshift({className:"swatchWidget", name:"color"});
	}
	this.members = members;
	widget.prototype.initialize.call(this);
	Application.initializeClasses(parent.element.children);
	this.setSwatchColor();
}
colorPickerWidget.prototype.initialize = function(){
	configWidget.prototype.initialize.call(this);
	this.properties.color = new PXL();
	this.configureSelf();
}
colorPickerWidget.prototype.onUpdate = function(){
	var newColor = document.lastClicked.parentNode.data.properties.color;
	this.properties.color = newColor;
	//this.color.style.background = "rgb("+newColor.red+","+newColor.green+","+newColor.blue+")";
	/*
	if(document.lastClicked.parentNode.data instanceof hsvWidget){
		this.rgb.data.value = [newColor.red, newColor.green, newColor.blue];
	}
	if(document.lastClicked.parentNode.data instanceof rgbWidget){
		var hsv = newColor.RGBtoHSV();
		this.hsv.data.value = [hsv[0],hsv[1]*100,100 - (hsv[2]*100)];
		this.hsv.data.setBackground();
	}
	*/
	this.setSwatchColor();
}
colorPickerWidget.prototype.setSwatchColor = function(){
	this.color.style.background = this.properties.color.toColor("rgb");
}