
//Glossary
var $_tooltip = {
	'brush-tool' : { title : 'Pixel Brush', sub : 'LB: Primary Color, RB: Secondary Color' },
	'eraser-tool' : { title : 'Eraser Brush'},
	'size-1' : { title : '1&#215;1 px', sub : ''},
	'size-2' : { title : '2&#215;2 px', sub : ''},
	'size-3' : { title : '3&#215;3 px', sub : ''},
	'size-4' : { title : '4&#215;4 px', sub : ''},

	'line-tool' : { title : 'Straight Line', sub : 'SHIFT = Constrain'},
	'rectangle-tool' : { title : 'Rectangle', sub : 'SHIFT = Constrain, ALT = From Center'},
	'ellipse-tool' : { title : 'Ellipse', sub : 'SHIFT = Constrain, ALT = From Center'},
	'fill-tool' : { title : 'Flood Fill', sub : 'LB: Primary Color, RB: Secondary Color'},

	'marquee-tool' : { title : 'Select Pixels', sub : 'SHIFT = Constrain, DRAG to move'},
	'deselect' : { title : 'Remove Selection', sub : 'ESC'},
	'cut' : { title : 'Cut', sub : 'CTRL/CMD + X'},
	'copy' : { title : 'Copy', sub : 'CTRL/CMD + C'},
	'paste' : { title : 'Paste', sub : 'CTRL/CMD + V'},
	'clear' : { title : 'Clear Pixels', sub : 'DEL'},
	'reselect' : { title : 'Remake Selection', sub : 'CTRL/CMD + SHIFT + R'},

	'layer-clear' : { title : 'Clear Layer', sub : 'Deletes layer contents'},
	'undo' : { title : 'Undo', sub : 'CTRL/CMD + Z'},
	'redo' : { title : 'Redo', sub : 'CTRL/CMD + SHIFT + Z'},

	//Navigation
	'art-zoom' : { title : 'Navigation Tools', sub : 'Click to open'},
	'art-zoom-in' : { title : 'Zoom in', sub : ''},
	'art-zoom-out' : { title : 'Zoom out', sub : ''},
	'art-fit' : { title : 'Fit artboard to screen', sub : ''},
	'art-pan' : { title : 'Pan Tool', sub : 'SPACE to autoswitch'},
	'art-center' : { title : 'Center artboard', sub : ''},
	'art-fullscreen' : { title : 'Toggle Fullscreen View', sub : ''},
	//Frames Panel
	'frames-timeline' : { offset : ['aleft', 'top'], title : 'Animation Timeline', sub : '', pointer: "bottom"},
	'frames-onionskin' : { offset : ['aleft', 'top'], title : 'Toggle Onionskin', sub : '', pointer: "bottom"},
	'frames-preview' : { offset : ['aleft', 'top'], title : 'Animation Preview', sub : '', pointer: "bottom"},
	//Color Panel
	'shades-amount' : { offset : ['right', 'center', 10], title : 'Drag up/down', pointer : 'left'},
	'color-picker' : { offset : ['left', 'center'], title : 'Color Picker', pointer : 'right'},
	//Layers Panel
	'layers-all' : { offset : ['left', 'center', -5, -2], title : 'Isolate Layer', pointer : 'right'}
}

var tooltips = function (){
	this.tipBox;
	this.x = 0;
	this.y = 0;
}

tooltips.prototype.init = function(){
	this.tipBox = document.createElement('div');
	this.tipBox.className = 'tooltip';

	let mainText = document.createElement('div');
	mainText.className = 'main';
	this.tipBox.appendChild(mainText);

	let pointer = document.createElement('span');
	pointer.className = 'mdi mdi-triangle';
	this.tipBox.appendChild(pointer);

	let subText = document.createElement('div');
	subText.className = 'sub';
	this.tipBox.appendChild(subText);


	let parent = document.getElementById('app-container');
	parent.appendChild(this.tipBox);


	let _this = this;
	document.addEventListener('mouseover', function(e){

		let btn = e.target;

		if (btn.parentNode.nodeName == 'BUTTON') btn = btn.parentNode;



		let key = btn.getAttribute('data-tab') || btn.getAttribute('data-func') || '';
		_this.tipBox.style.backgroundColor = '';
		pointer.style.color = '';

		//include gizmos
		if (btn.getAttribute('data-gizmo')) {
			_this.tipBox.style.backgroundColor = '#3a78bd';
			pointer.style.color = '#3a78bd';
			key = btn.id;
		}
		
		if (!$_tooltip.hasOwnProperty(key)) {
			_this.tipBox.style.display = ''
			return;
		}

		let rect = btn.getBoundingClientRect(),
			w = btn.offsetWidth,
			h = btn.offsetHeight,
			t1 = $_tooltip[key].title || '',
			t2 = $_tooltip[key].sub || '',
			offset = $_tooltip[key].offset || ['aleft', 'bottom'], //left+w*0|1 top+h*0|1
			title = _this.tipBox.firstChild,
			subtitle = _this.tipBox.lastChild;

		title.innerHTML = t1;
		subtitle.innerHTML = t2;

		_this.tipBox.style.display = 'block';

		//position tooltip box
		let bh = _this.tipBox.offsetHeight,
			bw = _this.tipBox.offsetWidth,
			bx = 0,
			by = 0,
			bxOff = offset[2] || 0,
			byOff = offset[3] || 0;

		
		if (offset[0] == 'aleft') bx = rect.left;
		if (offset[0] == 'left') bx = rect.left-bw;
		if (offset[0] == 'right') bx = rect.right;
		if (offset[0] == 'center') bx = rect.left + w*.5 - bw*.5;

		if (offset[1] == 'atop') by = rect.top;
		if (offset[1] == 'top') by = rect.top-bh;
		if (offset[1] == 'bottom') by = rect.bottom;
		if (offset[1] == 'center') by = rect.top + h*.5 - bh*.5;

		//_this.tipBox.style.left = (rect.left + w*offset[0])+'px';
		_this.tipBox.style.left = (bx+bxOff)+'px';
		_this.tipBox.style.top = (by+byOff)+'px';	
		/*if (offset[1] >= 0)
		_this.tipBox.style.top = (rect.top + h*offset[1])+'px';
		else
		_this.tipBox.style.top = (rect.bottom + h*offset[1]-bh)+'px';*/

		//Position pointer
		if ($_tooltip[key].pointer == 'bottom'){
			pointer.style.top = (bh-5)+'px';
			pointer.style.left = (Math.round(w/2)-7)+'px';
			pointer.style.transform = 'rotate(180deg) scaleY(.6)';
		}
		else
		if ($_tooltip[key].pointer == 'left'){
			pointer.style.top = (Math.round(bh/2))+'px';
			pointer.style.left = '1px';
			pointer.style.transform = 'rotate(270deg) scaleY(.6) translate(50%, -100%)';
		}
		else
		if ($_tooltip[key].pointer == 'right'){
			pointer.style.top = (Math.round(bh/2))+'px';
			pointer.style.left = (bw-5)+'px';
			pointer.style.transform = 'rotate(90deg) scaleY(.6) translateX(-50%)';
		}
		else {
			pointer.style.top = '-10px';
			pointer.style.transform = 'scaleY(.6)';
			pointer.style.left = (Math.round(w/2)-7)+'px';
		}

	}, false);
}

