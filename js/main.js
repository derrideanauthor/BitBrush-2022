/*Global vars*/
var props = {
	appTitle : 'Bit Brush - An online pixel art and sprite animation suite -  Beta v'+document.title,
	version : document.title,
	projectName : 'Untitled Project',
	artWidth : 32,
	artHeight : 32,
	artColor : "#ccc",
	artScale : 1,
	bg : {
		'light' : 'url(assets/images/light.png)',
		'dark' : 'url(assets/images/dark.png)',
		'medium' : 'url(assets/images/med.png)'
	},
	bgType : 'light',
	zoomFactor : .2,
	fullscreen : false,
	layerId : '',
	maxScale : 200,
	minScale : 2,
	artX : 0,
	artY : 0,
	artSX : 0,
	artSY : 0,
	pivotX : 0,
	pivotY : 0,
	autoPivotX : true,
	autoPivotY : true,
	mode : "draw", 			//global behaviour - i.e editing pixels (edit mode) should commit changes before going to other tools and draw mode
	onionSkin : false,
	onionSkinRange : [0,0], 	//amounts of frames to ghost L & R
	lockUI : false 			//used when menu is active to disable some of the UI
};

var project = {
	saved : false
}

var sprite = new Sprite(); //All frames, with their respective layer data

var layerElement, //current layer
	layerContext,
	layerCount = 1, //serves as unique ID num for layers - each canvas id = 'layer'+layerCount
	artUIElement, //reads mouse events and displays grids, guides, brush indicators
	artUIContext,
	hudElement,
	hudContext,
	artBgElement, //reference image or transparency image
	artBgContext,
	bufferElement,
	buffer;

var selection = {
	active : false
};

var clipboard = {
	x : 0,
	y : 0,
	w : 0,
	h : 0,
	clip : document.createElement('canvas'),
	cache : document.createElement('canvas'),
	user : false, //user copy - use cache
	show : false
};

var animation; //... used?

//cursor positions relative to artboard
var cursor = {
	mode : "primary", 
	pixelX : 0,
	pixelY : 0, 
	pixelSX : 0, //start draw pixel position
	pixelSY : 0,
	pixelPrevX : 0,	//previous position (as drawing)
	pixelPrevY : 0,
	pixelLastX : 0,	//last pixel position recorded on mouse up
	pixelLastY : 0,
	x : 0,
	y : 0,
	sx : 0,	//snap position ie just as you start to drag these coordinates are snapped
	sy : 0,
	drawing : false,
	pointerType : ''
};

var keys = {
	press : false,
	keyCode : 0,
	shift : false,
	alt : false,
	ctrl : false
};

//tool properties
var toolProps = {
	type : "brush",
	prevType : "",
	mode : "normal",
	pColor : new Color(),
	sColor : new Color(),
	size : 1,
	active : true //normal function can become inactive on dynamic tools
};

var hud = {
	showGrid : true,
	grid : 1,		//pixel grid
	gridBig : 0,	//larger grid divisions on top
	showGuides : true,
	guideX : [],
	guideY : []
};


var uiColor = {
	'primary' : 'rgb(32,62,243)',
	'secondary' : 'rgb(212,85,0)',
	'selection' : 'rgb(218,50,86)',
	'move' : 'rgb(27, 219, 163)' 
};

//hud.guideX.push(10);
// hud.guideX.push(30);
// hud.guideX.push(20);
// hud.guideY.push(30);

//history list (limit at 20)
var undolist = {
	state : [],
	maxEntry : 20,
	currentEntry : -1
};

//Event handlers
//check if pointer events suppoprted
if (window.PointerEvent){
	console.log('Ponter Events Supported.');
}
var pointerEvent = {
	'down' : window.PointerEvent ? 'pointerdown' : 'mousedown',
	'up' : window.PointerEvent ? 'pointerup' : 'mouseup',
	'move' : window.PointerEvent ? 'pointermove' : 'mousemove',
	'over' : window.PointerEvent ? 'pointerover' : 'mouseover',
	'out' : window.PointerEvent ? 'pointerout' : 'mouseout',
	'click' : window.PointerEvent ? 'click' : 'click'
}

//Components
var pRender = new Prerenderer(),	//renders or loads images used in UI
	mPanel = new MainPanel(),
	cPanel = new ColorPanel(),
	fPanel = new FramesPanel(),
	lPanel = new LayersPanel(),
	tPanel = new ToolsPanel(),
	hPanel = new HistoryPanel(), //for debug or adv users
	fMaster = new FileMaster(),

	fileWindow = new appMenuPanel(), //The file menu
	exportMenu = new ExportMenuPanel(),
	appHints = new tooltips(),
	appFeedback = new Component('popMsg');

//reload if version not up to date
//reloadVersion();

//Prerender UI for components that have graphics
pRender.render();


//window.onload = function () {

pRender.done = function(){
	
	document.title = props.appTitle;
	
	//Filereader
	fMaster.init(readFile);

	//popup messages - only one in app so that they can stack
	appFeedback.appendTo('#pasteboard');

	//Panels
	mPanel.init(appFeedback);
	tPanel.init();
	cPanel.init(toolProps.pColor, toolProps.sColor, appFeedback);
	fPanel.init();	
	lPanel.init();

	//setup history panel
	hPanel.init();
	hPanel.clickItem = function(index){
		getHistory(0, index);
	}

	//tool tips
	appHints.init();

	//Main App Functions
	appLaunch();
}

window.onbeforeunload = function(){
	let msg = 'Sure you wanna do that?';
	if (!project.saved)	return msg;
}

function appLaunch(){
	initPixelBuffer(); //add rawings to buffer before applying to layer
	
	createUILayer();
	//newCanvasSprite();

	initToolbars();

	artboardUIInit(); //track events on canvas and enables "draw()" when a drawing tool is selected
	updateHUD();

	zoomArtboard('fit');
}


function reloadVersion(){

	if (getCookie('bitbrushversion') != props.version){

		document.cookie = 'bitbrushversion='+props.version;
		location.reload(true);
		console.log('Bitbrush updated to version '+props.version);
	}
}

function newCanvasSprite (w, h){

	props.artScale = round(450/props.artWidth);

	//Erase old sprite if it exists
	if (sprite.frameData.length > 0) eraseCanvasSprite();

	//Create a sprite to start with
	sprite.init(w, h);
	fPanel.addThumb(sprite.frameNum, function(fnum){
		sprite.setFrame(fnum);
		updateArtboard();
	});
	fPanel.playPreview(sprite);

	//Create first layer for new sprite
	createLayer(1);		
	zoomArtboard('fit');
}

//Loading a file
function readFile(txt){
	var fileData;
	fileData = parseFileData(txt);


	var newW = fileData.width,
		newH = fileData.height;

	//Close any popup/splash menus
	let splashMenus = document.getElementsByClassName('splash-menu');
	for (let i = 0; i < splashMenus.length; i++){
		splashMenus[i].removeAttribute('data-active');
	}

	//erase existing sprite & Canvas == ... way convoluted but finally working (ussue is the loading wont work without existing spite)
	newCanvasSprite(newW, newH);
	eraseCanvasSprite();
	sprite.setSize(newW, newH);

	//recreate sprite data
	let frameData = fileData.frameData;
	sprite.setSpriteData(frameData);

	//resize canvas, ui and buffers
	props.artWidth = newW;
	props.artHeight = newH;
	bufferElement.width = props.artWidth;
	bufferElement.height = props.artHeight;

	//Recreate DOM layers
	let layerStack = fileData.layerStack
	
	for (let i = 0; i < layerStack.length; i++){
		//reconstruct sprite layerStack
		sprite.layerStack.push(layerStack[i]);
		//create canvas Layer
		createLayerCanvas(layerStack[i].id, layerStack[i].stackPos);
		//Make UI thumbnail
		createLayerThumb(layerStack[i].id);	
	}
	selectLayer(layerStack[layerStack.length-1].id);
	layerCount = fileData.layerStack.length+1;


	//recreate DOM frame thumbs
	let frameNum = 1;
	for (let f = 0; f < frameData.length; f++){
		//Create frame
		frameNum = frameData[f].num;
		fPanel.addThumb(frameNum, function(fnum){
			//thumb click goto action
			sprite.setFrame(fnum);
			updateArtboard();
		});
	}
	sprite.setFrame(frameNum);


	updateArtboard(true);
	fPanel.player.play = true;

	//Filename, swatches and prefs
	updateCanvasComponents(fileData)

	appFeedback.newMsg('File successfully imported.', 2000);
	zoomArtboard('fit');
}

function updateCanvasComponents(fileData){
	//from file, update project name and swatches and prefs

	//update project name
	props.projectName = fileData.projectName;
	sprite.name = props.projectName;

	//update document title (browser title)
	document.title = '['+props.projectName+'] - '+props.appTitle;

	//update artboard panel
	lPanel.artboard.update(sprite.width, sprite.height);

	//update custom swatches
	cPanel.setSwatchData(fileData.presetSwatches);
}


/*ARTBOARD*/

function eraseCanvasSprite(){
	console.log('Erasing old sprite');
	//Delete All Canvas Layers & thumbs/cards
	let layerStack =  sprite.layerStack;
	for (let i = 0; i < layerStack.length; i++) {
		let layerId = layerStack[i].id;
		let layer = document.getElementById(layerId);
		layer.parentNode.removeChild(layer);		
	}
	lPanel.deleteAllLayerCards();

	//Delete All frame thumbs
	fPanel.stopPreview();
	fPanel.removeAllThumbs();

	//Delete all sprite data
	sprite.erase();

	//reset layer id counter
	layerCount = 1;
}

/*-----------LAYERS---------------*/

function createLayer(stackNum, clone, hId, hName, hVis, hAlpha){
//hId, hName, hVis, hAlpha: optional - history uses this to create a new layer with saved properties

	//New Properties
	let layerName = hName || "Layer "+layerCount,
		layerId = hId || "layer"+layerCount,		
		visible = (typeof hVis != 'undefined') ? hVis : true,
		opacity = hAlpha || 1;

	//create a canvas "layer"
	createLayerCanvas(layerId, stackNum);

	//Setup Sprite LayerData Object
	let dataId = layerId;
	if (clone){
		dataId = sprite.layer.id;
		layerName = sprite.layer.name+' (copy)';
	}	
	sprite.addLayer(
		dataId,
		{
			name : layerName,
			id : layerId,
			visible : visible,
			opacity : opacity,
			stackPos : stackNum
		}
	);
	
	//if (typeof hId == 'undefined') { console.log('normal create'); 

	//Make UI thumbnail
	createLayerThumb(layerId);	
	
	updateDOMScale(); //applies scaling	

	//new unique ID num
	layerCount++;

	selectLayer(layerId);
}

function createLayerCanvas(layerId, stackNum){

	//Create corresponding DOM "layers"
	let parent = document.getElementById("pasteboard"),
	newLayer = document.createElement("canvas");
	newLayer.id = layerId;
	newLayer.className = "layer";
	newLayer.width = props.artWidth;
	newLayer.height = props.artHeight;
	newLayer.style.zIndex = stackNum;

	//Canvas context stay pixelly
	let newLayerCtx = newLayer.getContext("2d");
	newLayerCtx.imageSmoothingEnabled = false;
	newLayerCtx.clearRect(0,0,newLayer.width,newLayer.height);

	parent.appendChild(newLayer);
}

