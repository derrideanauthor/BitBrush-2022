FramesPanel = function (){

	this.thumbSize = 65;

	this.title = 'TIMELINE';
	this.titleDOM;

	//button references
	this.panelMenu;
	this.frameTools;

	//preview minimap
	this.minimap;
	this.viewfinder; //Coordinate sets for viewport mask
	this.viewMask; //DOM element
	
	//animation player
	this.player = {
		fps : 12,
		play : false,
		loop : {},
		timeStamp : new Date().getTime(),
		frame : 1,
		sprite : {} //reference to the current sprite
	}

	this.onionSkinGizmo;
	this.onionSkinUpdate = function(){};

	this.style = {
		hColor : window.getComputedStyle(document.documentElement).getPropertyValue('--ui-color-orange')
	};

	/*And you can change it like this: document.documentElement.style.setProperty('--color-font-general', '#000');*/
}

FramesPanel.prototype.init = function(){

	let panel = new Component('panel', 'panel-frames');
	panel.appendTo('#app-main');

/*--left side minimap--*/
	let preview = new Component('panel', 'frames-preview');
	preview.setHeight('4');
	preview.appendTo(panel);

	//Title Bar
	let titleBar = new Component('titleBar');
	titleBar.setHeight('4');
	titleBar.addTitle('PREVIEW');
	titleBar.appendTo(preview);
	titleBar.addGizmo('numberDrag', 'set-fps', 12, 'FPS', setFPS.bind(this));
	titleBar.gizmo['set-fps'].setFormat('number', 0, 60);
	function setFPS(val){
		this.player.fps = val;
		this.player.sprite.fps = val; //update sprite

		if (this.player.fps == 0) this.player.play = false;
			else this.player.play = true;
	}

	//minimap
	let minimap = new Component('subPanel', 'frames-minimap');
	minimap.appendTo(preview);
	this.createMinimap(minimap.DOM);
	this.updateViewfinder(0,0,0,0);

/*--right side panel buttons and timeline--*/

	//Main Panel
	let mainPanel = new Component('panel', 'frames-mainpanel');	
	mainPanel.appendTo(panel);

	//Top Menu
	this.panelMenu = new Component('topMenu');
	this.panelMenu.appendTo(mainPanel);

	//Timeline panel
	let timeline = new Component('subPanel', 'frames-timeline');
	timeline.appendTo(mainPanel);
	timeline.setHeight('3');	

	//Tools Options Menu
	let toolOptions = new Component('subPanel', 'tools-options');
	toolOptions.addTitle("More options");
	toolOptions.appendTo(this.panelMenu);
	toolOptions.setHeight('4');

	//Top Menu Buttons (contains refs to preview and timeline)
	this.panelMenu.addButton('tab', 'frames-preview', 'mdi-movie').toggleMenu(true);
	this.panelMenu.addButton('tab', 'frames-timeline', 'mdi-animation').toggleMenu(true);
	
	//temporary untill proper solution can be thought out for minimizing the frames panel
	this.panelMenu.button['frames-timeline'].toggleTab = false;
	this.panelMenu.button['frames-timeline'].toggleSelf = false;

	this.panelMenu.addButton('function', 'frames-onionskin', 'mdi-checkbox-multiple-blank-circle-outline').toggle();
	this.panelMenu.addButton('tab', 'tools-options', 'mdi-tune').toggleMenu(true);

	//this.panelMenu.addButton('function', 'frames-menu', 'mdi-menu');

	//Title Bar for timeline
	this.titleDOM = new Component('titleBarThin');
	this.titleDOM.addTitle(this.title);
	this.titleDOM.appendTo(timeline);
	this.onionSkinGizmo = this.titleDOM.addGizmo('numberDrag', 'set-onionskin', 0, 'ONIONSKIN', updateOnion.bind(this));
	this.onionSkinGizmo.drag.setDirection('y');

	function updateOnion (val){
		this.onionSkinUpdate(val);
	};


	//Content for frame thumbs
	let frameBox = new Component('contentBox', 'frames-thumbs');
	frameBox.setHeight('2');
	frameBox.appendTo(timeline);

	//Bottom Touch Controls
	this.frameTools = new Component('bottomMenu', 'frames-control');
	this.frameTools.appendTo(timeline);
	this.frameTools.setHeight('1');

	this.frameTools.addButton('function', 'frames-add', 'mdi-plus');
	this.frameTools.addButton('function', 'frames-left', 'mdi-arrow-left');
	this.frameTools.addButton('function', 'frames-right', 'mdi-arrow-right');
	this.frameTools.addButton('function', 'frames-duplicate', 'mdi-content-duplicate');	
	this.frameTools.addButton('function', 'frames-delete', 'mdi-delete');
	this.frameTools.addButton('cta', 'frames-export', 'EXPORT');

	//Activate fps gizmo
	panel.activateGizmos();
}

