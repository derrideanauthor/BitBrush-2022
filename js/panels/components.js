
var Component = function(type, id){

	//"Constructor"//
	this.type = type;
	this.DOM = document.createElement('div');
	//reference to the main panel all other sub components are appended to
	this.panel;
	//special interactive elements in components
	this.gizmo = {};
	//buttons in component
	this.button = {};
	//object for appended span with text title
	this.title = {};
	//add multiple text spans
	this.text = [];
	//focus - name of current active gizmo
	this.focus = 'none';
	this.focusId;

	//main panel
	if (type == 'panel'){
		let comp = this.DOM;
		this.panel = this;
		comp.id = id;
		return;
	}

	//toggle-able panel areas, aka tabs, can be toggled with button tabs
	if (type == 'subPanel'){
		let comp = this.DOM;
		comp.id = id;
		comp.className = 'sub-panel';
		return;
	}

	//box for any content, standard padding .content
	if (type == 'contentBox'){
		let comp = this.DOM;
		comp.id = id || '';
		comp.className = 'content';
		return;
	}

	//simple frame for ui gizmos/swatches
	if (type == 'frame'){
		let comp = this.DOM;
		comp.className = 'frame';
		return;
	}

	//simple div box with ID
	if (type == 'idBox'){
		let comp = this.DOM;
		comp.id = id;
		return;
	}

	//simple div box with class only
	if (type == 'classBox'){
		let comp = this.DOM;
		comp.className= id;
		return;
	}

	//titlebar in line with menu buttons
	if (type == 'titleBar'){
		let comp = this.DOM;
		comp.className = 'title-bar main';
		return;
	}

	//titlebar above a panel content area
	if (type == 'titleBarThin'){
		let comp = this.DOM;
		comp.className = 'title-bar thin';
		return;
	}

	//titlebar above content modules - acts as heading
	if (type == 'titleBarHeading'){
		let comp = this.DOM;
		comp.className = 'title-bar heading';
		return;
	}

	//titlebar non specific
	if (type == 'titleBarBare'){
		let comp = this.DOM;
		comp.className = 'title-bar bare';
		return;
	}

	//top menu for a whole panel
	if (type == 'topMenu'){
		let comp = this.DOM;
		comp.className = 'top';
		comp.setAttribute('data-height','1');
		return;
	}

	//Bottom menu for sub panels
	if (type == 'bottomMenu'){
		let comp = this.DOM;
		comp.className = 'bottom';
		return;
	}

	//Side menu for sub panels
	if (type == 'sideMenu'){
		let comp = this.DOM;
		comp.className = 'side';
		comp.setAttribute('data-height','2');
		return;
	}

	//pop out tab menu for sub panels
	if (type == 'drawer'){
		let comp = this.DOM;
		comp.className = 'drawer';
		comp.id = id;
		return;
	}

	//clickable card elements, use addAction
	if (type == 'card'){
		let comp = this.DOM;
		comp.className = 'card';
		comp.setAttribute('data-card', id);
		return;
	}

	//temporary user communications - parent should be raltive
	if (type == 'popMsg'){
		let comp = this.DOM;
		comp.className = 'pop-msg';
		this.msg = [];
		return;
	}

	//Splash Screen // popup menu
	if (type == 'splashPanel'){
		this.panel = this;
		let comp = this.DOM;
		comp.className = 'splash-menu';
		return;
	}



}

//Drawer : offset
Component.prototype.offsetPosition = function (obj){
	this.DOM.style.position = 'absolute';
	this.DOM.parentNode.style.position = 'relative';

	for (let k in obj){
		this.DOM.style[k] = obj[k];
	}
}

//Splash Screen

Component.prototype.createWindow = function (id, notClosable, callback){
	
	
	let callbackFn,
		splash = this.DOM;

	if (!callback) callbackFn = function(){};
	else callbackFn = callback;

	let box = document.createElement('div');
	box.setAttribute('data-menu', id);
	box.className = 'window';
	box.setAttribute('data-height', '3');

	splash.appendChild(box);

	//setup an exit
	if (!notClosable)
	splash.addEventListener(pointerEvent['click'], function(e){
		if (e.target == splash){
			splash.removeAttribute('data-active');
			callbackFn();
		}
	}, false);

	this.DOM = box;

	return this;
}

Component.prototype.showWindow = function (){
	this.DOM.parentNode.setAttribute('data-active', '');
}
Component.prototype.hideWindow = function (){
	this.DOM.parentNode.removeAttribute('data-active');
}


//Popup message: new message

Component.prototype.newMsg = function (msg, delay, unAdd){
	
	//return if muted
	if (this.MsgMuted()) return;


	let fadeTime = 200,
		time = delay || 1000,
		msgBox = this.DOM, //document.getElementById(parentId),
		newMsg = document.createElement('div');

	
	newMsg.className = 'new-msg';
	newMsg.style.animationDelay = time+'ms';
	newMsg.style.animationDuration = fadeTime+'ms';
	newMsg.innerHTML = msg;
	if (typeof unAdd == 'undefined' || !unAdd) {
		msgBox.appendChild(newMsg);
	}

	let timer = window.setTimeout(expire, time+fadeTime);
	function expire(){
		if (newMsg.parentNode == msgBox)
		msgBox.removeChild(newMsg);
		//this.msg.splice(index, 1);
	}	

	//return this.msg[index];
	return newMsg;
}

Component.prototype.updateMsg = function (id, msg, delay){

	//return if muted
	if (this.MsgMuted(id)) return;

	let prefix = 'pop-msg-';

	let msgs = document.getElementsByClassName('new-msg'),	
		found = false;

	//search if msg exists (by id)
	for (let i = 0; i < msgs.length; i++){
		if (msgs[i].id == prefix+id){
			let newMsg = this.newMsg(msg, delay, true);/**/
			newMsg.id = prefix+id;

			this.DOM.replaceChild(newMsg, msgs[i]);
			found = true;
			break;
		}
	}

	if (!found){
		let newMsg = this.newMsg(msg, delay);
		newMsg.id = prefix+id;
	}
}

Component.prototype.muteMsg = function (times, id){
	//mutes msg for a number of times, -1 || true = permanently / 0 || false = unmute
	//id: specific message only -- optional

	if (typeof times == 'boolean') {
		if (times == true) 
			times = -1;
		else
			times = 0;
	}

	this.mute = times;
	this.muteId = id || '';
}

//private
Component.prototype.MsgMuted = function (id){

	//check if applied on id
	if (id){
		if (id != this.muteId && this.muteId != '') {
			return false;
		}
	}

	//not done
	if (this.mute > 0){
		this.mute--;
		return true;
	} 

	if (this.mute == -1) 
		return true;

	//done
	if (this.mute == 0){
		this.muteId = '';
		return false;
	}
}

//Panels: Simple headings, text segments and titlebar titles

