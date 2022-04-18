var ColorPanel = function (){

	this.title = 'COLORS';
	this.panel;

//UI	
	this.menu;		//eyedropper and menu btn ref for main
	this.sideMenu;  //to ref 4 buttons
	this.HSLgizmo;	//hue and sl graph gizmos
	this.RGBgizmo;	//rgb slider gizmos
	this.controls; 	//color value and rgb button
	this.drawer = {};
	this.shadesGizmo; //the shades gizmo
	this.harmonyTitle; //updates with value
	this.ui = {};

//NOTIFICATION POPUP

	this.msg;

//COLORS

	//Primary and Secondary color values
	this.colors = [];
	//Selected color value reference
	this.color;

	this.settings = {
		pickerMode : 'HSL',
		shade : 0,
		maxShade : 100,
		autoShades : true,
		harmony : "Analogous",
		colorBook : 'Gameboy (4)'
	};

//SWATCHES
	this.activeSwatch = 1;

	//allows left button to set right colour when right colour has been selected
	this.autoSwitch = true; 

	//Recent and custom swatches list, format [[r,g,b,a],...]	
	this.recentColor = [];
	this.presetColor = [];

	//temporary color for conversion
	this.temp = new Color();
}

ColorPanel.prototype.init = function (colorA, colorB, msgBox){

	//message popups
	this.msg = msgBox;

	this.colors = [colorA, colorB];
	//set default colors
	this.colors[0].setRGBA(0,0,0,1);
	this.colors[1].setRGBA(0,0,0,0);
	this.color = this.colors[0];

	/*Color Panel Container*/
	this.panel = new Component('panel', 'panel-color');
	this.panel.appendTo('#workspace');

	//top menu
	this.menu = new Component('topMenu');
	this.menu.appendTo(this.panel);
	this.menu.setHeight('1');

	//Content Panel
	let mainPanel = new Component('panel', 'color-main');
	mainPanel.appendTo(this.panel);
	mainPanel.setHeight('3');

	//drag gizmo
	this.menu.addGizmo('panelDrag', 'color-palette');

	//top menu buttons & user swatches
	//this.menu.addButton('function', 'color-menu', 'mdi-menu');
	this.menu.addButton('function', 'eyedropper-tool', 'mdi-eyedropper').toggle().radio('tools', true);


	this.menu.addButton('function', 'color-1', '').toggle(true).radio('swatches');
	this.menu.addButton('function', 'color-2', '').toggle().radio('swatches');

	let swatch1 = document.createElement('div');
	swatch1.className = 'ui-swatch';
	this.menu.button['color-1'].DOM.appendChild(swatch1);
	this.menu.button['color-1'].DOM.setAttribute('data-height', 3);

	let swatch2 = document.createElement('div');
	swatch2.className = 'ui-swatch';
	this.menu.button['color-2'].DOM.appendChild(swatch2);
	this.menu.button['color-2'].DOM.setAttribute('data-height', 3);

	//Side Menu
	this.sideMenu = new Component('sideMenu');
	this.sideMenu.appendTo(mainPanel);

/* Tabs: Sub panels*/

//--Color Guide
	let colorGuide = new Component('subPanel', 'color-guide');
	colorGuide.appendTo(mainPanel);
	this.initColorGuide(colorGuide);

	//Custom Swatches
	let colorCustom = new Component('subPanel', 'color-custom');
	colorCustom.appendTo(mainPanel);
	this.initColorCustom(colorCustom);

	//Color Books
	let colorBooks = new Component('subPanel', 'color-books');
	colorBooks.appendTo(mainPanel);
	this.initColorBooks(colorBooks);

	//Color Picker
	let colorPicker = new Component('subPanel', 'color-picker');
	colorPicker.appendTo(this.panel);
	colorPicker.setHeight('4');

	let sideBar = new Component('sideMenu');
	sideBar.setHeight(0);
	sideBar.appendTo(colorPicker);
	let content = new Component('contentBox');
	content.appendTo(colorPicker);

	this.initColorPicker(sideBar, content);


	//Side Menu Buttons (contains reference to menus above)
	this.sideMenu.addButton('tab', 'color-guide', 'url(assets/icons/ui-color-guide.svg)').toggleMenu(true).radio('color-tabs');
	this.sideMenu.addButton('tab', 'color-custom', 'url(assets/icons/ui-color-custom.svg)').toggleMenu(false).radio('color-tabs');
	this.sideMenu.addButton('tab', 'color-books', 'url(assets/icons/ui-color-books.svg)').toggleMenu(false).radio('color-tabs');
	this.sideMenu.addButton('tab', 'color-picker', 'url(assets/icons/ui-color-picker.svg)').toggleMenu(false);

	//User Swatches
	var _this = this;
	this.menu.mapButtons({
		'color-1' : function (){
			if (_this.activeSwatch != 1){
				_this.activeSwatch = 1;
				_this.color = _this.colors[0];
				_this.autoSwitch = true;			
				_this.generateTintsShades();
				_this.generateHarmonies();
				//Update Color Picker
				_this.update();
			}else{
				let pickerBtn = _this.sideMenu.button['color-picker'].DOM;

				if (typeof pickerBtn.dataset.active == 'undefined')
				_this.sideMenu.button['color-picker'].DOM.click();//.toggleMenu(true);
			}			
		},
		'color-2' : function (){
			if (_this.activeSwatch != 2){
				_this.activeSwatch = 2;
				_this.color = _this.colors[1];
				_this.autoSwitch = false;//disable auto switch on second color				
				_this.generateTintsShades();//Update Color Picker
				_this.generateHarmonies();
				//Update Color Picker
				_this.update();
			}else{
				let pickerBtn = _this.sideMenu.button['color-picker'].DOM;

				if (typeof pickerBtn.dataset.active == 'undefined')
				_this.sideMenu.button['color-picker'].DOM.click();//.toggleMenu(true);
			}	
		}
	});

	this.panel.activateGizmos();
	this.update();
}