FramesPanel.prototype.getPanelHeight = function (){
	let timeline = document.getElementById('frames-timeline'),
		height = timeline.offsetHeight || 0;

	if (timeline.style.display == 'none') height = 0;
	return height;
}

FramesPanel.prototype.createMinimap = function (parent){

	this.minimap = document.createElement('canvas');

	this.minimap.id = "minimap";
	this.minimap.width = parent.offsetWidth;
	this.minimap.height = parent.offsetWidth;
	this.minimap.getContext('2d').imageSmoothingEnabled = false;
	parent.appendChild(this.minimap);

	//viewfinder element
	this.viewMask = document.createElement('div');
	this.viewMask.className = 'player-mask';
	parent.appendChild(this.viewMask);

	//Play pause indicator
	let playPause = document.createElement('div'),
		content = document.createElement('span');

	playPause.className = 'player';
	content.className = 'mdi mdi-play';
	playPause.appendChild(content);
	parent.appendChild(playPause);

	//play/pause action
	parent.addEventListener(pointerEvent['click'], playToggle.bind(this), false);
	function playToggle(){
		if (this.player.play){
			this.player.play = false;

			content.className = 'mdi mdi-pause';
			playPause.className = 'player pause';

			this.highlightThumbFrameNum(0);
		}
		else{
			this.player.play = true;
			content.className = 'mdi mdi-play';
			playPause.className = 'player play';
		}
	}

	//small play/pause label
	let smlPlayPause = document.createElement('div'),
		smlContent = document.createElement('span');

	smlPlayPause.className = 'player-icon-sml';
	smlContent.className = 'mdi mdi-play-pause';
	smlPlayPause.appendChild(smlContent);
	parent.appendChild(smlPlayPause);
}


FramesPanel.prototype.updateMinimap = function(spriteFrameData, animation){

	let map = this.minimap.getContext('2d'),
		mw = this.minimap.width,
		mh = this.minimap.height,
		mixdown = spriteFrameData.mixdown;


	//Update Viewfinder
	let view = this.viewfinder,
		ele = this.viewMask,
		borderColor = 'rgba(0,0,0,.4)',
		pw = view.pw,
		ph = view.ph,
		px = view.px,
		py = view.py,
		vt = view.vy < 0 ? 0 : view.vy,
		vb = Math.round(mh-view.vh-view.vy),


		vl = (px+view.vx) < 0 ? 0 : (px+view.vx),
		vr = Math.round(mw-view.vx-view.vw-px);

	
	vb = vb < 0 ? 0 : vb;
	vr = vr < 0 ? 0 : vr;
	

	ele.style.borderTop = vt+'px solid '+borderColor;
	ele.style.borderBottom = vb+'px solid '+borderColor;
	ele.style.borderLeft = vl+'px solid '+borderColor;
	ele.style.borderRight = vr+'px solid '+borderColor;

	//1. dont auto update to current frame if playing. 
	//2. Let player update the animation
	if (!this.player.play || animation){
		map.globalAlpha = 1;
		map.clearRect(0, 0, mw, mh);
		map.imageSmoothingEnabled = false;	
		map.drawImage(mixdown, 0, 0, mixdown.width, mixdown.height, px, py, pw, ph);
		
		map.strokeRect(0,0,150,150);
	}



	//map.fillRect(0, 0, mw, view.vy);
	//map.fillRect(0, Math.round(view.vy+view.vh), mw, Math.round(mh-view.vh-view.vy));
	//map.fillRect(0, view.vy, view.vx, view.vh);
	//map.fillRect(Math.round(view.vx+view.vw), view.vy, Math.round(mw-view.vx-view.vw), view.vh);
}

