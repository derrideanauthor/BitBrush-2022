var Prerenderer = function (){
	
	this.images = {
		'colorGraph' : { url : 'assets/ui/color-graph.png'}
	}
	this.loaded = 0;

	this.done = function (){};

}

Prerenderer.prototype.render = function(){

	var _this = this;

	for (k in this.images){
		let img = new Image();
	 	
	 	img.onload = function(){
	 		loadedAction(_this.images[k].url);
	 	}
	 	img.src = this.images[k].url;
	 	this.images[k].img = img;
	}	

	//also check window	 
	window.onload = function(){
		loadedAction('window');
	}

	function loadedAction(desc){ 
		let amount = (Object.keys(_this.images).length+1);

	 	_this.loaded++;
		console.log(_this.loaded+'/'+amount+' Asset: "'+desc+'" - loaded');
		if (_this.loaded >= amount){
			_this.done();
		}
	}
}

Prerenderer.prototype.get = function(UIname){
		return this.images[UIname].img;
}

//SL graphs for each hue 
/*	if (UIname == 'colorGraph'){
		// graph size is 186 x 100

		this.img[UIname] = document.createElement('canvas');
		let ctx = this.img[UIname].getContext('2d'),
			col = 18,
			row = 20,
			gw = 186,
			gh = 100,
			gwi = Math.round(gw/100),
			ghi = Math.round(gh/100),
			hue = 0;
		
		this.img[UIname].width = gw * col;
		this.img[UIname].height = gh * row;

		for (let r = 0; r < row; r++){
			for (let c = 0; c < col; c++){
				drawGraph(c*gw, r*gh);
				hue++;	
			}
		}

		function drawGraph(gx, gy){
			for (let s = 0; s <= 100; s++){
				for (let l = 0; l <= 100; l++){
					ctx.fillStyle = 'hsl('+hue+', '+s+'%, '+l+'%)';
					ctx.fillRect(gx+s*gwi, gy+gh-l*ghi, (gwi), (ghi));
				}
			}	
		}
		

	//sprite.getFrameData(frameNum)
	// this.img[UIname].toBlob(function(blob) {
	// 	saveAs(blob, "color-graph.png");
	// });
}*/