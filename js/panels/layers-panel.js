var LayersPanel = function(){

	this.thumbSize = 35;
	this.thumb; // active thumb

	this.title = 'LAYERS';

	this.panel;

	//list of cards
	this.card = {};

	//UI
	this.panelMenu;
	this.layerTools;
	this.layerTitle;
	this.artboardTools;

	//Resizing
	this.artboard = {
		anchor : [0,0],//row,col
		aspectLock : true,
		width : 32,
		height : 32,
		ui : {}, //ref to w+h gizmos in resize panel
		update : this.updateArtboardPanel
	}

	this.settings = {
		isolateLayer : false,
		showGrid : true,
		showGuides : true,
		background : 'light'
	}

	//menus
	
}

LayersPanel.prototype.init = function(){
	this.panel = new Component('panel', 'panel-layers');
	this.panel.appendTo('#workspace');

	//Top Menu
	this.panelMenu = new Component('topMenu');
	this.panelMenu.appendTo(this.panel);

	//Layers Panel
	let layersMain = new Component('subPanel', 'layers-thumbs');
	layersMain.appendTo(this.panel);
	layersMain.setHeight('3');	

	//Layers panel title
	this.titleBar = new Component('titleBarThin');
	this.titleBar.addTitle('LAYERS');
	this.titleBar.addButton('function', 'layers-all', 'bb-icon-layer-all').toggle();
	this.titleBar.appendTo(layersMain);
	

	//Artboard Panel
	let artboardMain = new Component('subPanel', 'layers-artboard');
	artboardMain.appendTo(this.panel);
	artboardMain.setHeight('3');

	//Artboard panel title	
	let titleBar = new Component('titleBarThin');
	titleBar.addTitle('ARTBOARD');
	titleBar.appendTo(artboardMain);

	//Generate Content
	this.initArtboardPanel(artboardMain);

	//Top Menu Buttons (contains refs to layers & artboard panels)
	this.panelMenu.addButton('tab', 'layers-thumbs', 'mdi-layers').toggleMenu(true).radio('l1', true);
	this.panelMenu.addButton('tab', 'layers-artboard', 'mdi-image').toggleMenu(false).radio('l1', true);
	this.panelMenu.addButton('function', 'file-menu', 'mdi-menu');

	//Thumbnail cards
	let layerThumbs = new Component('contentBox', 'layers-cards');
	layerThumbs.setHeight('2');
	layerThumbs.appendTo(layersMain);

	//Bottom Touch Controls
	this.layerTools = new Component('bottomMenu', 'layers-control');
	this.layerTools.appendTo(layersMain);
	this.layerTools.setHeight('1');

	this.layerTools.addButton('function', 'layers-add', 'mdi-plus');
	this.layerTools.addButton('function', 'layers-up', 'mdi-arrow-up');
	this.layerTools.addButton('function', 'layers-down', 'mdi-arrow-down');
	this.layerTools.addButton('function', 'layers-duplicate', 'mdi-content-duplicate');
	this.layerTools.addButton('function', 'layers-delete', 'mdi-delete');

	artboardMain.activateGizmos();
}

LayersPanel.prototype.initArtboardPanel = function(artboardMain){
	
	//Artboard panel contents
	let content = new Component('contentBox');
	content.appendTo(artboardMain);

	//--- resize sub function
	//Resize Title
	let subtitle = new Component('titleBarBare');
	subtitle.addTitle('RESIZE SPRITE');
	subtitle.appendTo(content);
	
	let frame = new Component('frame');
	frame.appendTo(content);

	//Anchor Box
	let anchorBox = new Component('idBox', 'artboard-anchor');
	anchorBox.appendTo(frame);

	let block = [];
	for (let i = 0; i < 9; i++){
		//arrow contents
		let span = document.createElement('span');
		//block
		block.push(document.createElement('div'));
		block[i].appendChild(span);
		block[i].setAttribute('data-anchor', i);
		anchorBox.DOM.appendChild(block[i]);
		
		let _this = this;
		block[i].addEventListener(pointerEvent['click'], function(e){
			let blk = e.currentTarget,
				n = blk.dataset.anchor;
			_this.artboard.anchor = setAnchor(n);

		}, false)
	}
	
	this.artboard.anchor = setAnchor(4);	


	function setAnchor(posIndex){
		//icons
		var icons = [
			'mdi mdi-arrow-top-left',
			'mdi mdi-arrow-up',
			'mdi mdi-arrow-top-right',
			'mdi mdi-arrow-left',
			'mdi mdi-square',
			'mdi mdi-arrow-right',
			'mdi mdi-arrow-bottom-left',
			'mdi mdi-arrow-down',
			'mdi mdi-arrow-bottom-right',
		],
		offset = 4-posIndex,
		posRow = Math.floor(posIndex/3),
		posCol = posIndex - (posRow*3),
		skipCol = -1;

		if (posCol == 2) skipCol = 0;
		if (posCol == 0) skipCol = 2;

		for (let i = 0; i < 9; i++){
			let blockRow = Math.floor(i/3),
				blockCol = i - (blockRow*3);

			block[i].removeAttribute('data-active');
			let span = block[i].firstChild;
			if (i+offset >= 0 && blockCol != skipCol){
				span.className = icons[i+offset];
			}
			else span.className = '';
		}
		block[posIndex].setAttribute('data-active','');
		return [posCol, posRow];
	}

	//Width and Height Gizmos
	let sizeBox = new Component('idBox', 'artboard-size');
	sizeBox.appendTo(frame);

	this.artboard.ui['w'] = sizeBox.addGizmo('numberDrag', 'art-width', this.artboard.width, 'width', setWidth.bind(this));
	this.artboard.ui['w'].setFormat('number', 1, 480);
	this.artboard.ui['w'].drag.setDirection('y');
	this.artboard.ui['w'].drag.maxDist = 480;
	;
	function setWidth(val){
		this.artboard.width = val;
	}
	this.artboard.ui['h'] = sizeBox.addGizmo('numberDrag', 'art-height', this.artboard.height, 'height', setHeight.bind(this));
	this.artboard.ui['h'].setFormat('number', 1, 480);
	this.artboard.ui['h'].drag.setDirection('y');
	this.artboard.ui['h'].drag.maxDist = 480;
	function setHeight(val){
		this.artboard.height = val;
	}

	//aspect ratio toggle
	this.artboard.ui['w'].pair.set(this.artboard.ui['h'], 'aspect');
	sizeBox.addButton('aspect', 'aspect-toggle', 'mdi-link').toggle(this.artboard.aspectLock, 'mdi-link-off');
	var wBox = this.artboard.ui['w'];
	sizeBox.mapButtons({
		'aspect-toggle' : function (){
			wBox.pair.toggle();
		}
	});/**/

	//Resize Button
	content.addButton('cta', 'art-resize', 'RESIZE');
	
	//Grids & guides 
	let gridGuides = new Component('idBox', 'artboard-grids');
	gridGuides.appendTo(content);

	subtitle = new Component('titleBarBare');
	subtitle.addTitle('GRIDS & GUIDES');
	subtitle.appendTo(gridGuides);

	frame = new Component('frame');
	frame.appendTo(gridGuides);

	this.artboard.ui['hud'] = new Component('classBox', 'toggles');
	this.artboard.ui['hud'].appendTo(frame);
	this.artboard.ui['hud'].addButton('check', 'art-toggle-grid', 'show grid').toggle(this.settings.showGrid);
	this.artboard.ui['hud'].addButton('check', 'art-toggle-guide', 'show guides').toggle(this.settings.showGuides);

	//Clear Guides Button
	content.addButton('cta', 'art-guides-clear', 'CLEAR ALL');

	//Background
	let bgChoice = new Component('idBox', 'artboard-bg');
	bgChoice.appendTo(content);

	subtitle = new Component('titleBarBare');
	subtitle.addTitle('BACKGROUND');
	subtitle.appendTo(bgChoice);

	frame = new Component('frame');
	frame.appendTo(bgChoice);

	//Background options
	let bg = [
		'light',
		'dark',
		'color',
		'image',
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
	
		this.artboard.ui[bg[i]] = swatchBox;
	}
	this.artboard.ui['light'].setAttribute('data-active','');

	//image uploader

	//ref to this whole submenu
	this.artboardTools = content;
}