function createLayerThumb (layerId){

	let layerStack = sprite.layerProps(layerId),
		title = layerStack.name,
		visible = layerStack.visible,
		card = lPanel.addLayerCard(layerId, title, visible);

	card.addAction(
		['click', function (){	
			if (props.layerId != layerId){		
				selectLayer(layerId);
			}
		}]
	);

	card.mapButtons({
		'layers-visible' : toggleVisible
	});

	function toggleVisible(){
		toggleLayerVisibility(layerId);
	}

		// newThumb.style.background = "url(assets/images/light.png)";
  //   	newThumb.style.backgroundSize = "20px";

}

//**********Layer functions

function addNewLayer(clone){
	let newpos = parseInt(sprite.layer.stackPos)+1;
	createLayer(newpos, clone);
	updateDOMStack();
}

function selectLayer (layerId, history){

	//confirm clipped pixels
	if (props.mode == 'edit') destroySelection();

	layerElement = document.getElementById(layerId);
	layerContext = layerElement.getContext("2d");

	//note in layer properties
	props.layerId = layerId;

	//recreate an existing selection on new layer ... helpful?
	//remakeSelection();

	//tell sprite which layer is selected
	sprite.setLayer(layerId);

	//show active layer in layers panel
	lPanel.setActiveCard(layerId);

	//if layer isolation mode is on
	if (lPanel.settings.isolateLayer) {
		toggleLayerVisibility(props.layerId, true, true);
	}

	if (typeof history == 'undefined')
	setHistory('select layer');//saves initial state of layer


}

function deleteLayer (layerId){

	//remove from canvas & layercard from dom
	let layer = document.getElementById(layerId);
	layer.parentNode.removeChild(layer);
	lPanel.deleteLayerCard(layerId);
	
	//remove from array
	let nextLayerId = sprite.deleteLayer(layerId);

	//select other layer at deleted layer's position
	selectLayer(nextLayerId);	

	//update 
	updateArtboard(true);
}

function clearLayer(){
	setBuffer(props.layerId);
	buffer.clearRect(0, 0, props.artWidth, props.artHeight);
	putBuffer(layerContext, props.layerId);
	//update 
	updateArtboard(true);
}

function moveLayerToPos (newpos){

	sprite.moveLayer(newpos);
	updateDOMStack();
}

function toggleLayerVisibility (layerId, toggleAll, isolate, visibleAll){

	let thisLayer = sprite.layerProps(layerId) || sprite.layer;
	thisLayer.visible = visibleAll || isolate || !thisLayer.visible;

	if (isolate){
		lPanel.setCardVisibility(layerId, visibleAll || isolate);
	}

	if (toggleAll){
		let allLayers = sprite.layerStack;

		for (let i = 0; i < allLayers.length; i++){
			if (allLayers[i].id == layerId) continue;
			allLayers[i].visible = visibleAll || !thisLayer.visible;
			lPanel.setCardVisibility(allLayers[i].id, allLayers[i].visible);
		}
	}

	//panel setting -> sprite prop ... When in use?
	if (!sprite.showHiddenLayers) {
		sprite.makeLayerMixdown(true);
		fPanel.updateAllThumbs(sprite.frameData);
	}

	updateDOMStack();
}


//necessary DOM stack updates from layerStack
function updateDOMStack (){
	let layerStack = sprite.layerStack,
		stackLen = layerStack.length;

	//Put UI at the top
	artUIElement.style.zIndex = layerStack.length+3;
	hudElement.style.zIndex = layerStack.length+2;

	//Update layer z-indexes and thumbnail position, both in CSS
	for (let i = 0; i < stackLen; i++){
		let layerProp = layerStack[i];			

		let layerDOM = document.getElementById(layerProp.id);
		layerDOM.style.zIndex = layerProp.stackPos;
		layerDOM.style.visibility = layerProp.visible?'visible':'hidden';

		let thumb = lPanel.getLayerCard(layerProp.id);
		thumb.style.order = (stackLen-layerProp.stackPos+1).toString();
	}

	updateMinimap();
	updateHUD();

	//add new onion skins
	updateOnionSkin();
}

function updateLayerThumb(layerId){

	setBuffer(layerId);
	let thumb = lPanel.getLayerCard(layerId).firstChild;
	putThumb(thumb);
}

function updateMinimap(){
	
	let map = fPanel.minimap,
		mw = map.width,
		mh = map.height;



	//Set up preview projection to preview canvas
	let ratioW = 1,
		ratioH = 1,
		pw = parseInt(sprite.width),
		ph = parseInt(sprite.height),
		px = fPanel.viewfinder.px || 0,
		py = fPanel.viewfinder.py || 0;

	//fill minimap
	if (pw > ph){
		ratioW = (pw/ph);
		pw = Math.round(ratioW*mh);
		ph = mh;
	}
	else
	if (pw < ph){
		ratioH = (ph/pw);
		ph = Math.round(ratioH*mw);
		pw = mw;
	}
	else
	if (pw == ph){
		pw = mw;
		ph = mh;
	}


	//viewport bounds
	let view = document.getElementById("pasteboard"),
		w = artUIElement.width,
		h = artUIElement.height,
	    vx = -(props.artX/w) * pw,
		vy = -(props.artY/h) * ph,
		vw = view.offsetWidth/w * pw,
		vh = (view.offsetHeight)/h * ph;

/*	let yMax = (h-view.offsetHeight),
		xMax = (w-view.offsetWidth),
		cwRatio = (pw-mw) / xMax,
		chRatio = (ph-mh) / yMax;
	
	if (vx > 0){	
		if (props.artX > -xMax) px = props.artX*cwRatio;//px = -vx;
		else px = -xMax*cwRatio;	
	}else{
		let centerRatio = (view.offsetWidth/2 - props.artX) / (view.offsetWidth/2);
		px = 0;//-(centerRatio * (mw/2));
	}
	if (vy > 0){
		if (props.artY > -yMax) py = props.artY*chRatio;
		else py = -yMax*chRatio;
	}else{
		py = 0;
	}
*/

	let artCenterW = (view.offsetWidth/2) - props.artX,
		projCenterW = pw * (artCenterW/w),
		xMax = pw - mw;
		
	px = Math.round(mw/2 - projCenterW);
	if (px >= 0) px = 0
	else if (px <= -xMax) px = -xMax;

	let artCenterH = (view.offsetHeight/2) - props.artY,
		projCenterH = ph * (artCenterH/h),
		yMax = ph - mh;
		
	py = Math.round(mh/2 - projCenterH);
	if (py >= 0) py = 0
	else if (py <= -yMax) py = -yMax;
	

	fPanel.updateViewfinder(vx, vy, vw, vh, px, py, pw, ph); //viewfinder pos,size + projection pos,size 
	fPanel.updateMinimap(sprite.frame);
}


//***********UI Functions ***

//canvas for cursor, grids, guides
function createUILayer(){
	let parent = document.getElementById("pasteboard"),
		layerData = sprite.layerStack;

	//Interaction Layer (TOP)
	artUIElement = document.createElement("canvas");
	artUIContext = artUIElement.getContext("2d");
	artUIElement.id = "ui-layer";
	artUIElement.className = "layer";
	artUIElement.width = props.artWidth;
	artUIElement.height = props.artHeight;
    artUIElement.style.zIndex = layerData.length+3;
	parent.appendChild(artUIElement);

	//HUD layer - grids/guides - not scaling with css
	hudElement = document.createElement("canvas");
	hudContext = hudElement.getContext("2d");
	hudElement.id = "hud-layer";
	hudElement.className = "layer";
	hudElement.width = props.artWidth;
	hudElement.height = props.artHeight;
    hudElement.style.zIndex = layerData.length+2;

    parent.appendChild(hudElement);

	//Background/ReferenceLayer (BOTTOM)
	artBgElement = document.createElement("canvas");
	artBgContext = artBgElement.getContext("2d");
	artBgContext.imageSmoothingEnabled = false;

	artBgElement.id = "ref-layer";
	artBgElement.className = "layer";
	artBgElement.width = props.artWidth;
	artBgElement.height = props.artHeight;
    artBgElement.style.zIndex = "0";
	updateBgLayer(); 
	parent.appendChild(artBgElement);
}

function updateBgLayer (){
	//do logic for a reference source ...

	//transparency mesh default
	let pixelSize = 1*props.artScale,
		blockSize = pixelSize;

	if (isEven(props.artWidth)) blockSize = 4; 
		else blockSize = 5;

	let scale = 3;
	//if (props.artScale <= 2) scale = 2;
	//if (props.artScale >= 4) scale = .5;	
	//if (props.artScale >= 8) scale = .3;


	if (props.bgType == 'light' || props.bgType == 'dark'){
		artBgElement.style.background = props.bg[props.bgType];
    	artBgElement.style.backgroundSize = (blockSize*scale)+"px";
    	artBgElement.style.backgroundRepeat = 'repeat';
	}

	if (props.bgType == 'color'){
		artBgElement.style.background = cPanel.color.getHex();
		props.bgType = '';
	}
	
    if (props.bgType == 'image'){
		artBgElement.style.background = props.bg[props.bgType]+' #fff';
    	artBgElement.style.backgroundSize = 'contain';
    	artBgElement.style.backgroundPosition = 'center center';
    	artBgElement.style.backgroundRepeat = 'no-repeat';
		console.log('new bg: '+props.bg[props.bgType]);
	}


	/*var img = new Image();
	img.onload = function (){
		artBgContext.clearRect(0, 0, artBgElement.width, artBgElement.height);
		let pattern = artBgContext.createPattern(img, "repeat");
		artBgContext.fillStyle = pattern;
		artBgContext.fillRect(0, 0, artBgElement.width, artBgElement.height);
	}
	img.src = "assets/images/transparency-20.png";*/
}

//update grids, guides, etc
//pixelgrid lines ...future toggle on/off
function updateHUD (){
	let gridColor = "#666",
		guideColor = "cyan",
		ctx = hudContext,
		w = hudElement.width,
		h = hudElement.height,
		block = 1*props.artScale;
	
	ctx.clearRect(0, 0, w, h);
	ctx.imageSmoothingEnabled = false;
	ctx.translate(.5,.5);

	if (hud.showGrid && block > 6){
		
		ctx.strokeStyle = gridColor;
		ctx.lineWidth = 1;
		ctx.globalAlpha = .2;

		for (let i = 1; i < props.artHeight; i++){
			let step = Math.round(i*props.artScale);			
			ctx.beginPath();			
			ctx.moveTo(0, step);
			ctx.lineTo(w, step);
			ctx.stroke();
		}	
		for (let i = 1; i < props.artWidth; i++){
			let step = Math.round(i*props.artScale);			
			ctx.beginPath();
			ctx.moveTo(step, 0);
			ctx.lineTo(step, h);
			ctx.stroke();
		}	
	}

	//draw guides
	if (hud.showGuides){
		ctx.globalAlpha = 1;
		ctx.strokeStyle = guideColor;
		ctx.lineWidth = 1;

		for (let i = 0; i < hud.guideX.length; i++){
			let gx = Math.round(hud.guideX[i]*props.artScale); 
			ctx.beginPath();
			ctx.moveTo(gx, 0);
			ctx.lineTo(gx, h);
			ctx.stroke();
		}
		for (let i = 0; i < hud.guideY.length; i++){
			let gy = Math.round(hud.guideY[i]*props.artScale); 
			ctx.beginPath();
			ctx.moveTo(0, gy);
			ctx.lineTo(w, gy);
			ctx.stroke();
		}
	}

	ctx.translate(-.5,-.5);
	ctx.globalAlpha = 1;
}