/*---USER COLOR SELECT--*/
ColorPanel.prototype.switchActiveColor = function (n){
	n = parseInt(n);
	if (this.activeSwatch != n){
		let oldSwatch = this.menu.button['color-'+this.activeSwatch],
			newSwatch = this.menu.button['color-'+n];
		//set active swatch
		this.activeSwatch = n;

		this.color = this.colors[n-1];
		//Update Toggle
		oldSwatch.toggle(false);
		newSwatch.toggle(true);
	}
}

ColorPanel.prototype.autoSwitchMouse = function (e){
	if (e.type == pointerEvent['down']){
		if (e.button == 2) {
			if (this.activeSwatch != 2){
				this.switchActiveColor(2);
				this.generateTintsShades();
				this.generateHarmonies();
				this.update();
			// ... add an exception here or it will be very slow
				return true;
			}
			console.log('color 2: '+this.color.h+','+this.color.s+','+this.color.l);
		}
		else 
		if (this.autoSwitch) {
			this.switchActiveColor(1);
		}
	}

	//auto switch back & set gizmos to primary - return = mouseup was button 2
	if (e.type == pointerEvent['up']){
		if (e.button == 2 && this.autoSwitch) {
			this.switchActiveColor(1);
			console.log('color 1: '+this.color.h+','+this.color.s+','+this.color.l);
			this.generateTintsShades();
			this.generateHarmonies();
			// ... add an exception here or it will be very slow
			this.update();
			return true;
		}			
	}
	return false;
}

/*---INSTANTIATE TABS---*/

