var ExportMenuPanel = function(){
	this.parent = '#app-container';

	//component reference
	this.splash;

	//button references
	this.quickExport;

	//existing project props
	this.file = {
		name : 'default',
		nameByFrame : true,
		type : 'spritesheet',
		autoSize : true, 		//determine size based on rows and columns set
		sprite : {}, //reference to sprite
		canvas : {}, //canvas to be exported for spritesheets
	}

	//update UI
	this.ui = {
		values : {},					//Store values
		updateCallback : function(){} 	//function to run when ui updates - set in main on init
	};
}

//set menu parameters
ExportMenuPanel.prototype.config = function(mainSprite){
	let fAmount = mainSprite.frameData.length;

	this.file.sprite = mainSprite;
	this.ui['wBox'].update(mainSprite.width);
	this.ui['wBox'].setFormat('number', mainSprite.width, 2048);

	this.ui['hBox'].update(mainSprite.height);
	this.ui['hBox'].setFormat('number', mainSprite.height, 2048);
	this.ui['wBox'].pair.set(this.ui['hBox'], 'aspect', setPreview.bind(this));
	function setPreview(){
		this.updatePreview('update');
	}

	this.ui['name'].setFormat('filename');
	this.ui['name'].update(mainSprite.name);

	this.ui['fps'].update(mainSprite.fps); 

	this.ui['fRangeStart'].update(1);
	this.ui['fRangeStart'].setFormat('number', 1, fAmount);
	this.ui['fRangeEnd'].update(fAmount);
	this.ui['fRangeEnd'].setFormat('number', 1, fAmount);  
	this.ui['fRangeStart'].pair.set(this.ui['fRangeEnd'], 'range');

	this.ui['cols'].setFormat('number', 1, fAmount);
	this.ui['rows'].setFormat('number', 1, fAmount);

	//this.ui.values[k] = mainSprite[k]; 

	//reset menu
	this.ui['menu'].button['project-format-sheet'].setActiveTab();
	this.file.type = 'spritesheet';
	this.clearPreview();
	this.updatePreview('auto', 'auto');
}