function drawPixelGrid(ctx, w, h){

	let block = 1*props.artScale,
		lineW = 1;
	
	if (block > 10){ //might allow user to switch to block >4 etc based on current zoom
		
		for (let i = 1; i < props.artWidth; i++){
			let step = Math.round(i*props.artScale);			
			ctx.clearRect(0, step, w, lineW); //hori
			ctx.clearRect(step, 0, lineW, h); //vert
		}
		
	}
}

//clear UI layer of bush outlines. line previews etc
function clearUI (){
	artUIContext.clearRect(0, 0, artUIElement.width, artUIElement.height);
}





//****NAVIGATION == PAN and ZOOM (Scale)******//

function zoomArtboard(factor){

	let oldScale = props.artScale;

	if (factor == 'fit'){
		let parent = document.getElementById("pasteboard"),
		pHeight = parent.offsetHeight;

		props.artScale = pHeight/props.artHeight; // ... probably either w or h	
		centerArtboard();
	}
	else{
		let amount = props.artScale*factor;
		if (props.artScale >= props.minScale && amount < 0){
			props.artScale += amount;
			if (props.artScale < props.minScale) 
				props.artScale = props.minScale;
		}

		if (props.artScale < props.maxScale && amount > 0){
			props.artScale += amount;
			if (props.artScale > props.maxScale) 
				props.artScale = props.maxScale;
			
		} 

		//Adjust position
		let xOff = ((oldScale - props.artScale) * props.artWidth) / 2,
			yOff = ((oldScale - props.artScale) * props.artHeight) / 2;

		props.artX += xOff;
		props.artY += yOff;
		constrainArtboardPos();
	}

	updateDOMScale();
	updateHUD();

	if (sprite.active){
		updateMinimap();
		updateOnionSkin();
	}

	//user feedback
	appFeedback.updateMsg('zoom', 'Scale 1:'+(Math.round(props.artScale*10)/10));

	//redraw clipboard items
	if (props.mode == "edit") drawClip();	
}

function updateDOMScale(){

	let artW = Math.ceil(props.artWidth*props.artScale),
		artH = Math.ceil(props.artHeight*props.artScale);

	let layers = document.getElementsByClassName('layer');
 	
 	//contains sprite layers
	
	for (let i = 0; i < layers.length; i++){
		let layer = layers[i],
			ctx = layer.getContext('2d');
		
		if (layer.tagName.toUpperCase() != 'CANVAS') continue;

		layer.style.top = props.artY+"px";
		layer.style.left = props.artX+"px";
		
		layer.width = artW;
		layer.height = artH;

		if (sprite.active){
			setBuffer(layer.id);
			putBuffer(ctx);
		}
	}	
	
	updateBgLayer();
}

function updateDOMPos (){
	let layer = document.getElementsByClassName('layer');
	for (let i = 0; i < layer.length; i++){
		if (layer[i].tagName.toUpperCase() != 'CANVAS') break;
		layer[i].style.top = props.artY+"px";
		layer[i].style.left = props.artX+"px";
	} 
	updateMinimap();
}

//ARTBOARDS
/*function moveArtboard(x, y){
	//future possible multiple artboards []
	props.artX = x;
	props.artY = y;
}*/

function centerArtboard(){

	let parent = document.getElementById("pasteboard"),
		pWidth = parent.offsetWidth,
		pHeight = parent.offsetHeight,
		cWidth = props.artWidth*props.artScale,
		cHeight = props.artHeight*props.artScale;

	if (cWidth < pWidth) {
		props.autoPivotX = true;
	} 
	if (cHeight < pHeight) {
		props.autoPivotY = true;
	}

	if (props.autoPivotX) props.pivotX = cWidth/2;
	if (props.autoPivotY) props.pivotY = cHeight/2;
	
	props.artX = round(pWidth/2 - props.pivotX);
	props.artY = round(pHeight/2 - props.pivotY);
}

function constrainArtboardPos(){
	let parent = document.getElementById("pasteboard"),
		xMax = (parent.offsetWidth / 2),
		yMax = (parent.offsetHeight / 2),
		xMin = xMax - (props.artWidth*props.artScale),
		yMin = yMax - (props.artHeight*props.artScale);

	//limit artboard from passing 1/2 way past the center of the pasteboard
		if (props.artX <= xMin) props.artX = xMin;
		if (props.artX >= xMax) props.artX = xMax;
		if (props.artY <= yMin) props.artY = yMin;
		if (props.artY >= yMax) props.artY = yMax;

	//Limit artboard position to pasteboard when zoomed in

	//boundx = round(parent.offsetWidth-(props.artWidth*props.artScale)),
	//boundy = round(parent.offsetHeight-(props.artHeight*props.artScale));

	
	/*if (props.artX >= boundx && props.artX <= 0){
		props.artX = sx-dx;
		//prevent overshooting
		if (props.artX < boundx) props.artX = boundx;
		else if (props.artX > 0) props.artX = 0;
		updateDOMPos();

		//props.autoPivotX = false;
		//props.pivotX = (props.artWidth*props.artScale)/2-dx;
	}
	if (props.artY >= boundy && props.artY <= 0){
		props.artY = sy-dy;
		//prevent overshooting
		if (props.artY < boundy) props.artY = boundy;
		else if (props.artY > 0) props.artY = 0;
		updateDOMPos();

		//props.autoPivotY = false;
		//props.pivotY = (props.artHeight*props.artScale)/2-dy;
	}	*/	
}

//Tool panel functions
function initToolbars(){

	//Menus
	initMenus();

	//drawing tools
	initToolSelect();	
	//layer tools
	initLayerTools();
	//frame tools
	initFrameTools();

}

function initStartupMenu(){

}

// !! remove existing sprite & canvas before use !!
function newFileProject (){
	//this applies to window component in new-panel-menu.js
	this.splash.hideWindow();

	let w = this.ui['values'].width,
		h = this.ui['values'].height;

	appFeedback.muteMsg(1);//zoom update as canvas is created not needeed

	//resize artboard settings
	props.artWidth = w;
	props.artHeight = h;

	//new empty sprite and canvas
	newCanvasSprite(w, h);
	sprite.name = this.ui['values'].name;

	//resize function (artboard panel)
	lPanel.artboard.update(w, h);

	//resize Pixel Buffer
	bufferElement.width = w;
	bufferElement.height = h;

	//Name Project
	props.projectName = this.ui['values'].name;
	document.title = '['+this.ui['values'].name+'] - '+props.appTitle;

	//Update sprite name
	sprite.name = props.projectName;

	updateArtboard(true);
	
	//UI feedback of successful new canvas
	appFeedback.updateMsg('document', 'New Sprite Created ('+props.artWidth+'&times;'+props.artHeight+')');
}

function initToolSelect (){

	//default
	selectTool('brush', "normal");

	tPanel.toolbar['drawing'].mapButtons({
		'brush-tool' : function(){
			selectTool('brush', 'normal');
		},
		'eraser-tool' : function(){
			selectTool('brush', 'erase');
		},
		'line-tool' : function(){
			selectTool('shape', 'line');
		},
		'rectangle-tool' : function(){
			selectTool('shape', 'rect');
		},
		'ellipse-tool' : function(){
			selectTool('shape', 'ellipse');
		},
		'fill-tool' : function(){
			selectTool('fill', 'normal');
		}

	});

	cPanel.menu.button['eyedropper-tool'].callback = function(){
		selectTool('eyedropper');
	}

	//Tool drawer menus
	tPanel.drawer['brush'].mapButtons({
		'size-1' : function(){
			toolProps.size = 1;
		},
		'size-2' : function(){
			toolProps.size = 2;
		},
		'size-3' : function(){
			toolProps.size = 3;
		},
		'size-4' : function(){
			toolProps.size = 4;
		}
	});
	tPanel.drawer['eraser'].mapButtons({
		'size-1' : function(){
			toolProps.size = 1;
		},
		'size-2' : function(){
			toolProps.size = 2;
		},
		'size-3' : function(){
			toolProps.size = 3;
		},
		'size-4' : function(){
			toolProps.size = 4;
		}
	});

	//Editing / Marquee tool
	tPanel.toolbar['editing'].mapButtons({
		'marquee-tool' : function(){
			selectTool('select');
		},
		'layer-clear' : function(){
			clearLayer();
		},
		'undo' : function(){
			getHistory(-1);
		},
		'redo' : function(){
			getHistory(1);
		}
	});


	//Marquee tool drawer
	tPanel.drawer['marquee'].mapButtons({
		'deselect' : function(){
			destroySelection();
			appFeedback.updateMsg('selection','Selection destroyed.');
		},
		'copy' : function(){
			copySelection(true);
			appFeedback.updateMsg('selection','Pixels copied to clipboard.');
		},
		'paste' : function(){
			pastePreview(true);
			appFeedback.updateMsg('selection','Pixels pasted on '+sprite.layerProps(props.layerId).name);
		},
		'clear' : function(){
			clearSelection();
			appFeedback.updateMsg('selection','Selected pixels has been cleared.');
		},
		'cut' : function(){
			cutSelection(true);
			appFeedback.updateMsg('selection','Pixels cut to clipboard.');
		},
		'reselect' : function(){
			remakeSelection();
			appFeedback.updateMsg('selection','Selection remade.');
		}
	});

	//Navigation Tools
	tPanel.toolbar['nav'].mapButtons({
		'art-pan' : function(){
			selectTool('pan');
		}
	});

	//Navigation Tools Drawer
	tPanel.drawer['zoom'].mapButtons({
		'art-zoom-in' : function(){
			zoomArtboard(props.zoomFactor);
		},
		'art-zoom-out' : function(){
			zoomArtboard(-props.zoomFactor);
		},
		'art-fit' : function(){
			zoomArtboard('fit');
		},
		'art-center' : function(){
			centerArtboard();
			updateDOMScale();
			updateHUD();
		},
		'art-fullscreen' : toggleFullscreen
	});
}

function toggleFullscreen(){

	
	var elem = document.documentElement;

	if (!props.fullscreen){
		if (elem.requestFullscreen) {
	   	 elem.requestFullscreen();
	  	} else if (elem.mozRequestFullScreen) { 
	    	elem.mozRequestFullScreen();
	  	} else if (elem.webkitRequestFullscreen) { 
	    	elem.webkitRequestFullscreen();
	  	} else if (elem.msRequestFullscreen) { 
	    	elem.msRequestFullscreen();
	  	}
	  	props.fullscreen = true;
	}
	else{
	  	if (document.exitFullscreen) {
	    	document.exitFullscreen();
		  	} else if (document.mozCancelFullScreen) { 
		    	document.mozCancelFullScreen();
		  	} else if (document.webkitExitFullscreen) { 
		    	document.webkitExitFullscreen();
		  	} else if (document.msExitFullscreen) { 
		    	document.msExitFullscreen();
		  }
		  props.fullscreen = false;
	}

	elem.addEventListener('webkitfullscreenchange', function(e){
		
	}, false);
	elem.addEventListener('mozfullscreenchange', centerArtboard, false);
	elem.addEventListener('fullscreenchange', centerArtboard, false);
}

