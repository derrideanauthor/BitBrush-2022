var ToolsPanel = function (){

	this.panel;

	//toolbar
	this.toolbar = {};
	this.drawer = {};
}

ToolsPanel.prototype.init = function(){
	this.panel = new Component('panel', 'panel-tools');
	this.panel.appendTo('#app-menu');

/*Drawing tools Panel*/

	let drawingTools = new Component('subPanel', 'tools-drawing');
	drawingTools.appendTo(this.panel);
	drawingTools.setHeight('1');

	//titleBar
	let titleBar = new Component('titleBarBare');
	titleBar.addTitle('DRAWING');
	titleBar.appendTo(drawingTools);

	/*Tools menu*/
	this.toolbar['drawing'] = new Component('bottomMenu');
	this.toolbar['drawing'].appendTo(drawingTools);

	//Various tool submenus
	let drawerOffX = 0,
		btnSize = 40,
		drawerOffY = -btnSize;

	//Brush
	let drawer = new Component('drawer', 'brush-tool');
	drawer.setHeight('2');
	drawer.appendTo(drawingTools);
	drawer.offsetPosition({'bottom' : drawerOffY.toString()+'px', 'left' : (drawerOffX*btnSize).toString()+'px'});
	drawerOffX++;

	this.drawer['brush'] = new Component('topMenu');
	this.drawer['brush'].setHeight('3');
	this.drawer['brush'].appendTo(drawer);
	this.drawer['brush'].addButton('function', 'size-1', 'bb-icon-1x1').toggle(true).radio('brush-size');
	this.drawer['brush'].addButton('function', 'size-2', 'bb-icon-2x2').toggle().radio('brush-size');
	this.drawer['brush'].addButton('function', 'size-3', 'bb-icon-3x3').toggle().radio('brush-size');	
	this.drawer['brush'].addButton('function', 'size-4', 'bb-icon-4x4').toggle().radio('brush-size');	
	//this.drawer['brush'].addButton('function', 'tools-menu', 'mdi-menu');
	this.toolbar['drawing'].addButton('tab', 'brush-tool', 'mdi-brush').toggleMenu(true).radio('tools', false, true);

	//Eraser
	drawer = new Component('drawer', 'eraser-tool');
	drawer.setHeight('2');
	drawer.appendTo(drawingTools);
	drawer.offsetPosition({'bottom' : drawerOffY.toString()+'px', 'left' : (drawerOffX*btnSize)+'px'});
	drawerOffX++;

	this.drawer['eraser'] = new Component('topMenu');
	this.drawer['eraser'].setHeight('3');
	this.drawer['eraser'].appendTo(drawer);
	this.drawer['eraser'].addButton('function', 'size-1', 'bb-icon-1x1').toggle(true).radio('brush-size');
	this.drawer['eraser'].addButton('function', 'size-2', 'bb-icon-2x2').toggle().radio('brush-size');
	this.drawer['eraser'].addButton('function', 'size-3', 'bb-icon-3x3').toggle().radio('brush-size');	
	this.drawer['eraser'].addButton('function', 'size-4', 'bb-icon-4x4').toggle().radio('brush-size');	
	this.toolbar['drawing'].addButton('tab', 'eraser-tool', 'mdi-eraser').toggleMenu(false).radio('tools', false, true);

	//Line
	drawer = new Component('drawer', 'line-tool');
	drawer.setHeight('2');
	drawer.appendTo(drawingTools);
	this.toolbar['drawing'].addButton('tab', 'line-tool', 'mdi-vector-line').toggleMenu(false).radio('tools');

	//Rectangle
	drawer = new Component('drawer', 'rectangle-tool');
	drawer.setHeight('2');
	drawer.appendTo(drawingTools);
	this.toolbar['drawing'].addButton('tab', 'rectangle-tool', 'mdi-vector-square').toggleMenu(false).radio('tools');

	//Ellipse
	drawer = new Component('drawer', 'ellipse-tool');
	drawer.setHeight('2');
	drawer.appendTo(drawingTools);
	this.toolbar['drawing'].addButton('tab', 'ellipse-tool', 'mdi-vector-circle-variant').toggleMenu(false).radio('tools');

	//Color Fill
	drawer = new Component('drawer', 'fill-tool');
	drawer.setHeight('2');
	drawer.appendTo(drawingTools);
	this.toolbar['drawing'].addButton('tab', 'fill-tool', 'mdi-format-color-fill').toggleMenu(false).radio('tools');

	// //Eyedropper
	// drawer = new Component('drawer', 'eyedropper-tool');
	// drawer.setHeight('2');
	// drawer.appendTo(drawingTools);
	// this.toolbar['drawing'].addButton('tab', 'eyedropper-tool', 'mdi-eyedropper').toggleMenu(false).radio('tools');

/*Editing tools Panel*/

	let editingTools = new Component('subPanel', 'tools-editing');
	editingTools.appendTo(this.panel);
	editingTools.setHeight('1');

	//titleBar
	titleBar = new Component('titleBarBare');
	titleBar.addTitle('EDITING');
	titleBar.appendTo(editingTools);

	/*Tools menu*/
	this.toolbar['editing'] = new Component('bottomMenu');
	this.toolbar['editing'].appendTo(editingTools);

	//Various tool submenus
	drawerOffX = -5;

	//marquee tool
	drawer = new Component('drawer', 'marquee-tool');
	drawer.setHeight('2');
	drawer.appendTo(editingTools);
	drawer.offsetPosition({'bottom' : drawerOffY.toString()+'px', 'left' : (drawerOffX*btnSize).toString()+'px'});
	drawerOffX++;

	this.drawer['marquee'] = new Component('topMenu');
	this.drawer['marquee'].setHeight('3');
	this.drawer['marquee'].appendTo(drawer);

	this.drawer['marquee'].addButton('function', 'deselect', 'mdi-selection-off');
	this.drawer['marquee'].addButton('function', 'cut', 'mdi-content-cut');
	this.drawer['marquee'].addButton('function', 'copy', 'mdi-content-copy');
	this.drawer['marquee'].addButton('function', 'paste', 'mdi-content-paste');	
	this.drawer['marquee'].addButton('function', 'clear', 'mdi-close');	
	this.drawer['marquee'].addButton('function', 'reselect', 'mdi-vector-selection');
	//tool button
	this.toolbar['editing'].addButton('tab', 'marquee-tool', 'mdi-selection').toggleMenu(false).radio('tools', false, true);
	this.toolbar['editing'].addButton('tab', 'layer-clear', 'mdi-close');
	this.toolbar['editing'].addButton('tab', 'undo', 'mdi-undo');
	this.toolbar['editing'].addButton('tab', 'redo', 'mdi-redo');


/*Navigation Tools Menu*/

	let navTools = new Component('subPanel', 'tools-nav');
	navTools.appendTo(this.panel);
	navTools.setHeight('1');

	//titleBar
	titleBar = new Component('titleBarBare');
	titleBar.addTitle('NAVIGATION');
	titleBar.appendTo(navTools);

	/*Tools menu*/
	this.toolbar['nav'] = new Component('bottomMenu');
	this.toolbar['nav'].appendTo(navTools);

	//Various tool submenus

	//Pan Tool
	drawer = new Component('drawer', 'art-pan');
	drawer.setHeight('2');
	drawer.appendTo(navTools);
	this.toolbar['nav'].addButton('tab', 'art-pan', 'mdi-cursor-move').toggleMenu(false).radio('tools');

	//Zoom Function
	drawer = new Component('drawer', 'art-zoom');
	drawer.setHeight('2');
	drawer.appendTo(navTools);
	drawerOffX = 0;
	drawer.offsetPosition({'bottom' : drawerOffY.toString()+'px', 'left' : (drawerOffX*btnSize).toString()+'px'});

	this.drawer['zoom'] = new Component('topMenu');
	this.drawer['zoom'].setHeight('3');
	this.drawer['zoom'].appendTo(drawer);

	this.drawer['zoom'].addButton('function', 'art-zoom-in', 'mdi-plus-circle-outline');
	this.drawer['zoom'].addButton('function', 'art-zoom-out', 'mdi-minus-circle-outline');
	this.drawer['zoom'].addButton('function', 'art-fit', 'mdi-arrow-expand-all');//Fit to artboard
	this.drawer['zoom'].addButton('function', 'art-center', 'mdi-image-filter-center-focus');//center artboard
	this.drawer['zoom'].addButton('function', 'art-fullscreen', 'mdi-fullscreen');//.toggle(false, 'mdi-fullscreen');//toggle fullscreen

	//tool button
	this.toolbar['nav'].addButton('tab', 'art-zoom', 'mdi-magnify').toggleMenu(true);
	
	
}