Component.prototype.addHeading = function (headingText, imageURL, sub){
	let hType = sub ? 'h2' : 'h1';

	let head = document.createElement(hType);

	if (imageURL){
		let logo = document.createElement('img');
		logo.onload = function(){
		}
		logo.src = imageURL;
		head.appendChild(logo);
	}
	
	let text = document.createElement('span');

	text.innerHTML = headingText;
	head.appendChild(text);
	

	this.DOM.appendChild(head);
}

//Simple text in a span
Component.prototype.addText = function (text, className){
	//className optional
	className = className || '';
	this.text.push(document.createElement('span'));

	let i = this.text.length-1;

	this.text[i].className = 'text '+className;
	this.text[i].innerHTML = text;
	this.DOM.appendChild(this.text[i]);
}
Component.prototype.updateText = function (text, index){
	if (!index) index = 0;
	if (this.text.length == 0) this.addText(text);

	this.text[index].innerHTML = text;
}

//Extendable title span
Component.prototype.addTitle = function (titleText){
		this.title = [];

		this.title.push({
			DOM : document.createElement('span'),
			editable : makeEditable,
			editing : false,
			text : titleText,
			update : updateText
		});

		let i = this.title.length-1,
			titleSpan = this.title[i].DOM;

		titleSpan.className = 'title';
		//titleSpan.setAttribute('data-title', i);

		updateText(titleText)
		function updateText(txt){
			titleSpan.innerHTML = txt;	
		}
		
		this.DOM.appendChild(titleSpan);

		
		function makeEditable(dataObj, key){

			this.DOM.contentEditable = true;
			this.DOM.addEventListener(pointerEvent['click'], selectTitleText.bind(this), false);

			function selectTitleText(e){
				let title = e.currentTarget;
				if (!this.editing){
					selectElementText(title);
					this.editing = true;
				}else{
					clearSelections();
				}
			}

			this.DOM.addEventListener('keypress', updateTitle.bind(this), false);
			this.DOM.addEventListener('blur', updateTitle.bind(this), false);
			
			function updateTitle(e){
				let title = e.currentTarget,
					//titleIndex = title.getAttribute('data-title'),
					prevText = this.text;
				
				let newText = title.innerHTML;
				if (newText != prevText){					
					dataObj[key] = newText;
					this.text = newText;
				}

				if (e.type == 'keypress'){
					if (!(event.which == 13 || event.keyCode == 13)) return true;
					else e.preventDefault();
				}

				title.blur(); 
				clearSelections();
				this.editing = false;
			}
		}

		return this.title[i];
}

Component.prototype.updateTitle = function (txt, titleIndex){
	let i = titleIndex || 0;

	this.title[i].text = txt;
	this.title[i].DOM.innerHTML = txt;
}

Component.prototype.setHeight = function (height){	
	if (height == 0) this.DOM.removeAttribute('data-height');
	else
	this.DOM.setAttribute('data-height', height);
}

Component.prototype.appendTo = function(parentSelector){
	let parent;

	if (typeof parentSelector == 'string'){
		//mostly for appending main panels
		parent = document.querySelector(parentSelector);
	}else{
		//pass obj for all sub panels and components of a panel
		parent = parentSelector.DOM;	
		//ref to main panel obj as parent
		this.panel = parentSelector.panel;
	}

	//if (this.type == 'drawer') parent.style.position = 'relative';

	parent.appendChild(this.DOM);

	//inherit height
	if (parent.dataset.height && !this.DOM.dataset.height 
		&& !this.DOM.className.includes('frame')
		&& !this.DOM.className.includes('content'))
	this.setHeight(parent.getAttribute('data-height') || '3');
}

Component.prototype.append = function(child){
	this.DOM.appendChild(child);
}