FramesPanel.prototype.updateViewfinder = function(vx, vy, vw, vh, px, py, pw, ph){
	this.viewfinder = {
		vx : vx,
		vy : vy,
		vw : vw,
		vh : vh,
		px : px, 
		py : py,
		pw : pw,
		ph : ph
	}	
}

FramesPanel.prototype.addThumb = function(frameNum, clickFn){

	//adjust old thumbs
	let thumbs = document.getElementsByClassName('frameThumb');

	for (let j = 0; j < thumbs.length; j++){
		thumbs[j].removeAttribute('data-active'); 
		//move higher frame nums up
		let fnum = parseInt(thumbs[j].getAttribute('data-frame-num'));
		if (fnum >= frameNum){
			fnum++;
			thumbs[j].setAttribute('data-frame-num', fnum);
			thumbs[j].style.order = fnum;
			thumbs[j].childNodes[1].innerHTML = fnum;
		}
	}

	//create new thumb
	let parent = document.getElementById('frames-thumbs'),
		thumb = document.createElement('div'),
		thumbImage = document.createElement('canvas'),
		thumbNum = document.createElement('div');

	thumb.setAttribute('data-frame-num',frameNum);
	thumb.className = 'frameThumb';
	thumb.style.order = frameNum;
	thumb.style.width = this.thumbSize+'px';
	thumb.style.height = this.thumbSize+'px';
	parent.appendChild(thumb);

	thumbImage.width = this.thumbSize;
	thumbImage.height = this.thumbSize;
	thumbImage.getContext('2d').imageSmoothingEnabled = false;
	thumb.appendChild(thumbImage);

	thumbNum.className = 'fnumber';
	thumbNum.innerHTML = frameNum;
	thumb.appendChild(thumbNum);

	//set active
	thumb.setAttribute('data-active','');

	//update the timeline title to reflect new frame added
	this.titleDOM.title[0].DOM.innerHTML = this.title+' ('+frameNum+'/'+thumbs.length+')';

	//action
	thumb.addEventListener(pointerEvent['click'], selectThumb.bind(this), false);
	function selectThumb(e){
		let fnum = thumb.getAttribute('data-frame-num');
		this.selectThumb(fnum);
		clickFn(fnum); 
	}
}

FramesPanel.prototype.selectThumb = function(frameNum){
	let tmbs = document.getElementsByClassName('frameThumb');

	for (let j = 0; j < tmbs.length; j++){
		let fnum = tmbs[j].getAttribute('data-frame-num');
		
		if (fnum == frameNum){
			tmbs[j].setAttribute('data-active','');
		}
		else{
			tmbs[j].removeAttribute('data-active'); 
		}
	}

	this.titleDOM.title[0].DOM.innerHTML = this.title+' ('+frameNum+'/'+tmbs.length+')';
}


FramesPanel.prototype.updateThumb = function(spriteFrameData){
	let thumbData = spriteFrameData.mixdown,
		thumbs = document.getElementsByClassName('frameThumb');


	for (var i = 0; i < thumbs.length; i++){
		let thumb = thumbs[i],
			thumbImage = thumb.firstChild,
			num = thumb.getAttribute('data-frame-num');
		

		if (num == spriteFrameData.num){
			let thumbCtx = thumbImage.getContext('2d');
			thumbCtx.clearRect(0, 0, thumbImage.width, thumbImage.height);
			thumbCtx.drawImage(thumbData, 0, 0, thumbData.width, thumbData.height, 0, 0, thumbImage.width, thumbImage.height);
			break;
		}
	}
}