ExportMenuPanel.prototype.init = function (){

	this.splash = new Component('splashPanel');
	this.splash.appendTo(this.parent);

	let win = this.splash.createWindow('export');

//Left Export Settings
	let leftMenu = new Component('subPanel', 'project-export-settings');
	leftMenu.appendTo(win);
	leftMenu.setHeight('3');

	let titleBar = new Component('titleBar');
	titleBar.appendTo(leftMenu);
	titleBar.addTitle('EXPORT PROJECT');

	//left content
	let content = new Component('contentBox');
	content.appendTo(leftMenu);

//--project name box
	let projName = new Component('classBox', 'export-name');
	projName.appendTo(content);
	//--Title
	let projTitle = new Component('titleBarHeading');
	projTitle.appendTo(projName);
	projTitle.addTitle('FILE NAME');
	//--input field / name
	this.ui['name'] = projName.addGizmo('textBox', 'export-name', 'new_file', '', addName.bind(this));
	this.ui['name'].setFormat('filename');

	function addName(val){
		this.file.name = val;
		this.updatePreview('auto', 'auto');
	}	
//--project frame settings
	let frameSet = new Component('classBox', 'export-frames');
	frameSet.appendTo(content);
	//--Title
	let frameTitle = new Component('titleBarHeading');
	frameTitle.addTitle('FRAMES');
	frameTitle.appendTo(frameSet);
	//--frame
	let frame = new Component('frame');
	frame.appendTo(frameSet);

	this.ui['fRangeStart'] = frame.addGizmo('textBox', 'export_frame_start', 0, 'range ', setStart.bind(this));
	this.ui['fRangeStart'].setFormat('number', 1, 500);
	function setStart(val){
		this.updatePreview('auto', 'auto');
	}
	this.ui['fRangeEnd'] = frame.addGizmo('textBox', 'export_frame_end', 0, 'to', setEnd.bind(this));
	this.ui['fRangeEnd'].setFormat('number', 1, 500);
	function setEnd(val){
		this.updatePreview('auto', 'auto');
	}
	//--frame
	frame = new Component('frame');
	frame.appendTo(frameSet);

	this.ui['fps'] = frame.addGizmo('textBox', 'export_fps', 0, 'speed$fps', setFps.bind(this));
	this.ui['fps'].setFormat('number', 1, 60);
	function setFps(val){
		this.updatePreview('auto', 'auto');
	}

//--project size settings
	let sizeSet = new Component('classBox', 'project-size');
	sizeSet.appendTo(content);
	//--Title
	let sizeTitle = new Component('titleBarHeading');
	sizeTitle.addTitle('EXPORT SCALE');
	sizeTitle.appendTo(sizeSet);
	//--frame
	frame = new Component('frame');
	frame.appendTo(sizeSet);
	//--width/height
	this.ui['wBox'] = frame.addGizmo('textBox', 'export_width', 0, 'width$px', setWidth.bind(this));
	this.ui['wBox'].setFormat('number', 1, 2048);
	function setWidth(val){
		//no need - in config wBox and hBox is paired and runs a callback once when both is updated
	}
	this.ui['hBox'] = frame.addGizmo('textBox', 'export_height', 0, 'height$px', setHeight.bind(this));
	this.ui['hBox'].setFormat('number', 1, 2048);
	function setHeight(val){		
			
	}

	//--Export Button
	content.addButton('cta', 'export-sprite', 'EXPORT SPRITE');	
	content.mapButton('export-sprite', exportSprite.bind(this));

//Right Format Settings
	let rightMenu = new Component('subPanel', 'project-export-format');
	rightMenu.appendTo(win);
	rightMenu.setHeight('4');

	//Top Bar
	let topMenu = new Component('topMenu');
		topMenu.appendTo(rightMenu);

	//Preview
	frame = new Component('frame');
	frame.appendTo(rightMenu);
	frame.DOM.className += ' preview';

	this.ui['viewport'] = new Component('classBox', 'viewport');
	this.ui['viewport'].appendTo(frame);

	this.file.canvas = document.createElement('canvas');
	this.file.canvas.width = 360;
	this.file.canvas.height = 215;

	this.ui['viewport'].DOM.appendChild(this.file.canvas);



//Sub panels

//--Spritesheet config
	let sheetPanel = new Component('subPanel', 'project-format-sheet'); 
		sheetPanel.appendTo(rightMenu);

	//titlebar
	titleBar = new Component('titleBarHeading');
	titleBar.addTitle('SPRITESHEET SETTINGS');
	titleBar.addTitle('PROPERTIES');
	titleBar.appendTo(sheetPanel);

	//Content
	content = new Component('contentBox');
	content.appendTo(sheetPanel);

	//left frame
	frame = new Component('frame');
	frame.DOM.className += ' col gutter';
	frame.appendTo(content);

	this.ui['cols'] = frame.addGizmo('numberDrag', 'sheet_columns', 1, 'columns', setCols.bind(this));
	
	function setCols(val){
		this.updatePreview(val, 'auto');

	}

	this.ui['rows'] = frame.addGizmo('numberDrag', 'sheet_rows', 1, 'rows', setRows.bind(this));

	function setRows(val){
		this.updatePreview('auto', val);

	}
	this.ui['padding'] = frame.addGizmo('numberDrag', 'sheet_padding', 0, 'padding$px', setPadding.bind(this));
	this.ui['padding'].setFormat('number', 0, 50);
	function setPadding(val){
		this.updatePreview('auto', 'auto', val);

	}

	frame.activateGizmos();

	//right frame
	this.ui['sProps'] = new Component('frame');
	this.ui['sProps'].DOM.className += ' col gutter properties';
	this.ui['sProps'].appendTo(content);

	this.ui['sProps'].addText('PNG Image');
	this.ui['sProps'].addText('2048 &times; 1024');
	this.ui['sProps'].addText('43 frames @ 12fps (3.8s)');

//--PNG config
	let pngPanel = new Component('subPanel', 'project-format-png'); 
	pngPanel.appendTo(rightMenu);

	//titlebar
	titleBar = new Component('titleBarHeading');
	titleBar.addTitle('PNG SETTINGS');
	titleBar.addTitle('PROPERTIES');
	titleBar.appendTo(pngPanel);

	//Content
	content = new Component('contentBox');
	content.appendTo(pngPanel);

	//left frame
	frame = new Component('frame');
	frame.DOM.className += ' col gutter';
	frame.appendTo(content);

	frame.addButton('check', 'png-frame-name', 'name files by frame number').toggle(this.file.nameByFrame);
	frame.mapButtons({
		'png-frame-name' : togglePNGFrameName.bind(this)
	})
	function togglePNGFrameName(){
		this.file.nameByFrame = !this.file.nameByFrame;
	}

	//right frame
	this.ui['pngProps'] = new Component('frame');
	this.ui['pngProps'].DOM.className += ' col gutter properties';
	this.ui['pngProps'].appendTo(content);

	this.ui['pngProps'].addText('4 PNG Images');
	this.ui['pngProps'].addText('2048 &times; 1024');
	this.ui['pngProps'].addText('43 frames @ 12fps (3.8s)');

//--GIF config
	let gifPanel = new Component('subPanel', 'project-format-gif'); 
	gifPanel.appendTo(rightMenu);

	//titlebar
	titleBar = new Component('titleBarHeading');
	titleBar.addTitle('GIF SETTINGS');
	titleBar.addTitle('PROPERTIES');
	titleBar.appendTo(gifPanel);

	//Content
	content = new Component('contentBox');
	content.appendTo(gifPanel);

	//left frame
	frame = new Component('frame');
	frame.DOM.className += ' col gutter';
	frame.appendTo(content);

	this.ui['quality'] = frame.addGizmo('numberDrag', 'gif_quality', 10, 'quality', setQuality.bind(this));
	this.ui['quality'].setFormat('number', 1, 10);
	function setQuality(val){
		this.updatePreview();
	}

	this.ui['repeat'] = frame.addGizmo('numberDrag', 'gif_repeat', 0, 'repeat', setRepeat.bind(this));
	this.ui['repeat'].setFormat('number', 0, 99);
	function setRepeat(val){
		this.updatePreview();

	}

	//right frame
	this.ui['gifProps'] = new Component('frame');
	this.ui['gifProps'].DOM.className += ' col gutter properties';
	this.ui['gifProps'].appendTo(content);

	this.ui['gifProps'].addText('GIF Animation');
	this.ui['gifProps'].addText('2048 &times; 1024'); 
	this.ui['gifProps'].addText('256 colors (converted)');
	this.ui['gifProps'].addText('43 frames @ 12fps (3.8s)');

//menu tabs
	
	topMenu.addButton('tab', 'project-format-sheet', 'SPRITESHEET').toggleMenu(true).radio('exportmenu');	
	topMenu.mapButton('project-format-sheet', setSheet.bind(this));	
	function setSheet(){
		if (this.file.type != 'spritesheet')
			this.clearPreview();
		this.file.type = 'spritesheet';
		this.updatePreview('update');	
	}
	topMenu.addButton('tab', 'project-format-png', 'PNG SEQUENCE').toggleMenu(false).radio('exportmenu');
	topMenu.mapButton('project-format-png', setPng.bind(this));	
	function setPng(){
		this.file.type = 'png';
		this.updatePreview();	
	}
	topMenu.addButton('tab', 'project-format-gif', 'GIF ANIMATION').toggleMenu(false).radio('exportmenu');
	topMenu.mapButton('project-format-gif', setGif.bind(this));	
	function setGif(){
		if (this.file.type != 'gif')
			this.clearPreview();
		this.file.type = 'gif';
		this.updatePreview();	
	}

	topMenu.addButton('function', 'file-close', 'mdi-close');
	topMenu.mapButton('file-close', closeWindow.bind(this));	
	this.ui['menu'] = topMenu;


	function closeWindow(){
		this.splash.hideWindow();
	}

	//executive function
	function exportSprite(){
		if (this.file.type == 'gif') {
			//gather frame range and fps, modify this function:
			this.exportGIF(true);
		}
		if (this.file.type == 'png') {
			//gather mixdowns and export for each

			let fStart = parseInt(this.ui['fRangeStart'].value),
				fEnd = parseInt(this.ui['fRangeEnd'].value),
				frames = Math.abs(fEnd - fStart)+1;

			
			this.exportPNG(this.file.canvas, this.ui['name'].value);
			
		}
		if (this.file.type == 'spritesheet') {
			this.exportPNG(this.file.canvas, this.ui['name'].value);
		}
	}
	
}