Component.prototype.addGizmo = function (type, title, value, label, callback, parent){
	
	var callbackFn = callback || function (){};
	//optional range : { min, max, 'prefix'}
	//optional callback (function) = once gizmo action is triggered, gizmo's value passed as param
	//parent (DOM element) = for rare cases like the RGB slider below where a gizmo, adds a gizmo to itself and not component

	this.panel.gizmo[title] = {
		valueDOM : {}, //html element containing a readable value
		type : type,
		name : title,
		value : value || 0,
		prevValue : value || 0,
		defaultValue : value || 0,
		snapValue: value,
		callback : callbackFn,
		range : [],
		symbol : '',
		symbolPos : 'back',
		setFormat : setFormat,
		format : 'number',
		editing : false,
		pair : {
			set : pairWith,
			toggle : pairToggle,
			addUI : pairUI,
			active : false,
			gizmo : {},
			ratio : 1,
			bounds : [0,0],
			type : 'aspect', 
			callback : function (){}
		},
		drag : {
			direction : 'x',
			maxDist : 200,
			setDirection : setDragDirection,
			setControl : setControl,
			controlSet : false,
			disabled : false //to halt dragging in inopportune moments
		},
		orderItems : orderItems //only for itemdrag
	}

	//reference to gizmo from this component
	this.gizmo[title] = this.panel.gizmo[title];
	//internal gizmo reference for functions
	var thisGizmo = this.gizmo[title];

	var gizmo = this.panel.gizmo[title].DOM,
		parentDOM = parent || this.DOM;

	//to drag a panel's location by draging a part of it
	if (type == 'panelDrag'){
		let px = parentDOM.style.left,
			py = parentDOM.style.top;

		//html button - place in top menu bar - will stretch to remaining space
		gizmo = document.createElement('button');
		gizmo.id = title;//reference
		gizmo.setAttribute('data-gizmo','panel-drag');
		this.DOM.appendChild(gizmo);
		//button icon
		let icon = document.createElement('span');
		icon.className = 'mdi mdi-drag-vertical';
		icon.style.pointerEvents = 'none';
		gizmo.appendChild(icon);
		if (value) {
			let label = document.createElement('span');
			label.className = 'label';
			label.innerHTML = value;
			label.style.pointerEvents = 'none';
			gizmo.appendChild(label);
		}

		let panel = this.panel.DOM,
			parent = this.panel.DOM.parentNode,
			rect = panel.getBoundingClientRect(),
			parentRect = parent.parentNode.getBoundingClientRect();

		thisGizmo.value = [rect.left-parentRect.left, rect.top-parentRect.top];

		//from the gizmo listener
		thisGizmo.dynamicUpdate = dynamicUpdate.bind(this);
		function dynamicUpdate(val){	
			//set value in constraints
			thisGizmo.range = [
			(parent.offsetWidth - panel.offsetWidth), 
			(parent.offsetHeight - this.DOM.offsetHeight)
			];
			for (let i = 0; i < val.length; i++){
				if (val[i] < 0) val[i] = 0;
				else
				if (val[i] > thisGizmo.range[i]) val[i] = thisGizmo.range[i];
			}

			thisGizmo.value = val;	
			panel.style.left = val[0]+'px';	
			panel.style.top = val[1]+'px';	

			updatePair();//update paired gizmo
			callbackFn(val);	
			thisGizmo.prevValue = val;
		}
	}
	function setControl(component){
		//control component idea (instead of gizmo's dom another dom - might not be useful)
	}

	//experimental gizmo
	//no physical gizmo, instead each item can be dragged to reorder them using css order (flexbox)
	//start drag - replace with dummy item with same order. move item position to absolute
	//follow item on cursor within frame, cancel when out

	if (type == 'itemDrag'){
		//convert current items to ordered items
		
		parentDOM.setAttribute('data-gizmo', 'item-parent');

		//dummy item
		let dummy = document.createElement('div');
		dummy.setAttribute('data-gizmo', 'item-dummy');
		parentDOM.appendChild(dummy);

		//from the gizmo listener
		thisGizmo.dynamicUpdate = dynamicUpdate.bind(this);
		function dynamicUpdate(val){	
			//set value in constraints
			thisGizmo.range = [
			(parent.offsetWidth - panel.offsetWidth), 
			(parent.offsetHeight - this.DOM.offsetHeight)
			];
			for (let i = 0; i < val.length; i++){
				if (val[i] < 0) val[i] = 0;
				else
				if (val[i] > thisGizmo.range[i]) val[i] = thisGizmo.range[i];
			}

			thisGizmo.value = val;	
			panel.style.left = val[0]+'px';	
			panel.style.top = val[1]+'px';	

			updatePair();//update paired gizmo
			callbackFn(val);	
			thisGizmo.prevValue = val;
		}

	}
	//Order items (itemDrag)
	function orderItems(){
		let items = parentDOM.children;

		for (let i = 0; i < items.length; i++){
			//place any button (or exception) last
			if (items[i].getAttribute('data-func')){
				items[i].style.order = 9999;
			}
			else{
				items[i].style.order = i;
				items[i].setAttribute('data-gizmo', 'item');

			}
		}
	}

	

	if (type == 'numberDrag'){	

		let frame = document.createElement('label');
		parentDOM.appendChild(frame);

		//Suffix can be added using frontText$backText 
		let $Text = '',
			labelText = label;

		if (label){
			let $Pos = label.indexOf('$');
			if ($Pos > -1){
				$Text = label.slice($Pos+1);
				labelText = label.slice(0, $Pos);
			}
			//prefix in front of input box
			let pref = document.createElement('span');
			pref.innerHTML = labelText;
			pref.className = "prefix"
			frame.appendChild(pref);
		}

		gizmo = document.createElement('input');
		gizmo.value = value;
		gizmo.className = 'xcursor';//default	
		thisGizmo.valueDOM = gizmo;

		//formats and saves value
		thisGizmo.format = 'number';
		formatValue(value)[0];
		gizmo.size = '2';
		gizmo.id = title;//reference
		gizmo.setAttribute('data-gizmo','number-drag');	
		frame.appendChild(gizmo);

		//Append suffix
		if ($Text.length > 0){
			let suff = document.createElement('span');
			suff.innerHTML = $Text;
			suff.className = 'suffix';
			frame.appendChild(suff);			
		}

		let onclick = false;

		//BLUR
		gizmo.addEventListener('blur', function (e){
			
			commitChanges();
			thisGizmo.editing = false;

			/*if (!onclick){
			}else{
				console.log('set to false');
				onclick = false;
				gizmo.focus(); //refocus on element because clicking again causes blur
			}*/
		}, false);

		//Events
		//CLICK
		gizmo.addEventListener(pointerEvent['click'], function (e){
			onclick = true;
				
			if (thisGizmo.editing){
				clearSelections();
			}

			if (!thisGizmo.editing) {
				thisGizmo.editing = true;
				e.target.select();
			}				
		}, false);

		//FOCUS - prevent selecting contents on drag
		//weird stack error here - not that much of an issue, consider having a flag when dragging
		/*gizmo.addEventListener('focus', function (e){
			if (!thisGizmo.editing){
				gizmo.blur();
			}
		}, false);*/
		
		gizmo.addEventListener('keyup', function (e){
			if (event.which == 13 || event.keyCode == 13){
				onclick = false;
				e.target.blur();
			}else {
				commitChanges(true);
			}
		}, false);

		//same as dynamic update but input doesnt blur
		function commitChanges(skipSymbol){	
			let targetValue = gizmo.value,
				selectText = false,
				newValue = formatValue(targetValue, skipSymbol);

			if (targetValue.toString().length == 0) {
				targetValue = thisGizmo.defaultValue;
				selectText = true;
			}

			gizmo.value = newValue; 			
			updatePair();//update paired gizmo
			if (thisGizmo.prevValue != thisGizmo.value) {
				callbackFn(thisGizmo.value);
			}
			
			if (selectText) gizmo.select();//when deleting a field, select default value

		}

		//from the gizmo listener
		thisGizmo.dynamicUpdate = dynamicUpdate;
		function dynamicUpdate(val, skipCallback){	
			gizmo.value = formatValue(val);		

			updatePair();//update paired gizmo
			if (typeof skipCallback == 'undefined') callbackFn(thisGizmo.value);
			gizmo.blur();	
		}

		//simple value-only update
		thisGizmo.update = update;
		function update(val){
			gizmo.value = formatValue(val);
			//thisGizmo.value updates automatically via formatValue
		}

		return thisGizmo;
	}

	//Input Box Hex Value
	if (type == 'hexBox'){

		let gizmoObject = this.gizmo[title];

		gizmo = document.createElement('input');	
		gizmo.type = "text";
		gizmo.setAttribute('data-gizmo','hex-box');
		gizmo.value = value;
		this.DOM.appendChild(gizmo);		
		thisGizmo.valueDOM = gizmo;

		//Events

		gizmo.addEventListener('keyup', keyUp.bind(this), false);
		function keyUp(e){
			let val = e.target.value;
			val = '#'+val.replace(/[G-Zg-z\W]/g,''); //converts to hex
			e.target.value = val;

			callbackFn(val);
			gizmoObject.value = val;
		}
		this.gizmo[title].update = update;
		function update(val){
			gizmo.value = val;
		}
	}//Hex

	//Input Box Text Value
	if (type == 'textBox'){

		//Set default to text format
		thisGizmo.format = 'string';

		//label housing the box's title in a span (front of input = prefix, after input = suffix)
		let frame = document.createElement('label');
		parentDOM.appendChild(frame);

		//Suffix can be added using frontText$backText 
		let $Text = '',
			labelText = label;

		if (label){
			let $Pos = label.indexOf('$');
			if ($Pos > -1){
				$Text = label.slice($Pos+1);
				labelText = label.slice(0, $Pos);
			}
			//prefix in front of input box
			let pref = document.createElement('span');
			pref.innerHTML = labelText;
			pref.className = "prefix"
			frame.appendChild(pref);
		}

		//the input box
		gizmo = document.createElement('input');	
		gizmo.type = "text";
		gizmo.setAttribute('data-gizmo','text-box');
		gizmo.value = value;
		frame.appendChild(gizmo);
		thisGizmo.valueDOM = gizmo;

		//Append suffix
		if ($Text.length > 0){
			let suff = document.createElement('span');
			suff.innerHTML = $Text;
			suff.className = 'suffix';
			frame.appendChild(suff);			
		}

		//Events
		//CLICK
		//let onclick = false;
		gizmo.addEventListener(pointerEvent['click'], function (e){
			//onclick = true;
			
			if (!thisGizmo.editing){
				thisGizmo.editing = true;
				this.select();				
			}			
		}, false);

		//BLUR
		gizmo.addEventListener('blur', function (e){
			/*if (onclick){
				onclick = false;
			}else*/
			
			if (thisGizmo.editing){
				commitChanges(e, false, true);
				thisGizmo.editing = false;				
			}			
		}, false);

		//KEYUP
		gizmo.addEventListener('keyup', function (e){
			commitChanges(e, true);
			if (event.which == 13 || event.keyCode == 13){
				gizmo.blur();
			}
		}, false);


		function commitChanges(e, holdVal, blurred){
			let targetValue = e.target.value;

			if (targetValue.toString().length == 0) targetValue = thisGizmo.defaultValue;
				
			let newValue = formatValue(targetValue);

			
			updatePair();//update paired gizmo

			if (thisGizmo.prevValue != thisGizmo.value) {
				callbackFn(thisGizmo.value, blurred);
			}	
			
			if (!holdVal) {
				e.target.value = newValue;	
			}
		}

		thisGizmo.update = update;
		function update(val){
			gizmo.value = formatValue(val); // val; ...?issue?
			//thisGizmo.value = val;
		}
	}//Text Box

	//Saturation & Brightness graph S/B - requires .activateGizmos on main panel
	if (type == 'colorGraph'){	
		//graph wrapper
		gizmo = document.createElement('section');
		gizmo.id = title;
		gizmo.setAttribute('data-gizmo','color-graph');
		this.DOM.appendChild(gizmo);

		//S L Graph
		let graph = document.createElement('canvas');
		graph.width = 186;
		graph.height = 100;
		graph.setAttribute('data-gizmo','color-graph');
		graph.id = title+'-graph';
		gizmo.appendChild(graph);

		//leveler			
		let level = document.createElement('div');
		level.className = 'lvl';
		gizmo.appendChild(level);

		thisGizmo.update = update;
		function update(colorObj, drawGraph){

			//update DOM object value with saved value
			thisGizmo.value = {
				h : parseInt(colorObj.h),
				s : parseInt(colorObj.s),
				l : parseInt(colorObj.l)
			}

			let val = thisGizmo.value;

			//draw canvas saturation lightness graph
			if (drawGraph){
				/*let ctx = graph.getContext('2d'),
					gw = Math.round(graph.width/100),
					gh = Math.round(graph.height/100);

				//ctx.imageSmoothingEnabled = false;			
				for (let s = 0; s <= 100; s++){
					for (let l = 0; l <= 100; l++){
						ctx.fillStyle = 'hsl('+val.h+', '+s+'%, '+l+'%)';
						ctx.fillRect(s*gw, graph.height-l*gh, (gw), (gh));
					}
				}*/
				let ctx = graph.getContext('2d'),
					img = pRender.get('colorGraph'),
					gy =  Math.floor(val.h/18),
					gx = (val.h - 18*gy);
				
				ctx.drawImage(img, gx*186, gy*100, 186, 100, 0, 0, graph.width, graph.height);
			}

			//crosshair
			var userX = (val.s/100)*graph.width,
				userY = graph.height - (val.l/100)*graph.height;

			level.style.left = userX+'px';
			level.style.top = userY+'px';
		}
		update(value, true);
	}//color Graph

	//Hue Bar
	if (type == 'colorHue'){
		//slider wrapper
		gizmo = document.createElement('section');
		gizmo.id = title;
		gizmo.setAttribute('data-gizmo','color-hue');
		this.DOM.appendChild(gizmo);

		//slider gradient - firstChild
		let slider = document.createElement('canvas');	
		slider.width = 186;
		slider.height = 25;
		slider.setAttribute('data-gizmo','color-hue');
		slider.id = title+'-slider';
		gizmo.appendChild(slider);

		//leveler			
		let level = document.createElement('div');
		level.className = 'lvl';
		gizmo.appendChild(level);

		//draw hue spectrum
		let ctx = slider.getContext('2d'),
			step = slider.width/360,
			s = 100,
			l = 50;

		for (let i = 0; i <= 360; i++){	
			ctx.fillStyle = 'hsl('+i+', '+s+'%, '+l+'%)';
			ctx.fillRect(step*i, 0, 1, slider.height);
		}

		thisGizmo.update = update;
		function update(colorObj){

			//update DOM object value with saved value
			thisGizmo.value = {
				h : parseInt(colorObj.h),
				s : parseInt(colorObj.s),
				l : parseInt(colorObj.l)
			}			

			let userX = (thisGizmo.value.h/360)*slider.width;
			level.style.left = userX+'px';
			
		}
		update(value);
	}//Hue Bar

	if (type == 'colorRGB'){

		//container
		gizmo = document.createElement('div');	
		gizmo.className = 'frame';
		gizmo.id = title;
		gizmo.setAttribute('data-gizmo','color-rgb');
		this.DOM.appendChild(gizmo);

		//All
		var slider = {
			'r' : document.createElement('canvas'),
			'g' : document.createElement('canvas'),
			'b' : document.createElement('canvas')
		};
		let labelName = {
			'r' : 'RED',
			'g' : 'GREEN',
			'b' : 'BLUE'
		}

		for (var s in slider){
			slider[s].width = 182;
			slider[s].height = 20;
			slider[s].id = title+'--'+s;
			slider[s].setAttribute('data-gizmo','color-rgb');

			//individual frames
			let frame = document.createElement('section');
			frame.className = 'rgb-slider';

			//label area
			let rgbNum = this.addGizmo('numberDrag', title+'-v-'+s, 0, labelName[s], updateVal.bind(s), frame);
			rgbNum.setFormat('number', 0, 255);
			function updateVal(val){
				thisGizmo.value[this] = val;
				thisGizmo.update(val);
			}

			//add Slider
			frame.appendChild(slider[s]);
			//leveler			
			let level = document.createElement('div');
			level.className = 'lvl';
			frame.appendChild(level);
			gizmo.appendChild(frame);
		}
		
		let _this = this;
		thisGizmo.update = update.bind(this);
		function update(colorObj){

			thisGizmo.value = {
				r : parseInt(colorObj.r),
				g : parseInt(colorObj.g),
				b : parseInt(colorObj.b)    
			}
			var val = thisGizmo.value;

			for (var s in slider){

				//update rgb amount
				_this.gizmo[title+'-v-'+s].update(val[s]);

				//redraw slider gradient
				let parent = slider[s].parentNode,
				ctx = slider[s].getContext('2d'),
				step = Math.round(slider[s].width/255),
				r = val.r,
				g = val.g,
				b = val.b;

				//ctx.imageSmoothingEnabled = false;

				for (let i = 0; i <= 255; i++){	
					if (s == 'r') {
						ctx.fillStyle = 'rgb('+i+', '+g+', '+b+')';
					}
					if (s == 'g') ctx.fillStyle = 'rgb('+r+', '+i+', '+b+')';
					if (s == 'b') ctx.fillStyle = 'rgb('+r+', '+g+', '+i+')';					
					ctx.fillRect(step*i, 0, 1, slider[s].height);
				}

				//indictor
				let userX = (val[s]/255)*slider[s].width;
				parent.lastChild.style.left = userX+'px';
			}
		}
		update(value);		
	}

	//Gizmo Functions


	//formats a number input setFormat('string') for string values, or if number expected params:
	function setFormat(type, min, max, symbol, symbolPos){
		if (type == 'string') {
			this.format = 'string';
			this.range = [];
			return;
		}
		if (type == 'number'){
			let symbolText = symbol || '';

			this.range = [min, max];
			this.symbol = symbolText.toString();
			this.symbolPos = symbolPos || 'back';
			this.format = 'number';
			return;
		}
		if (type == 'filename') {
			this.format = 'filename';
			this.range = [];
			return;
		}
	}

	//lock to other gizmo eg aspec ratio lock
	//func beongs to pair obj
	function pairWith(otherGizmo, pairingType, callback){

		//configure pair
		//first gizmo
		this.active = true;
		this.type = pairingType;
		this.gizmo = otherGizmo;
		this.callback = callback;

		//second gizmo
		otherGizmo.pair.active = true;
		otherGizmo.pair.type = pairingType;
		otherGizmo.pair.gizmo = thisGizmo;
		otherGizmo.pair.callback = callback;


		//ratio type
		this.ratio = Math.round((thisGizmo.value / otherGizmo.value)*1000)/1000;
		otherGizmo.pair.ratio = Math.round((otherGizmo.value / thisGizmo.value)*1000)/1000;

		//range type - determined by first values - smallest is min, biggest is max
		if (pairingType == 'range'){
			let that = otherGizmo.pair;

			if (thisGizmo.value > otherGizmo.value) {
				this.bounds[0] = otherGizmo.value;		//min //save min max in gizmo bounds
				this.bounds[1] = thisGizmo.value;		//max
				this.bounds[2] = 'max';					//save which is min and which is max
				that.bounds[0] = otherGizmo.value;
				that.bounds[1] = thisGizmo.value;
				that.bounds[2] = 'min';
			}
			else if (thisGizmo.value < otherGizmo.value) {
				this.bounds[0] = thisGizmo.value;//min 
				this.bounds[1] = otherGizmo.value;//max
				this.bounds[2] = 'min';
				that.bounds[0] = thisGizmo.value;		
				that.bounds[1] = otherGizmo.value;		
				that.bounds[2] = 'max';
			}
			else{
				this.active = false;
				return;
			}
			
			//initial range of both gizmos - format range will change as soon as one gizmo is updated
			thisGizmo.setFormat('number', this.bounds[0], this.bounds[1]);
			otherGizmo.setFormat('number', that.bounds[0], that.bounds[1]);		
		}

	}

	function pairUI(w, h){

		let ui = new Component('classBox', 'gizmo-aspect-ui'),
			ele = ui.DOM;

		gizmo.appendChild(ele);
		ele.style.width = w+'px';
		ele.style.height = h+'px';
		ele.style.right = -w+'px';
	}

	//run with: gizmo[title].pair.toggle (run on one, toggles both)
	function pairToggle(){

		//active -> inactive
		if (this.active){
			this.active = false;
			this.gizmo.pair.active = false;
		}
		//inactive -> active
		else{
			this.active = true;
			this.ratio = Math.round((thisGizmo.value / this.gizmo.value)*1000)/1000;

			this.gizmo.pair.active = true;
			this.gizmo.pair.ratio = Math.round((this.gizmo.value / thisGizmo.value)*1000)/1000;
		}
	}


	//internal gizmo methods 
	function updatePair(){
		if (isNaN(thisGizmo.value) || !thisGizmo.pair.active) return;

		let otherGizmo = thisGizmo.pair.gizmo;

		//compute ratio
		if (thisGizmo.pair.type == 'aspect'){
			//autoset otherGizmo value
			let val = Math.round(thisGizmo.value / thisGizmo.pair.ratio);
			otherGizmo.update(val);	
			otherGizmo.callback(val);				
		}

		if (thisGizmo.pair.type == 'range'){
			let thisBounds = thisGizmo.pair.bounds;

			if (thisBounds[2] == 'max') {
				otherGizmo.range[1] = thisGizmo.value;
			} 
			if (thisBounds[2] == 'min') {
				otherGizmo.range[0] = thisGizmo.value;
			}  
		} 

		if (typeof thisGizmo.pair.callback == 'function') thisGizmo.pair.callback();
	}

	function formatValue(value, skipSymbol){

	//skipSymbol : in cases where he input field text needs to stay numeric

		let currentValue = thisGizmo.value, //a valid previous value
			newValue; //0 : formatted value (unformatted automatically applied to this gizmo .value) 1: true/false - is the value unchanged 

		if (thisGizmo.format == 'number'){
			newValue = Math.sign(parseInt(value))*parseInt(value.toString().replace(/\D/g,'')); //strip all symbols and alphas
		}
		else 
		if (thisGizmo.format == 'filename'){
			newValue = value.toString().replace(/[^a-z0-9]/gi, '_').toLowerCase();

		}
		else {
			newValue = value; //returns new value unformatted 
		}

		if (thisGizmo.range.length > 0){
			if (isNaN(newValue)) { return currentValue; } //defaults back unchanged
			if (newValue < thisGizmo.range[0]) newValue = thisGizmo.range[0];
			if (newValue > thisGizmo.range[1]) newValue = thisGizmo.range[1];
		}
		//record old value
		thisGizmo.prevValue = thisGizmo.value;
		
		//set new valid value
		thisGizmo.value = newValue;
		
		//return formatted value with a symbol in string format (only for input field)
		if (!skipSymbol){
			if (thisGizmo.symbolPos == 'back') 
				return (newValue.toString()+thisGizmo.symbol);
			else return (thisGizmo.symbol+newValue.toString());
		}else{
			return newValue;
		}
	}

	//Numberdrag only - set direction of drag
	function setDragDirection(dir){

		thisGizmo.drag.direction = dir;

		if (dir == 'y'){
			gizmo.className = 'ycursor';
		}

		if (dir == 'x'){
			gizmo.className = 'xcursor';
		}
	}


	return thisGizmo;
}

