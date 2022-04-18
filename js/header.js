var MainPanel = function (){

	//Main GUI for Save/Load, Download
	this.menu;

	//Main Logo/Identity
	this.logo;
	this.logoText = '';
	this.logoURL = 'assets/images/logo.svg';

	//file DOM input
	this.file;
}

MainPanel.prototype.init = function (msgBox){

	//-- ID area (top left)
	this.logo = new Component('panel', 'app-id');
	this.logo.appendTo('#app-menu');
	this.logo.addHeading(this.logoText, this.logoURL);

	//--File panel - keep empty
	let filePanel = new Component('panel', 'app-file'); 
	filePanel.appendTo('#app-menu');
	this.menu = new Component('bottomMenu'); 
	this.menu.appendTo(filePanel);
	//this.menu.addButton('function', 'file-save', 'SAVE');
	//this.menu.addButton('function', 'file-open', 'OPEN');

	//-- File loader
	this.file = document.createElement('input');
	this.file.type = 'file';
	this.file.accept = '.bitbr';
	this.file.capture = 'filesystem';
	this.file.id = 'file-uploader';

	var _this = this;
	this.file.addEventListener('change', loadFile, false);
	function loadFile(e){
		//_this.file = getFileObject(this);
		fMaster.getFileObject(this);
	}

}