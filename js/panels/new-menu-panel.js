
var appMenuPanel = function (parent){
	this.parent = '#app-container';

	this.version = '???';

	//component reference
	this.splash;

	//New project parameters (defaults) - used as values here, later used as reference to w/h/name gizmos associated with panel
	this.file = {
		template : 'STANDARD',
		sprite : {} //reference to sprite
	};

	this.templates = [ 
		[16, 16, 'TINY'],
		[32, 32, 'STANDARD'],
		[64, 64, 'LARGE'],
		[128, 128, 'XTRA']
	];

	//when okay is clicked - set in main
	this.submit = function (){};
		
	//UI
	this.ui = {
		values : {},					//Store values
		updateCallback : function(){} 	//function to run when ui updates - set in main on init
	};
}

appMenuPanel.prototype.updateValues = function (key, value, skipCallback){
	this.ui['values'][key] = value;
	if (!skipCallback) this.ui.updateCallback(this.ui['values']);

	//makes a copy name to newname
	//if (this.ui[copyKey]) this.ui[copyKey].update(value);
}

//must be run when window opens in main - gets properties from sprite and app props
appMenuPanel.prototype.config = function (mainSprite){
	//update ui values

	this.file.sprite = mainSprite;
	this.ui['wBox'].update(32); //default size
	this.ui['hBox'].update(32);
	this.ui['wBox'].pair.set(this.ui['hBox'], 'aspect');

	this.ui['newName'].update('New Sprite');

	if (typeof this.ui['name'] != 'undefined') {
		this.ui['name'].update(mainSprite.name);
		this.ui.values['name'] = mainSprite.name;
	}else{
		this.ui.values['name'] = 'New Sprite';
	}
	this.ui.values['width'] = 32;
	this.ui.values['height'] = 32;
}