//Do this on child, applies one listener on panel parent for multiple subpanel gizmos
Component.prototype.activateGizmos = function (){


	//on mousedown coordinates - for determining distance
	var sx = 0,	
		sy = 0;
	//on mouseup/mousemove coordinates
	var mousex = 0,
		mousey = 0;

	//Gizmo "Events"	
	let app = document.getElementById('app-main');

	this.panel.DOM.removeEventListener(pointerEvent['down'], mouseDown, false);
	this.panel.DOM.removeEventListener('touchstart', mouseDown, false);

	this.panel.DOM.addEventListener(pointerEvent['down'], mouseDown.bind(this.panel), false);
	this.panel.DOM.addEventListener('touchstart', mouseDown.bind(this.panel), false);	

	function mouseDown (e){
		console.log('down id:'+this.panel.DOM.id);
		//e.preventDefault();
		this.focus = e.target.getAttribute('data-gizmo') || 'none';

		if (this.focus != 'none') {
			this.focusId = e.target.id;

			//capture mouse (start drag position)
			sx = getClientPos(e).x;
			sy = getClientPos(e).y;

			e.target.blur(); //prevent editing input if dragging

			//Capture current value of gizmo before changing
			snapValue(this.focusId);
			gizmoActions(e, this.focus, this.focusId);	
		}
	}

	document.removeEventListener(pointerEvent['up'], mouseUp, false);
	document.removeEventListener('touchend', mouseUp, false);

	document.addEventListener(pointerEvent['up'], mouseUp.bind(this.panel), false);
	document.addEventListener('touchend', mouseUp.bind(this.panel), false);

	function mouseUp (e){	
		//e.preventDefault();
		gizmoActions(e, this.focus, this.focusId); //check for mouseup	
		this.focus = "none";
		//let gizmo = this.gizmo[this.focusId];
		//if (gizmo) gizmo.valueDOM.blur();
	}

	document.removeEventListener(pointerEvent['move'], mouseMove, false);
	document.removeEventListener('touchmove', mouseMove, false);

	document.addEventListener(pointerEvent['move'], mouseMove.bind(this.panel), false);
	document.addEventListener('touchmove', mouseMove.bind(this.panel), false);


	function mouseMove (e){
		if (this.focus != 'none') gizmoActions(e, this.focus, this.focusId);

		
	}

	function getClientPos(e){
		let pos = {
			x : 0,
			y : 0
		}
		if (e.type == 'touchend'){ //special, getting touch coordinates dont work for this ...
			pos.x = mousex;
			pos.y = mousey;
			return pos;
		}
		else
		if (e.type == 'touchmove' || e.type == 'touchstart'){
			pos.x = e.targetTouches[0].clientX || 0;
			pos.y = e.targetTouches[0].clientY || 0;
		}else{
			pos.x = e.clientX;
			pos.y = e.clientY;
		}
		mousex = pos.x;
		mousey = pos.y;

		return pos;
	}

	console.log('Gizmos enabled on '+this.panel.DOM.id+'.');

	//Gizmo Actions
	var _this = this.panel;

	//Value before dragging input (numberDrag only atm) - appended on mouseup
	function snapValue(focusId){
		if (typeof _this.gizmo[focusId] == 'undefined') return;
		_this.gizmo[focusId].snapValue = _this.gizmo[focusId].value;
	}

	function gizmoActions(e, focus, focusId){
		
		//Update S & L values
		if (focus === 'color-graph'){
			let element = document.getElementById(focusId),
				rect = element.getBoundingClientRect(),
				relX = element.width/100,
				relY = element.height/100,
				mx = cap(getClientPos(e).x - rect.left, 0, element.width),
				my = cap(getClientPos(e).y - rect.top, 0, element.height),
				s = Math.round(mx / relX),
				l = 100 - Math.round(my / relY);
			
			//get parent Object
			focusId = focusId.replace('-graph','');

			//update gizmo value
			let val = _this.gizmo[focusId].value;
			val.l = l;
			val.s = s;

			_this.gizmo[focusId].callback(val, e, 'color-graph');
			return;
		}

		//Update Hue Value
		if (focus === 'color-hue'){		
			
			let element = document.getElementById(focusId),
				rect = element.getBoundingClientRect(),
				rel = element.width/360,
				mx = cap(getClientPos(e).x - rect.left, 0, element.width),
				h = Math.round(mx / rel);

			//get parent 
			focusId = focusId.replace('-slider','');

			//update gizmo value
			let val = _this.gizmo[focusId].value;
			val.h = h;

			_this.gizmo[focusId].callback(val, e, 'color-hue');
			return;	
		}

		//Update RGB Value
		if (focus === 'color-rgb'){	

			//identify sub elements of gizmo
			let keyStr = focusId.substr(focusId.length-3, 3),
				str = '--r--g--b';
			if (str.search(keyStr) > -1) {	

				let element = document.getElementById(focusId),
					rect = element.getBoundingClientRect(),
					rel = element.width/255,
					mx = cap(getClientPos(e).x - rect.left, 0, element.width);

				let key = keyStr.replace('--','');

				//switch focus to main gizmo & run callback
				focusId = focusId.replace(keyStr,'');

				let val = _this.gizmo[focusId].value;
				val[key] = Math.round(mx / rel);

				//let val = Math.round(mx / rel);
				_this.gizmo[focusId].callback(val, e, 'color-rgb');
			}
			return;	
		}

		//drag value numberdrag
		if (focus === 'number-drag'){
			let gizmo = _this.gizmo[focusId],
				element = document.getElementById(focusId),
				rect = element.getBoundingClientRect(),
				dOff = 10,//to avoid dragging when just clicking
				dx = getClientPos(e).x - (rect.left + element.offsetWidth/2),
				dy = getClientPos(e).y - (rect.top + element.offsetHeight/2),
				d = 0;

			//dont drag if in editing mode
			if (gizmo.editing) return;

			if (gizmo.drag.direction == 'y'){
				d = -dy;
			}else{
				d = dx;
			}
			//d = Math.sign(dy*-1)*Math.sqrt(dx*dx + dy*dy); //up down more less determination
				
			
			if (d >= dOff || d <= -dOff) {
				//start distance at offset	
				d -= dOff*Math.sign(d);

				let range = gizmo.range[1] || 100,
				// 	dMax = range * 3,
					dMax = gizmo.drag.maxDist,
					append = d/dMax*range,
					newVal = parseInt(gizmo.snapValue+append);

				if (gizmo.prevValue != newVal){
					gizmo.dynamicUpdate(newVal);
				}
			}
			return;
		}

		//drag panel
		if (focus == 'panel-drag'){
			let gizmo = _this.gizmo[focusId],
				dx = sx - getClientPos(e).x,
				dy = sy - getClientPos(e).y,
				newX = gizmo.snapValue[0]-dx,
				newY = gizmo.snapValue[1]-dy;
			
			gizmo.dynamicUpdate([newX, newY]);	
			return;		
		}
		//drag item
		if (focus == 'item-drag'){
			let gizmo = _this.gizmo[focusId],
				parent = _this.gizmo[focusId];
		}
	}	
}