/*Color Picker Tab*/
ColorPanel.prototype.initColorPicker = function (sideBar, content){

	//Populate default colors swatches
	for (k in $_default){
		let newSwatch = this.createSwatchPreset($_default[k], 'flat');
		sideBar.append(newSwatch);
	}

	let hslPicker = new Component('subPanel', 'color-hsl');
	hslPicker.appendTo(content);

	//Main content gizmos
	this.HSLgizmo = new Component('frame');
	this.HSLgizmo.appendTo(hslPicker);
	this.HSLgizmo.setHeight('2');
	this.HSLgizmo.addGizmo('colorGraph', 'color-graph', this.color, '', setHSL.bind(this));
	this.HSLgizmo.addGizmo('colorHue', 'color-hue', this.color, '', setHSL.bind(this));
	
	function setHSL(val, e, type){		

		if (this.autoSwitchMouse(e)) return;

		this.color.h = val.h;
		this.color.s = val.s;
		this.color.l = val.l;
		this.color.a = 1;

		//converts to RGB & Hex
		this.color.setHSL(this.color.h, this.color.s, this.color.l);
		
		this.settings.autoShades = true;
		this.generateTintsShades();
		this.generateHarmonies();
		this.update(type == 'color-graph' ? [type, 'color-rgb'] : 'color-rgb');
	}

	//RGB Panel
	this.RGBgizmo = new Component('subPanel', 'color-rgb');
	this.RGBgizmo.appendTo(content);
	this.RGBgizmo.addGizmo('colorRGB', 'color-rgb', this.color, '', rgbSliders.bind(this));
	
	function rgbSliders(val, e){

		if (this.autoSwitchMouse(e)) return;	
		
		this.color.r = val.r;
		this.color.g = val.g;
		this.color.b = val.b;
		this.color.a = 1;
		//converts to other formulas
		this.color.setRGBA(this.color.r, this.color.g, this.color.b, this.color.a);/**/

		this.settings.autoShades = true;
		this.generateTintsShades();
		this.generateHarmonies();
		this.update(['color-graph']);
	}

	//Value and Format toggle
	this.controls = new Component('frame');
	this.controls.appendTo(content);
	this.controls.DOM.id = 'color-controls';

	this.controls.addGizmo('hexBox', 'color-value', this.color.getHex(), '', setColor.bind(this));
	function setColor(val){
		//when key up
		
		this.color.setHex(val);
		this.generateTintsShades();
		this.generateHarmonies();
		this.update(['color-value']);

		//this.controls.gizmo['color-value'].update

	}

	//HSL RGB Toggle
	this.controls.addButton('cta', 'color-hsl,color-rgb', 'SHOW RGB').toggle(true, 'SHOW HSL').cycleTabs(updateColors.bind(this));
	function updateColors(){
		if (this.settings.pickerMode == 'HSL'){
			this.settings.pickerMode = 'RGB';
			this.update(['color-graph']);
		}else{
			this.settings.pickerMode = 'HSL';
			this.update(['color-rgb']);
		}
	}
}