window.onresize = function(e){
	console.log("window resize");
	centerArtboard();
	updateDOMScale();
	updateHUD();
}

function initMenus(){
//no layer canvas elements of the sprite nor sprite object exists yet

//File Menu
	fileWindow.submit = newFileProject; 
	fileWindow.ui.updateCallback = function(val){
		props.projectName = val.name;
		sprite.name = val.name;
		document.title = '['+val.name+'] - '+props.appTitle;
	};

	fileWindow.init('full', props.lockUI);

	//CTA btn Actions
	fileWindow.ui['save'].addAction(saveFile);
	fileWindow.ui['load'].addAction(openFile);


	function openFile(e){

		//mPanel.file.click();	
		var file = mPanel.file,
			event = new MouseEvent('click', {
			    view: window,
			    bubbles: true,
			    cancelable: true
			  });
		 file.dispatchEvent(event);  
	}

	function saveFile(){
		let fileName = props.projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase(),
			fileDataStr = 	'$projectName:'+props.projectName + 
							cPanel.getSwatchData() +
							sprite.getSpriteData();

		var blob = new Blob([fileDataStr], {type: "text/plain;charset=utf-8"});
		saveAs(blob, fileName+".bitbr");
		//UI feedback of successful new canvas
		appFeedback.updateMsg('document', 'Project saved!');
		project.saved = true;
	}

//Startup menu		
	let startupMenu = new appMenuPanel();

	startupMenu.submit = newFileProject; 
	startupMenu.version = props.version;
	startupMenu.init('startup', props.lockUI);

	//CTA btn Actions
	startupMenu.ui['load'].addAction(openFile);


	startupMenu.splash.showWindow();
	startupMenu.config({width : 32, height : 32}); //configure with default values
	props.lockUI = true;

//Export Menu
	exportMenu.init();

}




/*Right Side panel*/
function initLayerTools (){

	//Menu
	lPanel.panelMenu.mapButtons({
		'file-menu' : openFileMenu
	});
	//popup window (splash)
	function openFileMenu(){
		fileWindow.splash.showWindow();
		fileWindow.config(sprite);
		props.lockUI = true;
	}

	//Layers functions

	lPanel.layerTools.mapButtons({
		'layers-add' : addLayer,
		'layers-delete' : delLayer,
		'layers-up' : upLayer,
		'layers-down' : downLayer,
		'layers-duplicate' : cloneLayer
	});

	function addLayer(){
		addNewLayer();
	}

	function delLayer(){
		if (sprite.layerStack.length > 1) {
			setHistory('delete layer');
			deleteLayer(props.layerId);
		}
		else alert("At least one layer must remain."); //...non intrusive notification
	}

	function upLayer(){
		let layerData = sprite.layer;		
		if (layerData.stackPos < sprite.layerStack.length) {
			moveLayerToPos(parseInt(layerData.stackPos)+1);
			//sprite.makeLayerMixdown(true);
			fPanel.updateAllThumbs(sprite.frameData);
		}
	}

	function downLayer(){
		let layerData = sprite.layer;		
		if (layerData.stackPos > 1) {
			moveLayerToPos(parseInt(layerData.stackPos)-1);
			//sprite.makeLayerMixdown(true);
			fPanel.updateAllThumbs(sprite.frameData);
		}
	}

	function cloneLayer(){
		addNewLayer(true);
		updateArtboard();
	}

	lPanel.titleBar.mapButtons({
		'layers-all' : toggleLayerMode.bind(this)
	});

	function toggleLayerMode(){
		if (!lPanel.settings.isolateLayer ){
			toggleLayerVisibility(props.layerId, true, true);
			lPanel.settings.isolateLayer = true;
		}else{
			toggleLayerVisibility(props.layerId, true, true, true);
			lPanel.settings.isolateLayer = false;
		}
	}

	//Artboard Tools
	//lPanel.settings
	lPanel.artboardTools.mapButtons({
		'art-resize' : resizeCanvas.bind(this),
		'art-guides-clear' : clearGuides.bind(this)
	});

	function resizeCanvas(){
		let w = lPanel.artboard.width,
			h = lPanel.artboard.height,
			anchor = lPanel.artboard.anchor;
		
		resizeSprite(w, h, anchor);
		
		//resize artboard settings
		props.artWidth = w;
		props.artHeight = h;

		//resize Pixel Buffer
		bufferElement.width = props.artWidth;
		bufferElement.height = props.artHeight;
		
		updateArtboard(true);
	}

	function clearGuides(){
		hud.guideX = [];
		hud.guideY = [];
		updateHUD();
	}

	//Grid / guides toggles
	lPanel.artboard.ui['hud'].mapButtons({
		'art-toggle-grid' : function(){
			hud.showGrid = !hud.showGrid;
			updateHUD();
		},
		'art-toggle-guide' : function(){
			hud.showGuides = !hud.showGuides;
			updateHUD();
		}
	});

	//Custom buttons - background settings
	lPanel.setBgFunction('light', function(){
		props.bgType = 'light';
		updateBgLayer();
	});
	lPanel.setBgFunction('dark', function(){
		props.bgType = 'dark';
		updateBgLayer();
	});
	lPanel.setBgFunction('color', function(ele){
		props.bgType = 'color';
		updateBgLayer();
		ele.firstChild.style.background = cPanel.color.getHex();
		console.log(ele);
	});
	//custom bg image
	let fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = 'image/x-png,image/jpeg';
	
	fileInput.addEventListener('change', function(){
		let file = this.files[0];
		reader = new FileReader();
		reader.onload = function(e){
			props.bg['image'] = 'url('+e.target.result+')';
			updateBgLayer();
		};
		reader.readAsDataURL(file);
	}, false);

	lPanel.setBgFunction('image', function(ele){
		props.bgType = 'image';
		fileInput.click();
	});


}

function initFrameTools(){

	fPanel.frameTools.mapButtons({
		'frames-add' : addFrame,
		'frames-delete' : deleteFrame,
		'frames-left' : moveFrameLeft,
		'frames-right' : moveFrameRight,
		'frames-duplicate' : cloneFrame,
		'frames-export' : exportSprite
	});

	function addFrame(){
		sprite.addFrame(sprite.frameNum);
		fPanel.addThumb(sprite.frameNum, function(fnum){
			//thumb click goto action
			sprite.setFrame(fnum);
			updateArtboard();
			setHistory('add frame');//saves initial state of layer
		});
		updateArtboard();
		setHistory('add frame');//saves initial state of layer
	}

	function cloneFrame(){
		sprite.addFrame(sprite.frameNum, true);
		fPanel.addThumb(sprite.frameNum, function(fnum){
			//thumb click goto action
			sprite.setFrame(fnum);
			updateArtboard();
			setHistory('clone frame');
		});
		updateArtboard();
		fPanel.updateThumb(sprite.frame);
		setHistory('clone frame');
	}

	function deleteFrame(){
		//...confirmation? possibly cant undo this

		setHistory('delete frame');
		fPanel.removeThumb(sprite.frameNum);
		sprite.removeFrame(sprite.frameNum);
		updateArtboard();
	}

	function moveFrameLeft(){
		setHistory('move frame');
		sprite.moveFrame(parseInt(sprite.frameNum)-1);
		fPanel.updateAllThumbs(sprite.frameData);
		//add new onion skins
		updateOnionSkin();
		setHistory('move frame');
	}

	function moveFrameRight(){
		setHistory('move frame');
		sprite.moveFrame(parseInt(sprite.frameNum)+1);
		fPanel.updateAllThumbs(sprite.frameData);
		//add new onion skins
		updateOnionSkin();
		setHistory('move frame');
	}

	function exportSprite(){
		//open menu
		exportMenu.splash.showWindow();	
		//populate menu inputs with sprite properties
		exportMenu.config(sprite);
		props.lockUI = true;
	}

	//Onion Skin
	//Toggle button
	fPanel.panelMenu.mapButtons({
		'frames-onionskin' : toggleOnionSkin
	});
	function toggleOnionSkin(){
		props.onionSkin = !props.onionSkin;
		if (props.onionSkin){
			if (props.onionSkinRange[0] == 0 && props.onionSkinRange[1] == 0){
				props.onionSkinRange[0] = -1;
				props.onionSkinRange[1] = 0;
				fPanel.onionSkinGizmo.update(-1);
			}			
		}
		updateArtboard();
	}
	//Set gizmo range	
	fPanel.onionSkinGizmo.setFormat('number', -10, 10);
	fPanel.onionSkinUpdate = onionSkinUpdate;
	function onionSkinUpdate(val){
		let left = val < 0 ? val : 0,
			right = val > 0 ? val : 0;

		if (!props.onionSkin) {
			fPanel.panelMenu.button['frames-onionskin'].DOM.setAttribute('data-active','');
			props.onionSkin = true;
		}

		props.onionSkinRange[0] = left;
		props.onionSkinRange[1] = right;
		updateOnionSkin();
	}

	//add callback to fPanel once height is toggled, fit/center artboard again
	fPanel.panelMenu.button['frames-timeline'].callback = function(){
		let framesPanel = document.getElementById('panel-frames'),
			preview = document.getElementById('frames-preview');

		//this kinda works: framesPanel.style.marginBottom = '-160px';
		//;

		/*let preview = document.getElementById('frames-preview');
		toggleClass(preview, 'pop-out');
		updateDOMScale();*/
	}
}


//Resizing canvas
function resizeSprite(newW, newH, anchor){

	let oldW = props.artWidth,
		oldH = props.artHeight,
		offsetW = newW - oldW,
		offsetH = newH - oldH,
		offsetX = Math.round((offsetW*.5)*anchor[0]),
		offsetY = Math.round((offsetH*.5)*anchor[1]);

	sprite.resize(newW, newH, offsetX, offsetY, false);
}

function updateArtboard(deep){

	//redraw thumbnail from layerdata
	let layerStack = sprite.layerStack;

	for (let i = 0; i < layerStack.length; i++){
		updateLayerThumb(layerStack[i].id);
	}
	clearBuffer();

	//add new onion skins
	updateOnionSkin();

	if (deep){
		sprite.makeLayerMixdown(true);
		fPanel.updateAllThumbs(sprite.frameData);
	}

	//update main canvas from layerData
	updateDOMScale();
	//updates thumb stack order , also - redraw grid & update minimap from frame mixdown
	updateDOMStack();

}