ExportMenuPanel.prototype.updatePreview = function(cols, rows, padding){
	if (this.file.type == 'spritesheet') this.layoutSheet(cols, rows, padding); 

	if (this.file.type == 'png') this.layoutThumbs();
	if (this.file.type == 'gif') this.layoutAnim();
}
ExportMenuPanel.prototype.layoutThumbs = function(){
	let spriteData = this.file.sprite,	
		fileName = this.ui['name'].value,
		fps = this.ui['fps'].value,
		spriteW = parseInt(this.ui['wBox'].value),
		spriteH = parseInt(this.ui['hBox'].value),
		fStart = parseInt(this.ui['fRangeStart'].value),
		fEnd = parseInt(this.ui['fRangeEnd'].value),
		frames = Math.abs(fEnd - fStart)+1,
		_this = this;

	this.clearPreview();

	this.file.canvas = [];
	let num = 0; //if not using frame numbers to name files
	for (let fnum = fStart; fnum <= fEnd; fnum++){
		num++; 

		this.file.canvas.push(document.createElement('canvas'));
		let i = this.file.canvas.length-1,
			canvas = this.file.canvas[i];
		canvas.width = spriteW;
		canvas.height = spriteH;

		let thumb = document.createElement('div');
		thumb.className = 'thumb-file';
		thumb.appendChild(canvas);
		this.ui['viewport'].DOM.appendChild(thumb);

		let mixdown = spriteData.getFrameData(fnum).mixdown,
			ctx = canvas.getContext('2d');


		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(mixdown, 0, 0, mixdown.width, mixdown.height, 0, 0, spriteW, spriteH);

		//file name on thumb ... good idea? also thumbsize variable or "icon size"?
		let label = document.createElement('span'),
			pad = '',
			n = this.file.nameByFrame ? fnum : num;

		if (n < 10) pad = '0';

		label.innerHTML = fileName + '_' + pad + n +'.png';
		thumb.appendChild(label);
	}

	//update properties
	let s = frames > 1 ? 's' : '';
	this.ui['pngProps'].updateText(frames+' PNG file'+s+' ('+spriteW+' &times; '+spriteH+')', 0);
	this.ui['pngProps'].updateText(getFileSizes(this.file.canvas)+' total', 1); 
	this.ui['pngProps'].updateText(frames+' frames @ '+fps+'fps ('+round(frames/fps)+'s)', 2);
	

}
ExportMenuPanel.prototype.layoutAnim = function(){

	let img = document.createElement('img'),
		viewport = this.ui['viewport'].DOM,
		spriteW = parseInt(this.ui['wBox'].value),
		spriteH = parseInt(this.ui['hBox'].value),
		fps = this.ui['fps'].value,
		fStart = parseInt(this.ui['fRangeStart'].value),
		fEnd = parseInt(this.ui['fRangeEnd'].value),
		frames = Math.abs(fEnd - fStart)+1;

	img.width = spriteW;
	img.height = spriteH;
	img.className = 'thumb-gif';

	let frame = document.createElement('div');
	frame.className = 'thumb-file';

	this.clearPreview();
	frame.appendChild(img);
	viewport.appendChild(frame);

	let _this = this;
	img.onload = function(){
		_this.ui['gifProps'].updateText(spriteW+' &times; '+spriteH, 1); 
		_this.ui['gifProps'].updateText(frames+' frames @ '+fps+'fps ('+round(frames/fps)+'s)', 3);
		this.width = spriteW;
		this.height = spriteH;
	}
	img.src = this.exportGIF();
	img.className = 'gif-image';

}