/*Color Guide Tab - shades and tint variations, Color Harmonies, Recent Colors*/
ColorPanel.prototype.initColorGuide = function (colorGuide){

	//Title variants
	let titleBar = new Component('titleBarHeading');
	titleBar.addTitle('SHADES & TINTS');
	titleBar.appendTo(colorGuide);

	this.shadesGizmo = titleBar.addGizmo('numberDrag', 'shades-amount', '5%', '', setNewShade.bind(this));
	this.shadesGizmo.setFormat('number', 1, 99, '%');

	//submit
	function setNewShade(value){
		this.settings.shade = value;
		this.settings.autoShades = false;
		this.generateTintsShades();
	}

	//Variants Content
	let content = new Component('contentBox');
	content.appendTo(colorGuide);

	//Tints and shades (variants)
	let variants = new Component('frame');
	variants.appendTo(content);
	variants.setHeight('1');
	variants.DOM.id = 'color-variants';
	//Starting text
	let note = document.createElement('p');
	note.innerHTML = 'Open the color wheel to get started.';
	variants.DOM.appendChild(note);
	
	//Title Harmonies
	this.harmonyTitle = new Component('titleBarHeading');
	this.harmonyTitle.addTitle('COLOR HARMONY');
	this.harmonyTitle.appendTo(colorGuide);
	
	//Harmonies Content
	content = new Component('contentBox');
	content.appendTo(colorGuide);

	//Color Harmonies 
	let harmonies = new Component('frame');
	harmonies.appendTo(content);
	harmonies.setHeight('1');
	harmonies.DOM.id = 'color-harmonies';	

	//Harmonies Menu
	this.drawer['harmony'] = new Component('drawer', 'color-harmonies-options');
	this.drawer['harmony'].appendTo(harmonies);

	let lib = $_harmony,
		active = false,
		count = 0;
	//populate menu
	for (var name in lib){
		if (lib.hasOwnProperty(name)){			
			active = false;
			count++;

			if (name == this.settings.harmony) active = true;
			let action = 'harmony-'+count;

			this.drawer['harmony'].addButton('item', action, name).toggle(active).radio('harmony');
			this.drawer['harmony'].button[action].DOM.setAttribute('data-harmony', name);
			this.drawer['harmony'].button[action].callback = setHarmony.bind(this);

			function setHarmony(btn){
				this.settings.harmony = btn.getAttribute('data-harmony');
				this.generateHarmonies();
				this.update();
			}
		}
	}

	//Select Harmony
	harmonies.addButton('tab', 'color-harmonies-options', 'mdi-menu-down').toggleMenu(false);
}

/**Color Guide Modules**/

/*Tints and Shades Generator*/
ColorPanel.prototype.generateTintsShades = function (){

	//Sassy comeback
	let noteTxt = 'I can\'t seem to make tints or shades for this color.';

	let set = this.settings,
		amount = 5,
		luma = this.color.l,
		tint = 0,
		shade = 0,
		percent = 0,
		variants = document.getElementById('color-variants');

		//console.log('shades value:'+value);

		if (this.settings.autoShades){
			tint = Math.round((100-luma)/(amount+1));
			shade = Math.round(luma/(amount+1));
			percent = Math.min(tint, shade); //get smalles percentage to use as increment for shades and tints ... setting in menu for % / amount of swatches
			//output luma increments
			this.shadesGizmo.dynamicUpdate(percent, true);
			set.shade = percent;
		}else{
			//get user increments from input
			if (set.shade > set.maxShade) set.shade = set.maxShade;
			if (set.shade < 0) set.shade = 0;
			percent = set.shade;
			tint = Math.round((100-luma)/percent);
			shade = Math.round(luma/percent);
			amount = Math.max(tint, shade);
		}

		//empty out variant bar
		while (variants.lastChild){
			variants.removeChild(variants.lastChild);
		}

		if (percent <= 0 || percent >= 100) {			
			let note = document.createElement('p');
			note.innerHTML = noteTxt;
			variants.appendChild(note);
			return;	
		}
		
		//original reference color
		let refColor = [this.color.r, this.color.g, this.color.b, this.color.a],
			refSwatch = this.createSwatchPreset(refColor, 'reference')

		refSwatch.title = this.color.getHSLA();
		variants.appendChild(refSwatch);

		//create shades and tints
		let shadesAndTints = document.createElement('section');
		variants.appendChild(shadesAndTints);

		//copy color
		var t = this.temp,
			pW = variants.offsetWidth-10;

		//Create new set of shades
		let shadeBox = document.createElement('section');
		shadesAndTints.appendChild(shadeBox);

		for (var i = 1; i <= amount; i++){
			let newShade = (luma-i*percent);

			if (newShade <= 0) break;

			t.setHSL(this.color.h, this.color.s, newShade);
			let color = [t.r, t.g, t.b, t.a],
			newSwatch = this.createSwatchPreset(color, 'variant');
			newSwatch.title = t.getHSLA();
			shadeBox.appendChild(newSwatch);
		}

		//Create new set of tints
		let tintBox = document.createElement('section');
		shadesAndTints.appendChild(tintBox);

		for (var i = 1; i <= amount; i++){			
			let newTint = (luma+i*percent);

			if (newTint >= 100) break;
			
			t.setHSL(this.color.h, this.color.s, newTint);
			let color = [t.r, t.g, t.b, t.a],
			newSwatch = this.createSwatchPreset(color, 'variant');
			newSwatch.title = t.getHSLA();
			tintBox.appendChild(newSwatch);
		}
}