function updateOnionSkin(layerId){

	if (!props.onionSkin) return;

	let w = artBgElement.width,
		h = artBgElement.height,
		sw = sprite.width,
		sh = sprite.height;

	artBgContext.clearRect(0,0,w,h);
	artBgContext.imageSmoothingEnabled = false;

	let fnum = parseInt(sprite.frameNum),
		max = sprite.frameData.length,
		minOpacity = .05,
		maxOpacity = .5,
		left = Math.abs(props.onionSkinRange[0]),
		right = Math.abs(props.onionSkinRange[1]);

	//get valid frame ranges for onionskin to determine opacities
	if (left >= fnum) left = fnum-1;
	if (right > max-fnum) right = max-fnum;

	let amount = left+right,
		ofac = .05,//maxOpacity / amount,
		opacity = maxOpacity - (left * ofac);

	if (opacity < 0) opacity = 0;

	for (let f = fnum-left; f <= fnum+right; f++){
		if (f == fnum || f < 1 || f > max) continue;


		artBgContext.globalAlpha = opacity; //(opacity>minOpacity && opacity<maxOpacity) ? opacity;
		
		sprite.showHiddenLayers = false;
		sprite.makeLayerMixdown(false, f);

		let img = sprite.getFrameData(f).mixdown;
		artBgContext.drawImage(img, 0, 0, sw, sh, 0, 0, w, h);

		//restore mixdown
		sprite.showHiddenLayers = true;
		sprite.makeLayerMixdown(false, f);

		//set onionskin opacity
		if (f < fnum){
			if (opacity < maxOpacity) opacity += ofac;
			else opacity = maxOpacity;
		}else{
			if (opacity > minOpacity) opacity -= ofac;
			else opacity = minOpacity;
		}
	}
	artBgContext.globalAlpha = 1;
}


//Artboard Interactions ***

function artboardUIInit(){

	let pasteboard = document.getElementById("pasteboard"),
		pinchZoomDist = 0;

//--disable browser right click menu
	document.addEventListener('contextmenu', function(e) { 
	  e.preventDefault();
	}, false);

//--Move mouse/pointer

	artUIElement.addEventListener(pointerEvent['move'], onPointerMove, false);
	function onPointerMove(e) {
		//e.preventDefault();
		if (pinchZoomDist == 0){
		    getCursorPos(e, false);
		    draw(e);	
		}		
     }

//--Move Mouse/Pointer Out (clear previews)

	artUIElement.addEventListener(pointerEvent['out'], function (e) {
			e.preventDefault();
            artUIContext.clearRect(0, 0, this.width, this.height);
     }, false);

//--Mouse/Pointer Down (start draw)

	artUIElement.addEventListener(pointerEvent['down'], onPointerDown, false);
	function onPointerDown(e) {
		e.preventDefault();
		if (e.button === 2) cursor.mode = "secondary";
			else cursor.mode = "primary";

		cursor.drawing = true;
	}

//--Mouse/Pointer Up (end draw)

	document.addEventListener(pointerEvent['up'], function (e) {
		cursor.drawing = false;
     }, false);

	artUIElement.addEventListener(pointerEvent['up'], onPointerUp, false); 
	function onPointerUp(e) {
		if (pinchZoomDist == 0){
			if (!singleClickAction(e)) draw(e);//commits lines and circles
			cursor.pixelLastX = cursor.pixelX;
			cursor.pixelLastY = cursor.pixelY;

			cursor.mode = "primary";
		}
	}


//--Pen and touch specific

	artUIElement.addEventListener('touchmove', function (e) {
		//Pinch zoom reset	
		if (e.touches.length > 1) {
			pinchZoomDist = 0;
			return;
		}
		//Drawing
    	getCursorPos(e, true);
   		draw(e);
	}, false);

	artUIElement.addEventListener('touchend', function (e) {
		//Pinch Zoom Reset	
		if (e.touches.length > 1) {
			pinchZoomDist = 0;
			return;
		}
		//Stop Drawing
		cursor.drawing = false;
		onPointerUp(e);
	}, false);

	artUIElement.addEventListener('touchstart', function (e) {
			
		if (e.touches.length > 1) {
			pinchZoomDist = 0;
			return;
		}
    	getCursorPos(e, true);
		onPointerDown(e);
	}, false);

//--pinch zoom (progress ... )

	pasteboard.addEventListener('touchmove', function (e){
		e.preventDefault();
		if (e.touches.length > 1){
			pinchZoomDist = findDistance(e.targetTouches[0].clientX, e.targetTouches[0].clientY, e.targetTouches[1].clientX, e.targetTouches[1].clientY, true);
        	console.log('dist '+pinchZoomDist);
        }else{
        	pinchZoomDist = 0;
        }

	}, false);

//--wheel zoom

	pasteboard.addEventListener('wheel', function(e) { 
	  if (e.deltaY > 0) zoomArtboard(-.1)
	  	else zoomArtboard(0.1);

	}, false);

//--Keys
	window.addEventListener("keydown", function(e){
		
		keys = {
			press : true,
			keyCode : e.keyCode || e.which,
			space : (e.which == 32 || e.keyCode == 32),
			shift : e.shiftKey,
			alt : e.altKey,
			del : (e.keyCode == 46 || e.which == 46 || e.key == 'Delete'),
			ctrl : (e.ctrlKey || e.metaKey || e.keyCode == 17 || e.which == 17)
		}
		keyboardActions(e);
	}, false);
	window.addEventListener("keyup", function(e){
		
		keys.press = false;
		keyboardActions(e);
	}, false);
}

function singleClickAction(e){

	let mx = cursor.pixelX,
		my = cursor.pixelY,
		sx = cursor.pixelSX,
		sy = cursor.pixelSY,
		singleClick = false;

	if (toolProps.active) destroySelection();

	//commits history on single click tools
	if (toolProps.type == 'brush' || toolProps.type == 'fill' || toolProps.type == 'eyedropper'){
		//not draggin
		if (sx == mx && sy == my){
			draw(e);//draws brush on single click
			console.log('single click');
			setHistory('draw');
			singleClick = true;	

		}
	} 
		
	cursor.drawing = false;	
	return singleClick;
}

function keyboardActions(e){
	
	
	if (keys.press){
	 	
	 	if (!props.lockUI) e.preventDefault(); //precaution for text boxes that need spacebar input


	//TEMP TOOLS

		//EYE DROPPER - alt + brush tool switch
	 	if (keys.alt && toolProps.type == 'brush'){
			toolProps.prevType = toolProps.type;
		 	selectTool('eyedropper');		 	
		 }

		//PAN - space + any tool
	 	if (keys.space && toolProps.type !== 'pan'){
			toolProps.prevType = toolProps.type;
		 	selectTool('pan');		 	
		 }

	//FUNCTIONS

		 //HISTORY PANEL
		 if (keys.shift && keys.ctrl && keys.keyCode == 72){
		 	hPanel.toggleHide();
		 }
		 //REDO - ctrl+shift+z
		 if (keys.ctrl && keys.shift && keys.keyCode == 90){
		 	e.preventDefault();
		 	getHistory(1);	
		 	return;	 	
		 }
		 //UNDO - ctrl+z
		 if (keys.ctrl && keys.keyCode == 90){
		 	getHistory(-1);
		 	return;
		 }

	//--SELECTIONS
		if (selection.active){

		//COPY - ctrl+C
			if (keys.ctrl && keys.keyCode == 67){
				copySelection(true);
				appFeedback.updateMsg('selection','Pixels copied to clipboard.');
			}
		//CUT
			if (keys.ctrl && keys.keyCode == 88){
				cutSelection(true);
				appFeedback.updateMsg('selection','Pixels cut to clipboard.');
			}
		//DESTROY SELECTION
			if (keys.keyCode == 27){
			 	destroySelection();	
				appFeedback.updateMsg('selection','Selection destroyed.');	 	
			}
		//CLEAR SELECTION CONTENTS
			if (keys.del){
			 	clearSelection();
				appFeedback.updateMsg('selection','Selected pixels has been cleared.');	 	
			}
		}
		else
		{

		//REMAKE SELECTION
		 	if (keys.ctrl && keys.shift && keys.keyCode == 82){
		 		e.preventDefault();
		 		remakeSelection();	
				appFeedback.updateMsg('selection','Selection remade.'); 	
		 	}
		} 

		//PASTE
		if (keys.ctrl && keys.keyCode == 86){
		 	pastePreview(true);
			appFeedback.updateMsg('selection','Pixels pasted on '+sprite.layerProps(props.layerId).name);
		}

		//TRANSFORMS
		//FLIP HORIZONTAL
		if (keys.alt && keys.keyCode == 72){
		 	flipSelection("horizontal")
			//appFeedback.updateMsg('selection','Pixels flipped horizonally on '+sprite.layerProps(props.layerId).name);
		}
		//FLIP VERTICAL
		if (keys.alt && keys.keyCode == 86){
		 	flipSelection("vertical")
			//appFeedback.updateMsg('selection','Pixels flipped vertically on '+sprite.layerProps(props.layerId).name);
		}
		//ROTATE CLOCKWISE
		if (keys.keyCode == 190){
			rotateSelection('clockwise');
		}
		//ROTATE ANTI-CLOCKWISE
		if (keys.keyCode == 188){
			rotateSelection('anticlockwise');
		}
	}	
	else {
		
		//alt/space + any tool switch back
		if ((keys.alt || keys.space) && toolProps.prevType != ""){
			console.log("switch to prev tool "+toolProps.prevType);
			selectTool(toolProps.prevType);
			toolProps.prevType = "";
		}

		//switch key values back after keyup functions are complete
		keys.alt = false;
		keys.shift = false;
		keys.ctrl = false;
	}
	
}


function selectTool (type, mode){
	toolProps.type = type;
	toolProps.mode = mode || "normal";

	clearUI();//clears brush size
	if (toolProps.type != 'select') destroySelection(); //clear any existing selection
	setCursor(type, mode);
}

//css cursor png
function setCursor(type, mode){

	let variant = mode || 'normal';

	let offset = 20,//(toolProps.size*props.artScale)+8
		style = type+'-'+variant, 
		cursorStyle = {
			"brush-normal" : "url(assets/icons/brush.png) 0 "+offset+", none",
			"brush-erase" : "url(assets/icons/eraser.png) 0 "+offset+", none",
			"shape-line" : "crosshair",
			"shape-rect" : "crosshair",
			"shape-ellipse" : "crosshair",
			"fill-normal" : 'crosshair',
			"eyedropper-normal" : "url(assets/icons/eyedropper.png) 0 "+offset+", none",
			"select-normal" : 'crosshair',
			"select-move" : "move",
			"pan-normal" : "all-scroll",
			"general-normal" : "crosshair"
		};

	if (cursorStyle[style])
	artUIElement.style.cursor = cursorStyle[style];
	else
	artUIElement.style.cursor = "auto";
}

function getCursorPos(e, usePen) {
	let canvas = e.currentTarget,
		rect = canvas.getBoundingClientRect();

	var penx = 0;
	var peny = 0;

	if (usePen){
		penx = e.targetTouches[0].clientX || 0;
		peny = e.targetTouches[0].clientY || 0;
	}

	cursor.x = usePen ? penx : e.clientX;
	cursor.y = usePen ? peny : e.clientY;

	//Previous drawing tool positions
	cursor.pixelPrevX = cursor.pixelX;
	cursor.pixelPrevY = cursor.pixelY;

	//drawing tool positions
	cursor.pixelX = Math.floor((cursor.x - rect.left) / props.artScale);
	cursor.pixelY = Math.floor((cursor.y - rect.top) / props.artScale);
	//drag start coordinates
	if (!cursor.drawing){		
		cursor.sx = cursor.x;
		cursor.sy = cursor.y;
		cursor.pixelSX = cursor.pixelX;
		cursor.pixelSY = cursor.pixelY;
	}

	// console.log("mouseX1 : ", mainEvt.clientX);
	// console.log("mouseX2 : ", e.clientX);
}