ExportMenuPanel.prototype.layoutSheet = function(cols, rows, padding){

	//add canvas if empty
	let viewport = this.ui['viewport'].DOM;
	if (!viewport.lastChild) {
		this.file.canvas = document.createElement('canvas');
		viewport.appendChild(this.file.canvas);
	}

	let canvas = this.file.canvas,
		spriteData = this.file.sprite,	//current sprite passed via .config from main : sprite
		fps = this.ui['fps'].value,
		spriteW = parseInt(this.ui['wBox'].value),
		spriteH = parseInt(this.ui['hBox'].value),
		fStart = parseInt(this.ui['fRangeStart'].value),
		fEnd = parseInt(this.ui['fRangeEnd'].value),
		frames = Math.abs(fEnd - fStart)+1,
		_this = this;

	//if just padding set
	if (!isNaN(padding)){
		cols = parseInt(this.ui['cols'].value);
		rows = parseInt(this.ui['rows'].value);
		updateSheet();
		return;
	}
	else
	padding =  parseInt(this.ui['padding'].value);

	//if updating from left panel only
	if (cols == 'update'){
		cols = parseInt(this.ui['cols'].value);
		rows = parseInt(this.ui['rows'].value);
		updateSheet();
		return;
	}

	//auto layout
	if (cols == 'auto' && rows == 'auto'){
		
		//more or less equal rows
		let gridValue = Math.sqrt(frames),
			gridAmount = Math.round(gridValue),
			remainder = gridValue - gridAmount;

		cols = gridAmount + Math.ceil(remainder);
		rows = gridAmount;

		//update UI
		this.ui['cols'].update(cols);
		this.ui['cols'].setFormat('number', 1, frames);
		this.ui['rows'].update(rows);	
		this.ui['rows'].setFormat('number', 1, frames);

		
		updateSheet();
		return;
	}



	//just cols set
	if (!isNaN(cols)){
		rows = Math.ceil(frames / cols);
		this.ui['rows'].update(rows);
		updateSheet();
		return;
	}

	//just rows set
	if (!isNaN(rows)){
		cols = Math.ceil(frames / rows);
		this.ui['cols'].update(cols);
		updateSheet();
		return;
	}

	function updateSheet(){
		let cw = (cols * spriteW) + ((cols-1) * padding),
			ch = (rows * spriteH) + ((rows-1) * padding),
			ri = 0,
			ci = 0;

		//first resize canvas
		canvas.width = cw;
		canvas.height = ch;

		let ctx = canvas.getContext('2d');
		ctx.imageSmoothingEnabled = false;
		ctx.clearRect(0, 0, cw, ch);

		for (let fnum = fStart; fnum <= fEnd; fnum++){
			let fx = (spriteW+padding)*ci,
				fy = (spriteH+padding)*ri; 

			let mixdown = spriteData.getFrameData(fnum).mixdown;

			ctx.drawImage(mixdown, 0, 0, mixdown.width, mixdown.height, fx, fy, spriteW, spriteH);

			//horizontal flow
			if (ci < cols-1) ci++; 
			else {
				ci = 0;
				ri++;
			}
			//if (ci < cols) ci++; else ci = 0;
		}

		//update file info
		_this.ui['sProps'].updateText(cw+' &times; '+ch+' ('+getFileSize(canvas)+')', 1);
		_this.ui['sProps'].updateText(frames+' frames @ '+fps+'fps ('+round(frames/fps)+'s)', 2);

		//update export source
		_this.file.canvas = canvas;
	}

}