//add any event map = ['click', fn] - Any component, not button
Component.prototype.addAction = function (map){
	
	let evt = map[0];
	this.DOM.addEventListener(pointerEvent[evt], runAction.bind(map), false);
	function runAction(){
		map[1]();
	}
}

Component.prototype.addButton = function (type, action, label){	
	this.button[action] = {
		action : action,
		DOM : document.createElement('button'),
		panel : this.panel,
		label : label,
		setLabel : buttonText,
		cycleTabs : cycleTabs,
		toggleMenu : menuToggle,
		setActiveTab : activeMenu,
		toggle : toggle,
		toggleHeight : toggleHeight,
		toggleSelf : true,
		toggleTab : true,
		autoHeight : true,
		activeTab : '',
		radio : radioBind,
		addAction : addAction, //function as param from main - fired with a new click event - only for CTA
		callback : function(){}
	}

	let btn = this.button[action].DOM,
		wrapper = btn, //own wrapper by default
		btnLabel = label || '';

	//reconstruct if checkbox element
	if (type == 'check'){
		wrapper = document.createElement('label');
		wrapper.className = 'checkbox';

		let labelText = document.createElement('span');

		wrapper.appendChild(btn);
		wrapper.appendChild(labelText);
	}	
	
	/*visual [ bracket connecting two gizmo input fields*/
	if (type == 'aspect'){
		wrapper = document.createElement('aside');
		wrapper.appendChild(btn);
		wrapper.className = 'aspect';		
	}
	
	//Add to DOM
	this.DOM.appendChild(wrapper);	
	
	//set button text
	buttonText(btnLabel);


	let parentH = wrapper.parentNode.dataset.height || '1';
	if (type == 'tab'){
		btn.setAttribute('data-tab', action);
		if (this.button[action].autoHeight) 
			btn.setAttribute('data-height', parentH);
	}

	if (type == 'function'){
		btn.setAttribute('data-func', action);
	}
	if (type == 'cta'){
		btn.className = 'cta';
		btn.setAttribute('data-func', action);
	}
	//wide items containg text 
	if (type == 'item'){
		btn.className = 'item';
		btn.setAttribute('data-func', action);
	}
	//function checkbox
	if (type == 'check'){
		btn.setAttribute('data-func', action);
	}
	//function aspect ratio
	if (type == 'aspect'){			
		btn.setAttribute('data-func', action);	
	}

	return this.button[action];


	//set label
	function buttonText(txt, append){
		if (typeof txt == 'undefined' || txt == '') return;
		
			
		//checkbox button with side label
		if (type == 'check'){	
				
			let ico = getMaterialIcon('mdi-square');
			btn.appendChild(ico);
			wrapper.lastChild.innerHTML = txt;
			return;
		}

		//buttons with text content
		if (btn.firstChild && !append) btn.removeChild(btn.firstChild);
		if (txt.substr(0,3) == 'url'){
			let url = txt.substr(4, txt.length-5),
				icon = document.createElement('img');

			btn.appendChild(icon);
			icon.onload = function(){

			}
			icon.src = url
			btn.appendChild(icon);
		}
		else
		if (txt.substr(0,3) == 'mdi'){
			let ico = getMaterialIcon(txt);
			btn.appendChild(ico);
		}
		else
		if (txt.substr(0,3) == 'bb-'){
			let ico = getBBIcon(txt);
			btn.appendChild(ico);
		}
		else {
			let span = document.createElement('span');
			span.className = 'text';
			span.innerHTML = txt;
			btn.appendChild(span);
		}
		
	}

	//Icons from Material
	function getMaterialIcon(icon){
		var item = document.createElement('span');

		item.className = 'mdi '+icon;

		return item;
	}

	//Icons from BitBrush Lib
	function getBBIcon(icon){
		var item = document.createElement('span');

		item.className = icon;

		return item;
	}

	//simple CTA action without mapping the parent component - useful for 1 button
	function addAction(actionFn){
		this.DOM.addEventListener(pointerEvent['click'], function (e){
			actionFn(e);
		}, false);
	}

	//add other menus to a radio group
	function radioBind(groupName, toggleSelf, toggleMenu){
		this.toggleSelf = toggleSelf || false;
		this.toggleTab = toggleMenu || this.toggleSelf;
		this.DOM.setAttribute('data-radio', groupName);
		return this;
	}

	//Allow tab buttons to set height to that of tab
	function toggleHeight(tH){
		this.autoHeight = tH;
	}

	//one button, multiple menus - any type - cant use togglemenu or radiobind
	function cycleTabs(callback){

		let btn = this.DOM,
			menuId = this.action.split(',');
		
		if (menuId.length == 0) return this;

		//remember which menu is on
		btn.setAttribute('data-cycle', '0');

		btn.addEventListener(pointerEvent['click'], function(e){

			let cycleBtn = e.currentTarget;

			for (i = 0; i < menuId.length; i++){
				let menu = document.getElementById(menuId[i]);
				menu.style.display = 'none';
			}

			//repurposed
			let index = parseInt(cycleBtn.getAttribute('data-cycle'));
			

			index++;
			if (index >= menuId.length) index = 0;
			cycleBtn.setAttribute('data-cycle', index);

			let thisMenu = document.getElementById(menuId[index]);
			thisMenu.style.display = '';
			
			callback();
		}, false);

		//activate menu in action if not active
		let firstMenu = document.getElementById(menuId[0]);
		firstMenu.style.display = '';

		for (i = 1; i < menuId.length; i++){
			let menu = document.getElementById(menuId[i]);
			menu.style.display = 'none';
		}

		return this;
	}

	//toggle and radio only applies to tabs with buttons
	function menuToggle(active, callback){

		//active - is this menu active from the start?
		//callback - any function is executed on click

		this.callback = callback || function(){};

		let tabEle = document.getElementById(this.action),
			tabBtn = this.DOM;

		let tabHeight = tabEle.getAttribute('data-height') || '3';

		if (active) {
			if (this.autoHeight) tabBtn.setAttribute('data-height', tabHeight);
			tabBtn.setAttribute('data-active', '');
			tabEle.style.display = '';
		}
		else
		{
			tabEle.style.display = 'none';
		}

		var _this = this;
		//add action
		tabBtn.addEventListener(pointerEvent['click'], function(e){

			let btn = e.currentTarget,
				tab = document.getElementById(btn.dataset.tab),
				parentH = btn.parentNode.dataset.height || '1',
				act = active;


			if (typeof btn.dataset.active != 'undefined') { //IF ACTIVE

				if (_this.toggleSelf){
					if (_this.autoHeight) btn.setAttribute('data-height', parentH);
					btn.removeAttribute('data-active');
					act = false;
				}
				//always set to toggleSelf unless explicitly set in .radio(_,_,true)
				if (_this.toggleTab){
					if (tab.style.display != 'none')
						tab.style.display = 'none';	
					else tab.style.display = '';						
				}
			}
			else{							//IF NOT ACTIVE
				
				if (_this.autoHeight) btn.setAttribute('data-height', tabHeight);
				btn.setAttribute('data-active', '');
				act = true;
				tab.style.display = '';

				_this.activeTab = action;

				//if radio switch other buttons off
				if (btn.dataset.radio){
					let child = document.getElementsByTagName('button');

					for (let i = 0; i < child.length; i++){

						let c = child[i];

						if (c == btn) continue;
						let group = c.getAttribute('data-radio');
						if (typeof group == 'undefined') continue;

						//turn off rest
						if (group == btn.dataset.radio){
							if (_this.autoHeight) c.setAttribute('data-height', parentH);
							c.removeAttribute('data-active');

							if (typeof c.dataset.tab != 'undefined'){
								let gtab = document.getElementById(c.dataset.tab);
								gtab.style.display = 'none';
							}
						} 
					}
				}
			}

		_this.callback(act);	
		}, false);
		return this;
	}

	//to reset a hidden window's menu
	function activeMenu(){

		let btn = this.DOM,
			tab = document.getElementById(btn.dataset.tab),
			tabHeight = tab.getAttribute('data-height') || '3',
			parentH = btn.parentNode.dataset.height || '1';

		if (typeof btn.dataset.active != 'undefined') { //IF ACTIVE
			return;
		}
		else{	//IF NOT ACTIVE

			if (this.autoHeight) btn.setAttribute('data-height', tabHeight);

			btn.setAttribute('data-active', '');
			tab.style.display = '';

			//if radio switch other buttons off
			if (btn.dataset.radio){
				let child = document.getElementsByTagName('button');

				for (let i = 0; i < child.length; i++){

					let c = child[i];

					if (c == btn) continue;
					let group = c.getAttribute('data-radio');
					if (typeof group == 'undefined') continue;

					//turn off rest
					if (group == btn.dataset.radio){
						if (this.autoHeight) c.setAttribute('data-height', parentH);
						c.removeAttribute('data-active');

						if (typeof c.dataset.tab != 'undefined'){
							let gtab = document.getElementById(c.dataset.tab);
							console.log(c.dataset.tab+' hidden.');
							gtab.style.display = 'none';
						}
					} 
				}
			}
		}
	}
	
	function toggle(active, btnLabelAlt, toggleHeightN){

		//active - is this btn active from the start?
		//btnAltLabel OPTINAL (should label change once clicked)
		//toggleHeightN OPTIONAL (toggles height of button to set integer value)

		let toggleBtn = this.DOM,
			label = this.label,
			newH = toggleHeightN || 0;

		if (active) setActive(toggleBtn, this)
		else setInactive(toggleBtn);

		//add action
		toggleBtn.removeEventListener(pointerEvent['click'], btnFunc.bind(this), false);
		toggleBtn.addEventListener(pointerEvent['click'], btnFunc.bind(this), false);

		function btnFunc(e){
			let btn = e.currentTarget;
			//active -> inactive
			if (typeof btn.dataset.active != 'undefined') {
				if (this.toggleSelf){
					setInactive(btn);					
				}				
			}else{
				setActive(btn, this);
			}
		}

		function setActive(btn, _this){
			btn.setAttribute('data-active', '');
			if (btnLabelAlt) buttonText(label);
			_this.callback(btn);

			if (newH > 0) btn.setAttribute('data-height', newH.toString());

			//if radio switch other buttons off
			if (btn.dataset.radio){
				let child = document.getElementsByTagName('button');

				//if (_this.type == 'check') child = document.getElementsByTagName('label');

				for (let i = 0; i < child.length; i++){
					let c = child[i];

					//skip self
					if (c == btn) {				
						continue;
					}

					let group = c.getAttribute('data-radio');
					if (typeof group == 'undefined') continue;

					//turn off rest (visual only)
					if (group == btn.dataset.radio){
						c.removeAttribute('data-active');
						//optional height toggle
						if (newH > 0) btn.removeAttribute('data-height');
						//if btn is radio's to a tab btn
						if (typeof c.dataset.tab != 'undefined'){
							c.removeAttribute('data-height');
							let tab = document.getElementById(c.dataset.tab);
							tab.style.display = 'none';
						}							
					} 
				}
			}
		}

		function setInactive(btn){
			btn.removeAttribute('data-active');
			if (btnLabelAlt) buttonText(btnLabelAlt);

			//optional height toggle
			if (newH > 0) btn.removeAttribute('data-height');
		}

		return this;
	}
}