//all drawing are added to buffer and then upscaled to canvases
function initPixelBuffer (){
	bufferElement = document.createElement('canvas');
	bufferElement.width = props.artWidth;
	bufferElement.height = props.artHeight;
	bufferElement.id = "buffer";

	buffer = bufferElement.getContext('2d');
	buffer.imageSmoothingEnabled = false;
}

function setBuffer(layerId){

	let bw = bufferElement.width,
		bh = bufferElement.height,
		layerData,		
	 	layerProps;

	if (typeof layerId == 'string') {
		layerData = sprite.layerData(layerId);
		layerProps = sprite.layerProps(layerId);
	}		
	else {
		layerData = sprite.frame.layerData[layerId]; //index
		layerProps = sprite.layerStack[layerId];
	}

	if (typeof layerData == 'undefined') return false;

	clearBuffer();
	buffer.imageSmoothingEnabled = false;	
	buffer.putImageData(layerData.img, 0, 0);
}


function putBuffer(ctx, layerId){
	let ele = ctx.canvas,
		w = ele.width,
		h = ele.height,
		bw = bufferElement.width,
		bh = bufferElement.height,
		layerData,
		layerProps;

	if (layerId || layerId != undefined){

	 	layerProps = sprite.layerProps(layerId);
		if (!layerProps.visible) {
			clearBuffer();
			return; 
		}

		//draw to current thumbnail
		putThumb();

	 	//copy layer (layerID provided) on buffer to layerData	
	 	layerData = sprite.layerData(layerId); 	 	
	 	layerData.img = buffer.getImageData(0,0,bw,bh); 
	 	
	 	//update mixdowns & current frame
	 	sprite.makeLayerMixdown();
	 	fPanel.updateThumb(sprite.frame);
		updateMinimap();
	}

	ctx.imageSmoothingEnabled = false;
	ctx.clearRect(0, 0, w, h);
	ctx.drawImage(bufferElement, 0, 0, bw, bh, 0, 0, w, h);
	clearBuffer();
}

function putThumb(layerThumb){
	let w = bufferElement.width,
		h = bufferElement.height,
		thumb = layerThumb || lPanel.thumb,
		tw = thumb.width,
		th = thumb.height;

	let ctx = thumb.getContext('2d');
	ctx.imageSmoothingEnabled = false;
	ctx.clearRect(0, 0, tw, th);
	ctx.drawImage(bufferElement, 0, 0, w, h, 0, 0, tw, th);
}

function clearBuffer(){

	let bw = bufferElement.width,
	bh = bufferElement.height;

	buffer.clearRect(0, 0, bw, bh);
	buffer.globalAlpha = 1;
}

//canvas brush size
function showBrushSize(){
	let size = toolProps.size,
		mx = cursor.pixelX,
		my = cursor.pixelY,
		sx = cursor.pixelSX,
		sy = cursor.pixelSY,		
		previewColor;

	if (cursor.mode != "secondary") previewColor = uiColor['secondary'];
		else previewColor = uiColor['primary'];
	if (toolProps.type == 'select') {		
		previewColor = uiColor['selection'];
	}

	//clearUI();
	//pixel preview for brush and all tools not in dragging mode
	if (toolProps.type == "brush" || ((mx == sx && my == sy) && 
		!cursor.drawing)) {

		if (toolProps.type != "brush") size = 1;

		buffer.clearRect(0, 0, bufferElement.width, bufferElement.height);
		buffer.globalAlpha = .6;
		buffer.fillStyle = previewColor;
		buffer.fillRect(mx-size+1, my, size, size);
		putBuffer(artUIContext);
	}

	//line preview
	if (toolProps.type == "shape" && toolProps.mode == "line") {
		size = 1;
		buffer.clearRect(0, 0, bufferElement.width, bufferElement.height);
		buffer.globalAlpha = .6;
		drawLine(buffer, sx-size+1, sy, mx-size+1, my, size, previewColor);
		putBuffer(artUIContext);
	}

	//circles and rectangles
	if (cursor.drawing && toolProps.type == "shape"){
		size = 1;
		
		//Modifyers
		if (keys.shift){
			let w = sx-mx,
				h = sy-my;

			if (Math.abs(w) > Math.abs(h)) my = sy-w;
			else mx = sx-h;
		}

		buffer.globalAlpha = .6;
		if (toolProps.mode == "rect") {
			buffer.clearRect(0, 0, bufferElement.width, bufferElement.height);
			drawRect(buffer, sx, sy, mx, my, size, previewColor, false, keys.alt);
			putBuffer(artUIContext);
		}

		if (toolProps.mode == "ellipse") {
		buffer.clearRect(0, 0, bufferElement.width, bufferElement.height);			
			drawEllipse(buffer, sx, sy, mx, my, size, previewColor, keys.alt);
			putBuffer(artUIContext);
		}
	}

	//Marquee tool
	if (cursor.drawing && toolProps.type == 'select' && toolProps.active){
		//if (selection.active) destroySelection();
		
		//Modifyers
		if (keys.shift){
			let w = sx-mx,
				h = sy-my;

			if (Math.abs(w) > Math.abs(h)) my = sy-w;
			else mx = sx-h;
		}

		buffer.clearRect(0, 0, bufferElement.width, bufferElement.height);
		buffer.globalAlpha = .4;
		drawRect(buffer, sx, sy, mx, my, 1, previewColor, false);
		putBuffer(artUIContext);
	}

	if (toolProps.type == "fill") {
		
		let rgba = [212,85,0,.6];

		buffer.clearRect(0, 0, bufferElement.width, bufferElement.height);
		setBuffer(props.layerId);
		colorFill(bufferElement, mx, my, rgba, true, true);
		putBuffer(artUIContext);
	}


}

//SELECT TOOL Function 

function draw(e) {

	var toolFunction = {
		"brush" : brushTool,
		"pan" : panTool,
		"eyedropper" : eyedropperTool,
		"shape" : shapeTool,
		"fill" : fillTool,
		"select" : marqueeTool,
	};
	toolFunction[toolProps.type]();

	//replace cursor with crosshair 
	if (e.pointerType != cursor.pointerType){
		//reset
		if (e.pointerType == 'mouse') setCursor(toolProps.type, toolProps.mode);
		//set to general pointer for pen and touch
		if (e.pointerType == 'touch' || e.pointerType == 'pen') setCursor('pointer');
		//update
		cursor.pointerType = e.pointerType;
	}

}


function brushTool(){
	let size = toolProps.size,
		color = toolProps.pColor.getRGBA(),
		mx = cursor.pixelX-size+1,
		my = cursor.pixelY,
		px = cursor.pixelPrevX-size+1,
		py = cursor.pixelPrevY,
		sx = cursor.pixelSX-size+1,
		sy = cursor.pixelSY,
		lx = cursor.pixelLastX-size+1,
		ly = cursor.pixelLastY;
		
	showBrushSize();

	if (cursor.drawing){
		let swatch = 1;

		//Eraser
		if (toolProps.mode == 'erase'){
			color = 'none';
		}
		//Normal Brush
		else{
			//on right click Draw in secondary color
			if (cursor.mode == "secondary") {
				color = toolProps.sColor.getRGBA();
				swatch = 2;
			}
			cPanel.setRecentColor(swatch);			
		}

		//if shift = line jump on 45 degrees increments
		if (keys.shift){
				let deg = findDegree(sx, sy, mx, my);
				console.log('shift');
				console.log('lx:'+lx+' ly:'+ly+' | mx:'+mx+' my:'+my);
				px = lx;
				py = ly;
		}
		setBuffer(props.layerId); //update buffer with layer contents
		drawLine(buffer, px, py, mx, my, size, color); //edits buffer
		putBuffer(layerContext, props.layerId); //return contents and update layer data
		
		
	}
	//Once cursor is released after drawing
	else
	if (mx != sx || my != sy){
		setHistory('draw');
	}
}

//SHAPES - LINE, ELLIPSE, RECT
function shapeTool(){

	let size = 1,//toolProps.size,
		mx = cursor.pixelX-size+1,
		my = cursor.pixelY,
		sx = cursor.pixelSX-size+1,
		sy = cursor.pixelSY,
		color = toolProps.pColor.getRGBA(),
		mode = toolProps.mode
	
	showBrushSize();

	if (!cursor.drawing){

		let w = sx-mx,
			h = sy-my;

		//Modifyers
		if (keys.shift){
			let w = sx-mx,
				h = sy-my;

			if (Math.abs(w) > Math.abs(h)) my = sy-w;
			else mx = sx-h;
		}

		//commit line
		if (mx != sx || my != sy){
			clearUI(); //clear preview

			let swatch = 1;
			if (cursor.mode == "secondary") {
				color = toolProps.sColor.getRGBA();
				swatch = 2;
			}
			cPanel.setRecentColor(swatch);

			if (mode == "line"){ 
				setBuffer(props.layerId);
				drawLine(buffer, sx, sy, mx, my, size, color);
				putBuffer(layerContext, props.layerId);
			}
			else 
			if (mode == "rect") {
				setBuffer(props.layerId);
				drawRect(buffer, sx, sy, mx, my, size, color, false, keys.alt);
				putBuffer(layerContext, props.layerId);
			}
			else 
			if (mode == "ellipse") {
				setBuffer(props.layerId);
				drawEllipse(buffer, sx, sy, mx, my, size, color, keys.alt);
				putBuffer(layerContext, props.layerId);
			}
			setHistory('draw');
		}
	}
}

function fillTool(){
	let mx = cursor.pixelX,
		my = cursor.pixelY,
		color = toolProps.pColor;//.getRGBA();

	if (cursor.drawing){

		let swatch = 1;
		if (cursor.mode == "secondary") {
			color = toolProps.sColor,//.getRGBA();
			swatch = 2;
		}
		cPanel.setRecentColor(swatch);

		rgba = [color.r, color.g, color.b, color.a];

		setBuffer(props.layerId);
		colorFill(bufferElement, mx, my, rgba);
		putBuffer(layerContext, props.layerId);

		cursor.drawing = false;
	}else{
		showBrushSize();
	}
}

//NAVIGATION - PAN / Hand Tool
function panTool(){

	
	if (cursor.drawing){
		let dx = cursor.sx-cursor.x,
			dy = cursor.sy-cursor.y,
			sx = props.artSX,
			sy = props.artSY;


		//Drag artboard
		props.artX = sx-dx;
		props.artY = sy-dy;

		constrainArtboardPos();
		updateDOMPos();
	
	}
	else {
		//get canvas x and y
		props.artSX = props.artX;
		props.artSY = props.artY;
	}
}

function eyedropperTool(){

	let mx = cursor.pixelX-toolProps.size+1,
		my = cursor.pixelY,
		ele = document.createElement('canvas');

	if (cursor.drawing){

		let imgData;

		if (toolProps.mode == "normal"){
			let mixdown = sprite.frame.mixdown.getContext('2d');
			imgData = mixdown.getImageData(mx, my, 1, 1).data;
		}else { //default
			setBuffer(props.layerId);
			imgData = buffer.getImageData(mx, my, 1, 1).data;
		}

		let activeColor = 0,
			rgba = [imgData[0], imgData[1], imgData[2], round(imgData[3]/255)];

		if (cursor.mode == "secondary") activeColor = 1;

		cPanel.setColor(rgba, activeColor);
		cursor.drawing = false;
	}
}