/*Color Harmonies*/
ColorPanel.prototype.generateHarmonies = function (){
	var harmony = $_harmony[this.settings.harmony],
		value = [],
		c = this.color;

	for (var i = 0; i < harmony.length; i++){
		let hmy = harmony[i];			

		var t = this.temp,
			h = hmy[0],
			s = hmy[1],
			l = hmy[2];
		
		t.setHSL(rotateHue(c.h, h), Math.abs(c.s+s), Math.abs(c.l+l));
		value.push([t.r, t.g , t.b, 1]);
	}

	function rotateHue(h, deg){
		deg = h+deg;
		if (deg > 360) deg = deg - 360;
		if (deg < 0) deg = 360 - deg;
		return deg;
	}

	let hBox = document.getElementById('color-harmonies')

	//remove old swatches
	let oldSwatch = document.querySelectorAll('#color-harmonies .preset');
	for (var i = 0; i < oldSwatch.length; i++){
		hBox.removeChild(oldSwatch[i]);
	}
	if (c.r < 10 && c.g < 10 && c.b < 10) return;

	//update name
	this.harmonyTitle.updateTitle(this.settings.harmony);

	//create swatches
	for(var i =0; i < value.length; i++){
		newSwatch = this.createSwatchPreset(value[i], 'harmony');
		hBox.appendChild(newSwatch);
	}	
}

/*Capture Recent Colors from main*/
ColorPanel.prototype.setRecentColor = function (n){
	let maxRecent = 6,
		c = this.colors[n-1],
		rgba = [c.r, c.g, c.b, c.a];

	if (rgba[3] == 0) return;

	//create recent sub panel if there are no recent colors yet - only once per operation
	if (this.recentColor.length == 0){
		var panel = document.getElementById('color-guide'),
			comp = document.createElement('div');
		comp.id = 'color-recent';
		panel.appendChild(comp);
	}

	//Stop operation if recent color already exists in list
	for (var i =0; i < this.recentColor.length; i++){
		let rec = this.recentColor[i];
		if (rec[0] == rgba[0] && rec[1] == rgba[1] && 
			rec[2] == rgba[2] && rec[3] == rgba[3]) {
			return;		
		}
	}

	//create element if below limit
	if (this.recentColor.length < maxRecent){
		let parent = document.getElementById('color-recent'),
			newSwatch = this.createSwatchPreset(rgba, 'small');

		parent.insertBefore(newSwatch, parent.firstChild);
	}

	//Add to list
	this.recentColor.unshift(rgba);
	if (this.recentColor.length > maxRecent) this.recentColor.pop();
	
	//shift colours up if max swatches, replace colour values of existing DOM elements
	if (this.recentColor.length == maxRecent){
		let swatch = document.querySelectorAll('#color-recent .preset');
			

		for (var i = 0; i < this.recentColor.length; i++){
			let value = this.recentColor[i];
			swatch[i].style.backgroundColor = 'rgba('+value[0]+', '+value[1]+', '+value[2]+', '+value[3]+')';
			swatch[i].setAttribute('data-color', value);
		}
	}
}
/**-End Color Guide Modules-**/