appMenuPanel.prototype.init = function (type, toggleMain){
	//toggleMain : sets a var from main program true/false when any menu opens or closes

	this.splash = new Component('splashPanel');
	this.splash.appendTo(this.parent);

	let win = this.splash.createWindow('file', type=='startup', function(){
		toggleMain = false;
	});	
	let title;
	let frame;
	let topMenu;
	let projName;
	let startBtnName = "LET'S GO";

	//Sub Panels
//--top splash image area
	if (type == 'startup'){
		let top = new Component('classBox', 'splash-image');
		top.appendTo(win);
		//--APP TITLE / VERSION
		let titleId = new Component('contentBox');
		
		titleId.appendTo(top);
		titleId.DOM.removeAttribute('data-height');
		titleId.addText('VERSION '+this.version);
	}	

	//--Current Project
	if (type == 'full'){
		startBtnName = 'CREATE NEW SPRITE'
		topMenu = new Component('topMenu');
		topMenu.appendTo(win);

		let currentProject = new Component('subPanel', 'project-current-menu');
		currentProject.appendTo(win);
		currentProject.setHeight('3');

	//--- current project options
		let column = new Component('classBox', 'col');
		column.appendTo(currentProject);

	//--- set this project's name
		projName = new Component('classBox', 'project-name');
		projName.appendTo(column);

		title = new Component('titleBarHeading');
		title.addTitle('Project Name');
		title.appendTo(projName);
	//--- input field / name
		this.ui['name'] = projName.addGizmo('textBox', 'project_name', '---', '', addName.bind(this));
		function addName(val){
			this.updateValues('name', val);
		}

	//--FIle
		let projFile = new Component('classBox', 'project-name');
		projFile.appendTo(column);

		title = new Component('titleBarHeading');
		title.addTitle('FILE');
		title.appendTo(projFile);
	// --- SAVE/EXPORT
		let panelMenu = new Component('frame');
		panelMenu.setHeight('2');
		panelMenu.appendTo(projFile);
		this.ui['save'] = panelMenu.addButton('cta', 'file-save', 'SAVE SPRITE');


	//--- sprite info and export
		column = new Component('classBox', 'col');
		column.appendTo(currentProject);

		title = new Component('titleBarHeading');
		title.addTitle('SPRITE INFO');
		title.appendTo(column);

		let projSprite = new Component('classBox', 'sprite-preview');
		projSprite.appendTo(column);

		frame = new Component('frame');
		frame.appendTo(projSprite);
		frame.setHeight('2');

		//canvas 
		let prev = document.createElement('canvas');
		frame.DOM.appendChild(prev);
		prev.width = 150;
		prev.height = 150;

		let spriteInfo = new Component('classBox', 'sprite-info');
		spriteInfo.appendTo(projSprite);
		spriteInfo.addText('Sprite Informations')

	}

//--New / LOAD MENU
//--left start area
	let newProject = new Component('subPanel', 'project-new-menu');
	newProject.appendTo(win);

	let leftPanel = new Component('classBox', 'choose');
	leftPanel.appendTo(newProject);

	if (type == 'startup'){
		title = new Component('titleBar');
		title.addTitle('CHOOSE PROJECT');
		title.appendTo(leftPanel);		
	}

	//--- continue/load
	title = new Component('titleBarHeading');
	title.addTitle('IMPORT FROM FILE');
	title.appendTo(leftPanel);

	// --- options - load sprite/ load gif / load spritesheet png
	let importMenu = new Component('frame');
	importMenu.setHeight('2');
	importMenu.appendTo(leftPanel);
	this.ui['load'] = importMenu.addButton('cta', 'file-open', 'LOAD SPRITE');

	// --- new from template
	title = new Component('titleBarHeading');
	title.addTitle('NEW FROM TEMPLATE');
	title.appendTo(leftPanel);
	// --- options - various presets
	let templatesFrame = new Component('frame');
	templatesFrame.setHeight('2');
	templatesFrame.appendTo(leftPanel);

	let temp = this.templates;
	for (let t = 0; t < temp.length; t++){
		templateCol(temp[t][0], temp[t][1], temp[t][2], this);
	}

//--right custom area
	let rightPanel = new Component('classBox', 'custom');
	rightPanel.appendTo(newProject);
	rightPanel.setHeight('4');

	if (type == 'startup'){
		title = new Component('titleBar');
		title.addTitle('CUSTOMIZE NEW PROJECT');
		title.appendTo(rightPanel);
	}

	// --- project name
	projName = new Component('classBox', 'project-name');
	projName.appendTo(rightPanel);

	title = new Component('titleBarHeading');
	title.addTitle('Project Name');
	title.appendTo(projName);
	// -- input field / name
	this.ui['newName'] = projName.addGizmo('textBox', 'project_name', '---', '', setName.bind(this));
	function setName(val){
		this.updateValues('name', val, true);
	}
	//--- size
	let projSize = new Component('classBox', 'project-size');
	projSize.appendTo(rightPanel);

	title = new Component('titleBarHeading');
	title.addTitle('Sprite Dimensions');
	title.appendTo(projSize);

	frame = new Component('frame');
	//frame.DOM.className += ' wide';
	frame.appendTo(projSize);

	this.ui['wBox'] = frame.addGizmo('textBox', 'project_width', 32, 'width$px', setWidth.bind(this));
	this.ui['wBox'].setFormat('number', 1, 480);
	function setWidth(val){
		highlightActiveTemplate(this);
		this.updateValues('width', val);
	}
	this.ui['hBox'] = frame.addGizmo('textBox', 'project_height', 32, 'height$px', setHeight.bind(this));
	this.ui['hBox'].setFormat('number', 1, 480);
	function setHeight(val){		
		highlightActiveTemplate(this);
		this.updateValues('height', val);
	}

	this.ui['wBox'].pair.set(this.ui['hBox'], 'aspect');
	//aspect ratio toggle
	let aspect = frame.addButton('aspect', 'aspect-toggle', 'mdi-link').toggle(true, 'mdi-link-off');
	aspect.addAction(aspectToggle.bind(this));
	function aspectToggle(){
		this.ui['wBox'].pair.toggle();
	}

	function highlightActiveTemplate(_this){	
		let w = _this.ui['wBox'].value,
			h = _this.ui['hBox'].value;

		//highlight that with corresponding w h values
		let temp = document.querySelectorAll('div.template');
		for (let i = 0; i < temp.length; i++){
			temp[i].removeAttribute('data-active');
			let size = temp[i].getAttribute('data-size').split(',');
			if (w == size[0] && h == size[1]) {
				temp[i].setAttribute('data-active','');
			}
		}			
	}

	//--- background settings
	let projBg = new Component('classBox', 'project-bg');
	projBg.appendTo(rightPanel);

	title = new Component('titleBarHeading');
	title.addTitle('Background Settings');
	title.appendTo(projBg);	

	frame = new Component('frame');
	frame.DOM.className += ' wide';
	frame.appendTo(projBg);

	let bg = [
		'light',
		'dark',
		'color',
		'image'
	];

	for (let i = 0; i < 4; i++){
		let swatchBox = document.createElement('section');
		swatchBox.className = 'swatch';
		frame.DOM.appendChild(swatchBox);

		let newSwatch = document.createElement('div'),
			swatchTitle = document.createElement('div');

		newSwatch.className = 'preset options';
		newSwatch.setAttribute('data-preset',bg[i]);
		swatchTitle.innerHTML = bg[i];
		swatchBox.appendChild(newSwatch);
		swatchBox.appendChild(swatchTitle);
	}

//--- start btn
	rightPanel.addButton('cta', 'project-new', startBtnName);
	rightPanel.mapButtons({
		'project-new' : this.submit.bind(this)
	});

//--- Templates cards
	function templateCol(w, h, text, _this){

		let templateDefault = 'STANDARD';//this.file.template;

		let col = new Component('classBox', 'template');
		col.addText(text);
		col.addText(w+'&times;'+h);
		col.DOM.setAttribute('data-size', w+','+h);

		//template thumbnail
		let tmb = document.createElement('figure');
		tmb.style.width = w+'px';
		tmb.style.height = h+'px';

		col.DOM.appendChild(tmb);
		col.appendTo(templatesFrame);

		//set one to active
		if (text == templateDefault) col.DOM.setAttribute('data-active', '');

		//action
		col.DOM.addEventListener('click', function (e){
			let siblings = col.DOM.parentNode.childNodes,
				size = col.DOM.getAttribute('data-size').split(',');

			//deselect siblings
			for (let s = 0; s < siblings.length; s++){
				siblings[s].removeAttribute('data-active');
			}

			col.DOM.setAttribute('data-active', '');
			//add template dimensions
			_this.ui['wBox'].update(size[0]);
			_this.ui.values['width'] = size[0];
			_this.ui['hBox'].update(size[1]);
			_this.ui.values['height'] = size[1];
		}, false);
	}

	//Tabs
	if (type == 'full'){
		console.log('menu -- '+type+' topmenu');
		topMenu.addButton('tab', 'project-current-menu', 'CURRENT PROJECT').toggleMenu(true).radio('mainmenu');
		topMenu.addButton('tab', 'project-new-menu', 'NEW PROJECT').toggleMenu(false).radio('mainmenu');
		//Close Button
		topMenu.addButton('function', 'file-close', 'mdi-close');
		topMenu.mapButton('file-close', closeWindow.bind(this));	
	}

	function closeWindow(){
		this.splash.hideWindow();
		toggleMain = false;
	}

	//makes splash visible
	//this.splash.showWindow();
}