function marqueeTool(){

	let size = 1,
		mx = cursor.pixelX-size+1,
		my = cursor.pixelY,
		sx = cursor.pixelSX-size+1,
		sy = cursor.pixelSY,
		mode = toolProps.mode;
	
	showBrushSize();

	if (!cursor.drawing){
		
		
		if (insideSelection(mx, my)) {
			if (toolProps.mode != "move"){
				toolProps.mode = "move";
				setCursor('select', 'move');				
			}	
			clearUI();		
			toolProps.active = false;
		}
		else{
			if (toolProps.mode != "normal"){
				toolProps.mode = "normal";
				setCursor('select');				
			}
			toolProps.active = true;
		}
		
		if (mx != sx || my != sy){
			//commit selection || insideSelection(mx, my)
			if (!(insideSelection(sx, sy))){
				let w = sx-mx,
					h = sy-my;
				//Modifyers
				if (keys.shift){
					if (w > h) h = w;
					else w = h;
					mx = sx-w;
					my = sy-h;
				}
				//clear brush preview
				clearUI(); 	
				destroySelection();	
				makeSelection(sx, sy, mx, my, 'artboard');		
			}
			//commit move
			if (insideSelection(mx, my)){
				let sel = selection;

				sel.initx = sel.x;
				sel.inity = sel.y;
				sel.moving = false;
				sel.dx = 0;
				sel.dy = 0;
				sel.empty = false;
			}
		}
	}else{
		//dragging inside selection
		if (insideSelection(sx, sy)) {
			let sel = selection;

			//edit mode - move pasteboard content
			if (props.mode == 'edit' || sel.empty){
				//toolProps.active = true;
				let dx = sx-mx,
					dy = sy-my;
					
				//console.log("sel")
				//right drag
				if (cursor.mode == "secondary" && !sel.empty){
					destroySelection();
					remakeSelection();
				}
				else				
				if (!(dx == sel.dx && dy == sel.dy)){
					
					sel.moving = true; //fast cursor can jump out of selection
					sel.x = sel.initx-dx;
					sel.y = sel.inity-dy;
					sel.dx = dx;
					sel.dy = dy;
					
					drawClip(); //doesnt draw when sel empty or right drag					
					updateHUD();
					showAnts();
				}
			}else{
				//L: cut selection, edit mode R: move empty selection
				if (cursor.mode != "secondary"){
					clearUI();
					if (cutSelection()){
						pastePreview(); //mode=edit
						cursor.pixelSX = cursor.pixelX;
						cursor.pixelSY = cursor.pixelY;
					}				
				}else sel.empty = true;
			}
			
			toolProps.active = false;
			
		}	
	}
}

function insideSelection(x, y){

	if (typeof selection.active != undefined && selection.active){
		let s = selection;
		if ((x >= s.x && x <= s.x+s.w && 
			y >= s.y && y <= s.y+s.h) || s.moving){
			return true;
		}else return false;
	
	} 
	else return false;
}



//************Selections*************//

function makeSelection(sx, sy, mx, my, from){
	//updateHUD();

	selection = {
		layerId : props.layerId,
		x : sx < mx ? sx : mx,
		y : sy < my ? sy : my,
		initx : 0,
		inity : 0,
		dx : 0, //record last cycle's distance when dragging
		dy : 0,
		moving : false, //flag when being dragged
		w : Math.abs(sx-mx)+1,
		h : Math.abs(sy-my)+1,
		active : true,
		antsOffset : 0,
		content : from,
		empty : false
	};
	selection.initx = selection.x;
	selection.inity = selection.y;

	//show Selection with animation
	if (selection.active){
		updateHUD();
		animation = setInterval(showAnts, 100);			
	}	
}

function remakeSelection(){
	let s = selection;
	if (typeof s.active != undefined && !s.active && s.w != 0){
		s.active = true;
		s.initx = s.x;
		s.inity = s.y;
		s.content = "artboard";
		updateHUD();
		animation = setInterval(showAnts, 100);			
	}
}

function showAnts(){

	let ctx = hudContext,
		sel = selection,
		x = Math.round(sel.x*props.artScale),
		y = Math.round(sel.y*props.artScale),
		w = Math.round((sel.w)*props.artScale),
		h = Math.round((sel.h)*props.artScale),
		lineW = 2,
		dashW = 5,
		color = uiColor['selection'];
	
	//if (sel.moving) return; 
	
	if (sel.content == "clipboard") color = uiColor['move'];	
	
	ctx.globalAlpha = 1;

	ctx.lineWidth = lineW;
	ctx.lineDashOffset = sel.antsOffset;
	//ctx.translate(-1, -1);	
	// ctx.clearRect(x, y, w, lineW);
	// ctx.clearRect(x, y+h, w, lineW);
	// ctx.clearRect(x, y, lineW, h);
	// ctx.clearRect(x+w, y, lineW, h);
	//ctx.translate(1, 1);
	if (props.mode == "edit" && cursor.drawing) {
		ctx.setLineDash([]);
		//lineW++;
	}
	else {
		ctx.strokeStyle = "white";
		ctx.strokeRect(x, y, w, h);
		ctx.setLineDash([dashW, dashW]);
	}
	ctx.strokeStyle = color;
	ctx.strokeRect(x, y, w, h);
	ctx.setLineDash([]);
	ctx.lineDashOffset = 0;

	if (sel.antsOffset >= 10) sel.antsOffset = 1;
	else sel.antsOffset++;

}


function destroySelection(){
	if (typeof selection.active != "undefined" && selection.active){
		if (props.mode == "edit") commitEdit();//resets & commits if mode is edit
		selection.active = false;
		clearInterval(animation);
		animation = null;
		updateHUD();		
	}
}

function clearSelection(){
	let s = selection;

	if (s.active && props.mode != "edit"){
		setBuffer(props.layerId);
		buffer.clearRect(s.x, s.y, s.w, s.h);
		putBuffer(layerContext, props.layerId);
	}else{
		setBuffer(props.layerId);
		putBuffer(layerContext, props.layerId);
		props.mode = "draw";
		s.content = "artboard";
		console.log('selection : Nothing cleared.');
	}
}

function cutSelection(user){
	let s = selection;

	if (s.active){
		if (copySelection(user)){
			clearSelection();
			return true;
		}
		else 
		return false;
	}
}

function copySelection(user){

	let s = selection,
	c = clipboard;

	if (s.active){
		setBuffer(props.layerId);
		let imgData = buffer.getImageData(s.x, s.y, s.w, s.h),
		    ele;

		if (user) {
			ele = c.cache;
			c.x = s.x;
			c.y = s.y;
			c.w = s.w;
			c.h = s.h;
		} 
		else {
			ele = c.clip;
			ele.width = s.w;
			ele.height = s.h;
		}
		/**/

		let ctx = ele.getContext('2d');

		ctx.clearRect(0, 0, ele.width, ele.height);

		if (props.mode != "edit"){
			if (isEmpty(imgData)) {
				s.empty = true;
				return false;
			}else {
				s.empty = false;
			}
			ctx.putImageData(imgData,0,0);
		}
		else{
			console.log("user copy: to cache");
			ctx.drawImage(c.clip, 0, 0);
		}
	}else{
		console.log('selection : Nothing to copy!');
		return false;
	}
	return true;
}

function isEmpty(imgData){
	for (var i = 0; i < imgData.data.length; i+=4){
		if (imgData.data[i+3] !== 0) return false;
	}
	return true
}

function pasteSelection(newx, newy){

	let x = newx, //OR cursor.pixelX as a brush
		y = newy,
		data;

	if (clipboard.user) data = clipboard.cache;
		else data = clipboard.clip;

	setBuffer(props.layerId);
	buffer.drawImage(data, x, y);
	putBuffer(layerContext, props.layerId);
}

function pastePreview(user){

	let c = clipboard;

	//reselect
	if (user){
		destroySelection();
		selectTool("select");
		makeSelection(c.x, c.y, c.x+c.w-1, c.y+c.h-1, "clipboard");
	}else selection.content = "clipboard";
	
	//to draw a clipping or from user copy
	c.user = user || false;

	drawClip();
	props.mode = "edit"; 
}

function drawClip(){
	let c = clipboard,
		s = selection,
		data;

	if (c.user) data = c.cache;
		else data = c.clip;

		console.log("data img: "+data.width+"x"+data.height);

	if (!s.empty){
		setBuffer(props.layerId);
		buffer.drawImage(data, s.x, s.y); //...later transforms can be set as w,h params here
		putBuffer(layerContext);//no update to layer data
	}	
}

function commitEdit(){
	 
	pasteSelection(selection.x, selection.y);
	props.mode = "draw";
}

//Transform
function flipSelection(direction){

	if (!selection.active) return;

	let sourceCanvas = getTransformSource();


	reflectRotate(sourceCanvas, 'flip', direction);
	drawClip()
}

function rotateSelection(direction){
	if (!selection.active) return;
	let sourceCanvas = getTransformSource();

	reflectRotate(sourceCanvas, 'rotate', direction);

	selection.w = sourceCanvas.width;
	selection.h = sourceCanvas.height;
	selection.x -= Math.floor((selection.w-selection.h)/2);
	selection.y -= Math.floor((selection.h-selection.w)/2);
	drawClip()
	updateHUD();

}

function getTransformSource(){
	let sourceCanvas;

	//Cut a new selection
	if (selection.content != "clipboard"){
		if (cutSelection())	pastePreview()
	}
	//If from clip
	if (selection.content == "clipboard") 
		sourceCanvas = clipboard.clip;
	//If from cache
	else 
		sourceCanvas = clipboard.cache;	

	return sourceCanvas;
}


function trimData(imgData){
	let top = 0, 
		btm = 0, 
		left = 0, 
		right = 0,
		w = imgData.width,
		h = imgData.height;

	//Check TOP
	for (var i = 0; i < imgData.data.length; i+=4){
		top = Math.floor(((i+1)/4)/w);
		if (imgData.data[i+3] !== 0) break;		
	}
	//Check BTM
	for (var i = 0; i < imgData.data.length; i+=4){
		let j = imgData.data.length-1-i;

		btm = Math.floor(((i+1)/4)/w);
		if (imgData.data[j] !== 0) break;		
	}
	//Check LEFT
	for (var j = 0; j < w; j++){
		let i = 0,
			flag = false;
		for (var v = top; v < h-btm; v++){
			i = (v*w+j)*4;
			if (imgData.data[i+3] !== 0) {
				flag = true;
				break;	
			}
		}
		if (flag) {
			left = j;
			break;
		}
	}
	//Check RIGHT
	for (var j = 0; j < w; j++){
		let i = 0,
			flag = false;
		for (var v = top; v < h-btm; v++){
			i = (w*(v+1)-j)*4-1;
			if (imgData.data[i] !== 0) {
				flag = true;
				break;	
			}
		}
		if (flag) {
			right = j;
			break;
		}
	}
	return [top, right, btm, left];
}

/******HISTORY********/