/*Custom Colors Tab - User swatches*/
ColorPanel.prototype.initColorCustom = function (colorCustom){

	//Title
	let titleBar = new Component('titleBarHeading');
	titleBar.appendTo(colorCustom);
	titleBar.addTitle('CUSTOM');
	
	//swatches box
	let custom = new Component('contentBox', 'color-swatches');
	custom.appendTo(colorCustom);
	custom.setHeight('2');
	custom.addButton('function', 'add-swatch', 'mdi-plus');

	custom.mapButtons({
		'add-swatch' : newSwatch.bind(this)
	});
	function newSwatch(){
		let rgba = [this.color.r, this.color.g, this.color.b, 1];
		this.newCustomSwatch(rgba);
	}

	//experimental gizmo
	//this.ui['userswatches'] = custom.addGizmo('itemDrag', 'custom-colors');
	//custom.activateGizmos();

	//bottom menu - delete icon
	let menu = new Component('bottomMenu');
	menu.appendTo(colorCustom);
	menu.setHeight('3');
	menu.addButton('function', 'del-swatch', 'mdi-delete-forever');
	menu.mapButtons({
		'del-swatch' : deleteCustom.bind(this)
	});

	function deleteCustom(){
		let preset = custom.DOM.childNodes;

		for (let i = 0; i < preset.length; i++){
			if (typeof preset[i].dataset.active != 'undefined') {
				this.removePreset(preset[i]); 
				break;
			}
		} 
	}


}

//Adds current selected (and active color) to customs
ColorPanel.prototype.newCustomSwatch = function (rgba){

	//check if preset already exists
	for (var i = 0; i < this.presetColor.length; i++){
		let preset = this.presetColor[i];
		if (preset[0] == rgba[0] && preset[1] == rgba[1] && 
			preset[2] == rgba[2] && preset[3] == rgba[3]) {
			this.msg.newMsg('This custom color already exists.', 1500);
			return;		
		}
	}

	//Add custom to data list
	this.presetColor.push(rgba);

	//Create DOM swatch
	let swatches = document.getElementById('color-swatches'),
		newSwatch = this.createSwatchPreset(rgba, 'medium', 'delete');

	swatches.insertBefore(newSwatch, swatches.lastChild);

	//order items for user dragging
	//this.ui['userswatches'].orderItems();

	//new custom swatch added message
	this.msg.newMsg('New custom swatch added.', 1500);
	this.showActivePresets();
}
/*End Custom Colors Tab*/

/*Color Books Tab*/
//Load Color Books from Swatches file
ColorPanel.prototype.initColorBooks = function (colorBooks){

	//Library title
	let titleBar = new Component('titleBarHeading');
	titleBar.appendTo(colorBooks);
	titleBar.addTitle('LIBRARY');

	//library presets content
	let colorLib = new Component('contentBox', 'color-library');
	colorLib.appendTo(colorBooks);
	colorLib.setHeight('2');

	//Open library swatch archive
	this.drawer['books'] = new Component('drawer', 'color-books-options');
	this.drawer['books'].appendTo(colorBooks);
	this.drawer['books'].setHeight('1');

	let lib = $_library,
		count = 0,
		active;
	for (var name in lib){
		if (lib.hasOwnProperty(name)){
			
			active = false;
			count++;

			if (name == this.settings.colorBook) active = true;
			let action = 'book-'+count;

			this.drawer['books'].addButton('item', action, name).toggle(active).radio('colorbooks');
			this.drawer['books'].button[action].DOM.setAttribute('data-book', name);
			this.drawer['books'].button[action].callback = setBook.bind(this);

			function setBook(btn){
				this.settings.colorBook = btn.getAttribute('data-book');
				this.loadColorBook(this.settings.colorBook);
			}
		}
	}
	titleBar.addButton('tab', 'color-books-options', this.settings.colorBook).toggleMenu().toggleHeight(false);
	titleBar.button['color-books-options'].setLabel('mdi-menu-down', true);
	//Load in first default set
	this.loadColorBook(this.settings.colorBook);

	//bottom menu - delete icon
	let menu = new Component('bottomMenu');
	menu.appendTo(colorBooks);
	menu.setHeight('3');
	menu.addButton('function', 'add-swatch', 'mdi-plus-box-outline');
	menu.mapButtons({
		'add-swatch' : addToSwatches.bind(this)
	});
	function addToSwatches(){
		let rgba = [this.color.r, this.color.g, this.color.b, 1];
		this.newCustomSwatch(rgba);
	}
}
/*End Color Books Tab*/


