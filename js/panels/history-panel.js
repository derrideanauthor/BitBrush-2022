var HistoryPanel = function (){

	this.historyItems;
	this.item = [];
	this.clickItem = function (){};

	this.hidden = false;

	//component reference
	this.panel;

} 

HistoryPanel.prototype.init = function(){
	this.panel = new Component('panel', 'panel-history');
	this.panel.appendTo("#workspace");

	let topMenu = new Component('topMenu');
	topMenu.appendTo(this.panel);

	let historyList = new Component('subPanel', 'history-list');
	historyList.appendTo(this.panel);

	this.historyItems = new Component('contentBox');
	this.historyItems.appendTo(historyList);
	this.historyItems.setHeight('3');


	//drag gizmo
	topMenu.addGizmo('panelDrag', 'history-drag', 'HISTORY');

	/*Top menu buttons + functions*/
	//topMenu.addButton('tab', 'history-list', 'HISTORY');
	topMenu.addButton('function', 'history-close', 'mdi-close');
	topMenu.mapButton('history-close', closeWindow.bind(this));
	function closeWindow(){
		this.panel.DOM.style.display = 'none';
		this.hidden = true;
	}

	this.toggleHide();
	this.panel.activateGizmos();

}
HistoryPanel.prototype.toggleHide = function(){
	if (!this.hidden){
		this.panel.DOM.style.display = 'none';
		this.hidden = true;
	}else{
		this.panel.DOM.style.display = '';
		this.hidden = false;
	}
}

HistoryPanel.prototype.clear = function(stateName){

	let parent = this.historyList.DOM;

	//empty out variant bar
	while (parent.lastChild){
		parent.removeChild(parent.lastChild);
	}

	this.item = [];
}

HistoryPanel.prototype.addItem = function(stateName){

	let btnName = 'state-'+Date.now(),
		newBtn = this.historyItems.addButton('item', btnName, stateName);


	this.item.push(newBtn);
	let index = this.item.length-1;

	this.historyItems.mapButton(btnName, clickItemFunc.bind(this));
	function clickItemFunc(){
		this.clickItem(index);
		this.setActiveItem(index);
	}
	this.setActiveItem(index);
	this.historyItems.DOM.scrollBy(0, 300);
}

HistoryPanel.prototype.setActiveItem = function(index){
	console.log('index '+index+" - "+this.item.length);
	for (i = 0; i < this.item.length; i++){
		if (index == i){
			this.item[i].DOM.setAttribute('data-active','');
			this.item[i].DOM.removeAttribute('data-disabled');
			continue;
		}
		if (i > index){	
			this.item[i].DOM.setAttribute('data-disabled','');
		}
		if (i < index){					
			this.item[i].DOM.removeAttribute('data-disabled');
		}

		this.item[i].DOM.removeAttribute('data-active');
	}
}

HistoryPanel.prototype.refresh = function(stateName){


}


HistoryPanel.prototype.removeItem = function(i){
	this.historyItems.DOM.removeChild(this.item[i].DOM);
	this.item.splice(i, 1);

}