function getHistory(inc, index){
	
	var i = index >= 0 ? index : undolist.currentEntry + parseInt(inc);

	if (i < 0) {
		console.log('Sry. You cant undo past this point.');
		return;
	}
	if (i >= undolist.state.length) {
		console.log('Sry. You cant redo past this point.');
		return;
	}

	//updating history panel
	hPanel.setActiveItem(i);

	let hist = undolist.state[i],
		action = {
			'select layer' : layerAction,
			'delete layer' : layerAction,
			'draw' : layerAction,
			'add frame' : frameAction,
			'clone frame' : frameAction,
			'delete frame' : frameAction,
			'move frame' : frameAction
		};

	//restores pixel actions on layer
	function layerAction(){

		if (!sprite.layerStack.find(obj => obj.id==hist.layerId)) {			
			restoreLayers();
			return;
		}

		//move to location
		sprite.setFrame(hist.frameNum);
		fPanel.selectThumb(hist.frameNum);
		updateArtboard();
		selectLayer(hist.layerId, true);

		//put saved data on layer
		clearBuffer();
		buffer.imageSmoothingEnabled = false;	
		buffer.putImageData(hist.imgData, 0, 0);
		putBuffer(layerContext, hist.layerId);
	}

	//restores entire layer on all frames
	function restoreLayers(){
		//creates layer on all sprite frames
		createLayer(hist.order, false, hist.layerId, hist.name, hist.visible);

		//restore layer properties
		let layerProps = sprite.layerProps(hist.layerId);
		layerProps.name = hist.name;
		//opacity and other layer properties...

		//restore layer data on every frame
		for (let f = 0; f < sprite.frameData.length; f++){
			let fnum = sprite.frameData[f].num,
				spriteImg = sprite.layerData(hist.layerId, fnum).img,
				imgData = hist.imgData[fnum];
			spriteImg.data.set(imgData);
		}

		updateArtboard();
	}

	function renameLayer(otherLayerId){
		let lId = otherLayerId || hist.layerId;


	}

	function addLayer(){
		//undo
		if (inc < 0){
			deleteLayer(hist.layerId);
		}else{

		}
	}

	function frameAction(){

	}

	console.log('Undo: '+hist.action);
	action[hist.action]();

	//set the current entry
	undolist.currentEntry = i;
}

//set when drawing or performing any action
function setHistory(actionType){
	
	let layerId = props.layerId,
		frameNum = sprite.frameNum;

	let action = {
		'draw' : captureLayer,
		'select layer' : captureLayer,
		'delete layer' : captureLayerOnAllFrames, 
		'add frame' : frameAction,
		'delete frame' : frameAction,
		'clone frame' : frameAction,
		'move frame' : frameAction,
		};

	let layerInfo = sprite.layerProps(layerId),//get info on current layer
		capture = {
			action : actionType,
			layerId : layerId,
			frameNum : frameNum,
			name : layerInfo.name,
			order : layerInfo.stackPos,
			visible : layerInfo.visible
		},
		bw = bufferElement.width,
		bh = bufferElement.height;


	//Capture + layer pixels on all frames
	function captureLayerOnAllFrames(){
		capture['imgData'] = {};

		for (let f = 0; f < sprite.frameData.length; f++){
			let fnum = sprite.frameData[f].num,
				spriteImg = sprite.layerData(layerId, fnum).img.data;

			capture['imgData'][fnum] = spriteImg;	
			console.log('capturing imgdata frame:'+fnum+'data:'+capture['imgData'][fnum]);
		}
		return capture;
	}
	//Capture + pixels on single layer
	function captureLayer(){
		capture['imgData'] = new ImageData(sprite.width, sprite.height);
		setBuffer(layerId);
		capture.imgData = buffer.getImageData(0, 0, bw, bh);
		return capture;
	}

	//Capture frame info when altering frame
	function frameAction(){
		return capture;
	}

	function frameBackup(){
		//for loop of same as layerAction
		return capture;
	}

	//Add history to states

	//if this is not the last entry, branch into a new timeline
	let n = (undolist.state.length-1) - undolist.currentEntry;
	if (n > 0){
		console.log('starting new timeline');		
		for (let j = 0; j < n; j++){
			hPanel.removeItem(undolist.state.length-1);//updating history panel
			undolist.state.pop();
		}		
	}

	//to prevent too many states from being recorded
	if (undolist.state.length >= undolist.maxEntry){
		hPanel.removeItem(0);//updating history panel
		undolist.state.shift();
	}

	//adding new state's properties
	undolist.state.push(action[actionType]());
	project.saved = false;

	//updating history panel
	hPanel.addItem(actionType == 'draw' ? (toolProps.mode+' '+toolProps.type+' tool') : actionType);

	let i = undolist.state.length-1;
	undolist.currentEntry = i;

	console.log('H'+undolist.currentEntry+'"'+actionType+'" at f:'+undolist.state[i].frameNum+', l:'+undolist.state[i].layerId);
	
}



/******HELPERS********/
function isEven(value) {
	if (value%2 == 0)
		return true;
	else
		return false;
}

function forEach(selector, fn){
	let elements = document.querySelectorAll(selector);
	for (let i = 0; i < elements.length; i++){
		fn(elements[i]);
	}
}

function round(amount){
	return Math.round(amount*100)/100;
}


function cap(v, min, max) {
    return (Math.min(max, Math.max(min, v)));
}

function inArray(arr, value){
	for (var i = 0 ; i < arr.length; i++){
		if (arr[i] == value) return true;
	}
	return false;
}

function delArray(arr, value){
	let newArray = [];
	for (var i = 0 ; i < arr.length; i++){
		if (arr[i] !== value) newArray.push(arr[i]);
	}	
	return newArray;
}

function getHex(r,g,b){
	var value = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	return value.toUpperCase();
}

function toggleClass(element, className){
	let oldClass = element.className.trim(),
		newClass = oldClass.replace(className, '').trim();

	if (newClass == oldClass){
		newClass = newClass+' '+className;
	}

	if (newClass.length > 1) element.className = newClass.trim();
		else element.removeAttribute('class');
}

function findDistance(fromX, fromY, toX, toY, roundUp){
	var dx = fromX-toX,
		dy = fromY-toY,
		result = Math.sqrt(dx*dx + dy*dy)
	
	if (roundUp) result = Math.round(result*100)/100;
	return result;	
}

function findDegree(x1, y1, x2, y2){
	let dx = x2-x1,
		dy = y2-y1,
		deg = Math.atan(dy/dx) * (180/Math.PI);

	return isNaN(deg) ? 0 : deg;
}

function animateNode(node, nodeTo, offsetX, offsetY, opposite){
	let to = nodeTo,
		from = document.createElement('div'),
		rectTo = nodeTo.getBoundingClientRect(),
		rectFrom = node.getBoundingClientRect(),
		speed = .2;

	from.style.position = 'absolute';
	from.style.top = rectFrom.top+'px';
	from.style.left = rectFrom.left+'px';
	from.style.backgroundColor = node.style.backgroundColor;
	from.className = node.className+' swatchAnim';

	let container = document.getElementById('app-container');
	container.appendChild(from);

	var fromX = rectFrom.left,
		fromY = rectFrom.top,
		toX = parseInt(rectTo.left+offsetX),
		toY = parseInt(rectTo.top+offsetY),
		opacity = 1;

	if (opposite){
		toX = parseInt(rectTo.right-offsetX);
		toY = parseInt(rectTo.bottom-offsetY);		
	}

	var slide = setInterval(function(){
		var dx = toX - fromX,
			dy = toY - fromY,
			dist = Math.sqrt(dx*dx+dy*dy),
			angle = Math.asin(Math.abs(dy)/dist),				
			b_dx = Math.sign(dx)*Math.cos(angle)*speed,						
			b_dy = Math.sign(dy)*Math.sin(angle)*speed;
		
		if (dist > speed){
			fromX += b_dx;
			fromY += b_dy;
		}
		else{
			clearInterval(slide);
			container.removeChild(from);
		}
		from.style.left = fromX+'px';
		from.style.top = fromY+'px';

		speed+=.02;
		//opacity = opacity > 0 ? opacity-(speed/200) : 0;
		//from.style.opacity = opacity;

	}, 1);

}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function compareArray(array1, array2){

	if (array1.length != array2.length || array1.length == 0 || array2.length == 0){
		return false;
	}

	for (let i = 0; i < array1.length; i++){
		if (array1[i] !== array2[i]) return false;
	}
	return true;
}

function parseFileData(str){
	var fileData = {}, //obj to be returned
		obj = [],		//tree of objects
		keyName = '',
		keyValue = '',
		tempValue = '',
		tree = 0, //keeps track of the object tree
		treeBack = 0, //amount to withdraw from tree
		mode = 0;

	obj.push(fileData);
	str += '$';

	for (let i = 0; i < str.length; i++){
		let c = str.charAt(i);
		
		if (c == '$') { 

			if (keyName != '' && (keyValue != '' || Array.isArray(keyValue))){
				//add value to new object key
				//if (Array.isArray(obj)) obj.push(keyValue)///not gonna work collect vars in a side object
				obj[tree][keyName] = keyValue; 

				//move tree back
				if (treeBack > 0) shrinkTree();				

				//branch new array and branch 1st object
				if (mode == 4){

					obj.push(obj[tree][keyName]); //array
					tree = obj.length-1;

					if (Array.isArray(obj[tree])) {

						obj[tree].push({}); //obj into array
						obj.push(obj[tree][obj[tree].length-1]);
						tree = obj.length-1;
					}
				}

				//branch new object and delete old branch (orig ref still in fileData)
				//new obj in current array
				if (mode == 5){
					
					obj.pop();
					let oldObj = obj[tree-1];//array
					oldObj.push({});

					obj.push(oldObj[oldObj.length-1]);
					tree = obj.length-1;
					
				}
			}

			keyName = ''; 
			keyValue = ''; 
			mode = 1; 
			continue;
		}

		if (c == ':'){
			mode = 2;
			continue;
		}

		if (c == '['){
			mode = 3;
			keyValue = [];
			continue;
		}

		if (c == '{'){
			if (mode == 3) mode = 4;

			continue;
		}

		if (c == '}'){
			//if (mode == 0) shrinkTree();
			mode = 5;
			continue;
		}

		if (c == ']'){
			
			if (mode == 3) {
				if (tempValue != '') keyValue.push(parseInt(tempValue));
				tempValue = '';
				continue;
			}

			if (mode == 5) treeBack++;
			treeBack++;			

			mode = 0;
			continue;
		}

		//make new key
		if (mode == 1){
			keyName += c;
		}

		//make new value
		if (mode == 2){
			keyValue += c;
		}

		//Make new array value
		if (mode == 3){
			if (c == ',') {
				if (tempValue != '') keyValue.push(parseInt(tempValue));
				tempValue = '';
			}
			else if (c == '!'){
				let col = keyValue.slice(-4);
				for (let r = 0; r < parseInt(tempValue); r++){
					for (let c = 0; c < col.length; c++){
						keyValue.push(col[c]);
					}					
				}
				tempValue = '';
			}
			else tempValue += c;			
		}
	}

	function shrinkTree(){
		for (let t = 0; t < treeBack; t++){
			obj.pop();
			tree--;
		}
		treeBack = 0;
	}

	return fileData;
}


function pointerType(e, type){
	if (e.pointerType == 'mouse'){
	}
	else
	if (e.pointerType == 'pen'){

	}
	else
	if (e.pointerType == 'touch'){

	}
}