LayersPanel.prototype.setBgFunction = function (btnName, fn){
	let _this = this,
		bg = [
			'light',
			'dark',
			'color',
			'image',
		];

	this.artboard.ui[btnName].addEventListener(pointerEvent['click'], function(){
		fn(this);
		
		for (let i = 0; i < 4; i++){
			_this.artboard.ui[bg[i]].removeAttribute('data-active');
		}
		this.setAttribute('data-active', '');
	})
}

LayersPanel.prototype.updateArtboardPanel = function(w, h){
	this.width = w;
	this.height = h;
	this.ui['w'].update(w);
	this.ui['h'].update(h);
	this.ui['w'].pair.set(this.ui['h'], 'aspect');
}

//aka layerThumb
LayersPanel.prototype.addLayerCard = function(layerId, title, visible){
	

	this.card[layerId] = new Component('card', layerId);
	let card = this.card[layerId];

	card.appendTo('#layers-cards');
	card.setHeight('3');

	//add canvas thumb
	let canvas = document.createElement('canvas');
	canvas.width = this.thumbSize;
	canvas.height = this.thumbSize;

	card.DOM.appendChild(canvas);

	//add layer name to card - editable makes editable text, pass obj with ket to record new title
	card.addTitle(title).editable(sprite.layerProps(layerId), 'name');

	//add visibility toggle
	card.addButton('function', 'layers-visible', 'mdi-eye').toggle(visible, 'mdi-eye-off');

	//select new thumb card
	this.setActiveCard(layerId);

	return this.card[layerId];//return component so functions can be run on it from main
}


LayersPanel.prototype.deleteLayerCard = function(layerId){
	let layerCard = this.getLayerCard(layerId),
		parent = layerCard.parentNode;

	parent.removeChild(layerCard);
}


LayersPanel.prototype.deleteAllLayerCards = function(layerId){
	let parent = document.getElementById('layers-cards');

	while (parent.firstChild){
		parent.removeChild(parent.firstChild);
	}
}

LayersPanel.prototype.setCardVisibility = function(layerId, state){
	let thumbs = document.getElementsByClassName('card');

	for (let i = 0; i < thumbs.length; i++){
		let cardId = thumbs[i].getAttribute('data-card');
		if (cardId == layerId) {
			this.card[layerId].button['layers-visible'].toggle(state, 'mdi-eye-off');
			break;
		}
	}

}

LayersPanel.prototype.setActiveCard = function(layerId){
	let thumbs = document.getElementsByClassName('card');

	for (let i = 0; i < thumbs.length; i++){
		thumbs[i].removeAttribute('data-active');
		let cardId = thumbs[i].getAttribute('data-card');
		this.card[cardId].setHeight('4');

		if (cardId == layerId){
			thumbs[i].setAttribute('data-active','');
			this.card[cardId].setHeight('5');
			this.thumb = thumbs[i].firstChild;
		}
	}
}

LayersPanel.prototype.getLayerCard = function(layerId){
	let thumbs = document.getElementsByClassName('card');

	for (let i = 0; i < thumbs.length; i++){
		let cardId = thumbs[i].getAttribute('data-card');
		if (cardId == layerId){
			return thumbs[i];
		}
	}
}