/**Color Books Modules**/
ColorPanel.prototype.loadColorBook = function (bookName){
	let colorBook = document.getElementById('color-library'),
		book = $_library[bookName];

	if (typeof book == 'undefined'){
		console.log('Trying to load invalid color book.');
		return;
	}

	//remove old swatches
	let oldSwatch = document.querySelectorAll('#color-books .preset');
	for (var i = 0; i < oldSwatch.length; i++){
		colorBook.removeChild(oldSwatch[i]);
	}

	//Set titlebar button
	let btn = document.querySelector('#color-books .title-bar button');
	btn.firstChild.innerHTML = bookName;

	//Populate with swatches
	for (let i = 0; i < book.length; i++){
		let color = book[i].slice(0,3),//book[i].length>4?book[i].slice(0,-1):book[i],
			name = book[i][4] || getHex(color[0], color[1], color[2]);
		
		color.push(1);//aplha
		let newSwatch = this.createSwatchPreset(color, 'medium', 'add');
		
		newSwatch.title = name;//...temporary
		colorBook.appendChild(newSwatch);
	}
	this.showActivePresets();
}
/**-End Color Books Modules-**/



/**---SWATCH MODULES---**/


ColorPanel.prototype.createSwatchPreset = function (value, type, special){
	let newSwatch = document.createElement('div');
	newSwatch.setAttribute('data-color', value);
	newSwatch.className = 'preset '+type;

	if (value[3] == 0){		
		newSwatch.style.backgroundImage = 'url(assets/images/light.png)';
	}
	else {
		newSwatch.style.backgroundImage = '';		
	}

	newSwatch.style.backgroundColor = 'rgba('+value[0]+', '+value[1]+', '+value[2]+', '+value[3]+')';

	//generate shades?
	let makeVariants = !(type == 'variant'),
		makeHarmonies = !(type == 'harmony');

	//click action
	newSwatch.addEventListener(pointerEvent['click'], assignSwatch.bind(this), false);
	function assignSwatch(e){
		let swatch = e.target;

		//Assign color to user swatch if not already active
		if (typeof swatch.dataset.active == 'undefined'){
			let autoSwitchBack = false;

			if (e.button === 2) {
				autoSwitchBack = true;
				this.switchActiveColor(2);
			}
			else if (this.autoSwitch) this.switchActiveColor(1);

			let color = swatch.getAttribute('data-color'),
				rgba = color.split(','); 
			this.color.setRGBA(rgba[0], rgba[1], rgba[2], rgba[3]);

			if (makeVariants) {
				this.settings.autoShades = true;
				this.generateTintsShades(); 		
			}
			if (makeHarmonies) this.generateHarmonies();

			this.update();

			if (autoSwitchBack) this.switchActiveColor(1);
		}
		//special function if already active (self inflicted), not for touch
		else {
			/*if (special == 'delete') {
				
				let nodeTo = document.getElementById('color-custom');
				animateNode(swatch, nodeTo, 20, 20, true);

				this.removePreset(swatch);
			}
			if (special == 'add') {
				let rgba = [this.color.r, this.color.g, this.color.b, 1];
				this.newCustomSwatch(rgba);
				let nodeTo = document.getElementById('panel-color');
				animateNode(swatch, nodeTo, 10, 110);
			}	*/		
		}
	}
	
	return newSwatch;
}