// send objMap as {action string : function } from main app
Component.prototype.mapButtons = function (objMap){
	for (k in objMap){
		let action = this.button[k].action;
		this.button[k].DOM.addEventListener(pointerEvent['click'], runAction.bind(objMap), false);
		function runAction(e){
			objMap[action]();
		}
	}
}
Component.prototype.mapButton = function (btnTitle, fn){
	this.button[btnTitle].DOM.addEventListener(pointerEvent['click'], fn, false);
}


//HELPERS


function selectElementText(element){
    var sel, range;
    var el = element; //get element
    if (window.getSelection && document.createRange) { //Browser compatibility
      sel = window.getSelection();
      if(sel.toString() == ''){ //no text selection
         window.setTimeout(function(){
            range = document.createRange(); //range object
            range.selectNodeContents(el); //sets Range
            sel.removeAllRanges(); //remove all ranges from selection
            sel.addRange(range);//add Range to a Selection.
        },1);
      }
    }else if (document.selection) { //older ie
        sel = document.selection.createRange();
        if(sel.text == ''){ //no text selection
            range = document.body.createTextRange();//Creates TextRange object
            range.moveToElementText(el);//sets Range
            range.select(); //make selection.
        }
    }
}

function clearSelections(){

 if (window.getSelection) {
 	window.getSelection().removeAllRanges();
 }
 else if (document.getSelection) {
 	document.getSelection().removeAllRanges();
 }
 else if (document.selection) {
 	document.selection.empty();
 }
}

function getInlineSVG(url){
	var svg = document.createElement('svg'),
		use = document.createElement('use');

	
	svg.setAttribute('role','img');
	svg.style.width = "20px";
	svg.style.height = "20px";

	use.style.width = "20px";
	use.style.height = "20px";
	use.setAttribute('xlink:href',url);
	svg.appendChild(use);

	return svg;
}