ExportMenuPanel.prototype.clearPreview = function(){
		let viewport = this.ui['viewport'].DOM;

		while (viewport.lastChild){
			viewport.removeChild(viewport.lastChild);
		}
}

//Exporting Files 

ExportMenuPanel.prototype.exportGIF = function(generateFile){

	let fps = this.ui['fps'].value,
		spriteW = parseInt(this.ui['wBox'].value),
		spriteH = parseInt(this.ui['hBox'].value),
		fStart = parseInt(this.ui['fRangeStart'].value),
		fEnd = parseInt(this.ui['fRangeEnd'].value),
		frames = Math.abs(fEnd - fStart)+1,
		quality = 10 - parseInt(this.ui['quality'].value) +1,
		fileName = this.ui['name'].value,
		repeat = parseInt(this.ui['repeat'].value);

	if (generateFile) {
		//fileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
		sprite.compileGif(spriteW, spriteH, fStart, fEnd, fps, repeat, fileName, quality);
		appFeedback.newMsg('Generating GIF image...', 2000);
	}else{
		let gifBinary = sprite.compileGif(this.file.sprite.width, this.file.sprite.height, fStart, fEnd, fps, repeat, '', quality);
		
		return 'data:image/gif;base64,'+encode64(gifBinary);
	}	
}

ExportMenuPanel.prototype.exportPNG = function(source, name){
	let fileName = name;//.replace(/[^a-z0-9]/gi, '_').toLowerCase();
	

	if (!source.width){
		let zip = new JSZip();
		for(let i = 0; i < source.length; i++){
			let pad = '',
				n = i+1;

			if (n < 10) pad = '0';

			let fname = fileName + '_' + pad + n +'.png';

			source[i].toBlob(function(blob) {
				zip.file(fname, blob);
				if (n >= source.length) makeZip();
			});
		}
		//var img = zip.folder("images");
		//img.file("smile.gif", imgData, {base64: true});
		function makeZip(){
			zip.generateAsync({type:"blob"}).then(function(content) {	
				saveAs(content, fileName+".zip");
			});

		}
	}
	else{
		source.toBlob(function(blob) {
			saveAs(blob, fileName+".png");
		});
	}	
	//canvas.toBlob(function(blob){...}, 'image/jpeg', 0.95); // JPEG at 95% quality
}

function getFileSize(canvas){
	var data_url = canvas.toDataURL("image/png"),
		head = 'data:image/png;base64,',
		imgFileSize = Math.round((data_url.length - head.length)*3/4);

	if (imgFileSize > 10**6) return round(imgFileSize / 10**6).toString()+' MB';
	else
	if (imgFileSize > 10**3) return round(imgFileSize / 10**3).toString()+' KB';
	else
	return imgFileSize.toString()+' bytes';
}


function getFileSizes(canvas){
	let imgFileSize = 0,
		head = 'data:image/png;base64,';

	for (let i = 0; i < canvas.length; i++){
		let data_url = canvas[i].toDataURL("image/png");
		imgFileSize += Math.round((data_url.length - head.length)*3/4);
	}
	

	if (imgFileSize > 10**6) return round(imgFileSize / 10**6).toString()+' MB';
	else
	if (imgFileSize > 10**3) return round(imgFileSize / 10**3).toString()+' KB';
	else
	return imgFileSize.toString()+' bytes';
}