ColorPanel.prototype.removePreset = function (swatchDOM){
	let color = swatchDOM.getAttribute('data-color');
	if (!color) return;

	//remove preset DIV from DOM
	swatchDOM.parentNode.removeChild(swatchDOM);

	//remove from data
	let rgba = color.split(',');
	for (let i = 0; i < this.presetColor.length; i++){
		let pc = this.presetColor[i];

		if (pc[0] == rgba[0] && pc[1] == rgba[1] && pc[2] == rgba[2] && pc[3] == rgba[3]){
			this.presetColor.splice(i, 1);
			break;
		}		
	}
}

ColorPanel.prototype.showActivePresets = function (){
	var swatches = document.getElementsByClassName('preset');

	for (let i = 0; i < 2; i++){
		var c = this.colors[i],
			color = c.r+','+c.g+','+c.b+','+c.a; 

		for (var s = 0; s < swatches.length; s++){
			let swatch = swatches[s],
				val = swatch.dataset.color;
			
			if (val == color) {
				if ((i+1) == this.activeSwatch)
				swatch.setAttribute('data-active', '');
				swatch.setAttribute('data-mode', i+1);

			}
			else {
				if ((i+1) == this.activeSwatch)
				swatch.removeAttribute('data-active');
				if (swatch.dataset.mode == (i+1))
					swatch.removeAttribute('data-mode');					
			}
		}		
	}	
}

//presets save and load
ColorPanel.prototype.getSwatchData = function (){
	let dataStr = '$presetSwatches:[',
		presets = this.presetColor;

	for (let i = 0; i < presets.length; i++){
		dataStr += presets[i].join(',');
		if (i < presets.length-1) dataStr += ',';
	}

	dataStr += ']';
	return dataStr;
}

ColorPanel.prototype.setSwatchData = function (presets){
	
	//clear old presets
	let dom = document.querySelectorAll('#color-swatches .preset');

	for (let p = 0; p < dom.length; p++){
		this.removePreset(dom[p]);
	}

	//decode file string and populate
	let amount = presets.length / 4,
		item = 1;

	for (let c = 0; c < amount; c++){
		let color = [];
		for (let i = c*4; i < (c+1)*4; i++){
			color.push(presets[i])
		}
		this.newCustomSwatch(color);		
	}
}

//for setting the P or S colour externally
ColorPanel.prototype.setColor = function (rgba, activeColor){
	
	if (this.activeSwatch == 2) activeColor = 1;

	this.colors[activeColor].setRGBA(rgba[0], rgba[1], rgba[2], rgba[3]);
	this.update();
	this.generateTintsShades(); 		
	this.generateHarmonies();
}

ColorPanel.prototype.update = function (exceptions){

	if (!exceptions) exceptions = [];

	//update SL Graph & H Bar 
	let drawGraph = (exceptions.indexOf('color-graph') < 0 && this.settings.pickerMode == 'HSL');	
	this.HSLgizmo.gizmo['color-graph'].update(this.color, drawGraph);

	//update RGB bars
	if (exceptions.indexOf('color-rgb') < 0 && this.settings.pickerMode == 'RGB')
	this.RGBgizmo.gizmo['color-rgb'].update(this.color);

	//update DOM Hex Value Input
	if (exceptions.indexOf('color-value') < 0)
	this.controls.gizmo['color-value'].update(this.color.getHex());

	//hue bar value-only update
	this.HSLgizmo.gizmo['color-hue'].update(this.color);

	//highlight swatches matching color
	this.showActivePresets();

	//update user swatches color
	for (let i = 0; i < 2; i++){
		let swatch = document.getElementsByClassName('ui-swatch')[i];
		
		if (this.colors[i].a == 0){	
			if (swatch.style.backgroundImage == '')	
			swatch.style.backgroundImage = 'url(assets/images/light.png)';
		}
		else {
			swatch.style.backgroundImage = '';
			swatch.style.backgroundColor = this.colors[i].getRGBA();
		}	
		
		swatch.title = this.colors[i].getHSLA();
	}	
}