FramesPanel.prototype.updateAllThumbs = function(spriteFrameDataAll){
	let frameData = spriteFrameDataAll,
		thumbs = document.getElementsByClassName('frameThumb');

	for (var f = 0; f < frameData.length; f++){
		let frame = frameData[f],
			mixdown = frame.mixdown,
			thumb = thumbs[f],
			thumbImage = thumb.firstChild,
			thumbNum = thumb.childNodes[1];

		thumbNum.innerHTML = frame.num;
		thumb.setAttribute('data-frame-num',frame.num);
		thumb.style.order = frame.num;

		let thumbCtx = thumbImage.getContext('2d');
		thumbCtx.clearRect(0, 0, thumbImage.width, thumbImage.height);
		thumbCtx.drawImage(mixdown, 0, 0, mixdown.width, mixdown.height, 0, 0, thumbImage.width, thumbImage.height);			
	}
}

FramesPanel.prototype.playPreview = function(sprite){

	this.player.play = true;
	this.player.sprite = sprite || this.player.sprite;

	var _this = this;

	//Start animation loop
	(function animInterval(){

		var interval = 1000 / _this.player.fps,
	    	now = new Date().getTime(),
	    	delta = now - _this.player.timeStamp;
        if (delta > interval) {
            _this.player.timeStamp = now - (delta % interval);
        	if (_this.player.play) _this.playFrame();
        }		
        _this.player.loop = requestAnimationFrame(animInterval);
	})();
}

FramesPanel.prototype.playFrame = function(){
if (!this.player.play) return;

	let sprite = this.player.sprite,
		amount = sprite.frameData.length,
		fnum = this.player.frame,
		frameData = sprite.getFrameData(fnum);

	this.updateMinimap(frameData, true);
	this.highlightThumbFrameNum(fnum);
   	if (parseInt(fnum) == amount) this.player.frame = 1;   		
   	else this.player.frame++;
}

FramesPanel.prototype.stopPreview = function(){
	this.player.play = false;
	this.player.frame = 1;
}

FramesPanel.prototype.highlightThumbFrameNum = function(fnum){
	let thumbs = document.getElementsByClassName('frameThumb');

	for (let t = 0; t < thumbs.length; t++){
		if (thumbs[t].getAttribute('data-frame-num') == fnum){
			thumbs[t].childNodes[1].style.backgroundColor = this.style.hColor;
			thumbs[t].childNodes[1].style.color = 'white';
		}else{
			thumbs[t].childNodes[1].style.backgroundColor = '';
			thumbs[t].childNodes[1].style.color = '';
		}
	}
}

FramesPanel.prototype.removeAllThumbs = function(){
	//select thumb DOM
	let parent = document.getElementById('frames-thumbs');
	
	while (parent.firstChild){
		parent.removeChild(parent.firstChild);
	}
}


FramesPanel.prototype.removeThumb = function(frameNum){

	//select thumb DOM
	let thumbs = document.getElementsByClassName('frameThumb'),
		parent = document.getElementById('frames-thumbs');

	//cant delete last
	if (thumbs.length == 1) return;


	//find and delete element
	for (let i = 0; i < thumbs.length; i++){
		let tmb = thumbs[i],
			fnum = parseInt(tmb.getAttribute('data-frame-num'));
		//match victim
		if (fnum == frameNum){
			parent.removeChild(thumbs[i]);
			//break;
		}
	}

	for (let i = 0; i < thumbs.length; i++){
		let tmb = thumbs[i],
			fnum = parseInt(tmb.getAttribute('data-frame-num'));

		//adjust frame nums of later frames
		if (fnum > frameNum){
			fnum--;
			tmb.setAttribute('data-frame-num', fnum);
			tmb.style.order = fnum;
			tmb.childNodes[1].innerHTML = fnum;
		}
		//allocate new selected thumb
		if (fnum == frameNum){
			tmb.setAttribute('data-active','');
		}
		if (frameNum == thumbs.length+1){
			if (fnum == thumbs.length){
				tmb.setAttribute('data-active','');
				frameNum = fnum;
			}
		}
	}

	//update timeline title with current/amount of frames
	this.titleDOM.title[0].DOM.innerHTML = this.title+' ('+frameNum+'/'+thumbs.length+')';

	//restart player
	this.player.frame = 1;
}
