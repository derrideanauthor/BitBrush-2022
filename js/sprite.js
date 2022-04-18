

var Sprite = function (){

	this.active = false; //has sprite been initiated

	this.name = 'new_sprite';

	this.frameNum = 0; //Current frame number
	this.frameData = [];
	this.frame; //current frame data for easy reference

	this.layerStack = []; //layer properties, same for all frames
	this.layerId; //Current layer Id

	//Size
	this.width;
	this.height;

	//playback
	this.fps = 12;

	//Mixdown stamp - collects layers then stamps on to frame mixdown
	this.stamp = document.createElement('canvas');

	//settings for panels
	this.showHiddenLayers = true; //hidden or not, will appear on mixdowns ...fix onionskinning
}

Sprite.prototype.init = function (w, h){
	this.setSize(w, h);
	this.addFrame(this.frameNum);
	this.active = true;
}

Sprite.prototype.erase = function (){
	this.frameNum = 0; 
	this.frameData = [];
	this.layerStack = [];
	this.width = 0;
	this.height = 0;
}

Sprite.prototype.setSize = function (w, h){
	this.width = w;
	this.height = h;
	this.stamp.width = w;
	this.stamp.height = h;
}

/*---FRAMES---*/

//new frame is added just after
Sprite.prototype.addFrame = function (num, clone){
	let i = parseInt(num)+1,
		makeClone = clone || false;

	//move up existing frames if inserted
	for (let f = 0; f < this.frameData.length; f++){
		if (this.frameData[f].num >= i){
			this.frameData[f].num++;
		}
	}

	this.frameData.push({
		num : i,
		layerData : [],
		mixdown : document.createElement('canvas')
	});

	let n = this.frameData.length-1,
		mix = this.frameData[n].mixdown;
	mix.width = this.width;
	mix.height = this.height;

	//move to new frame
	this.setFrame(i);

	//copy layer data structure from previous layer
	if (n > 0) {
		let prevLayers = this.frameData.find(obj => obj.num==num).layerData;//this.frameData[n-1].layerData;

		//Clone layers to new frame
		for (let l = 0; l < prevLayers.length; l++){
			this.frame.layerData.push({});

			let prevLayer = prevLayers[l],
			    len = this.frame.layerData.length,
				newLayer = this.frame.layerData[len-1];

			newLayer.id = prevLayer.id;

			if (makeClone){
				newLayer.img = prevLayer.img;
			}else{				
				//...Imagedata constructor might not work with android webview
				newLayer.img = new ImageData(this.width, this.height);
			}			
		}
		this.makeLayerMixdown();
	}
}

//delete frame via num
Sprite.prototype.removeFrame = function (num){
	//locate framedata at num
	let frame = this.frameData.find(obj => obj.num==num),
		index = this.frameData.indexOf(frame);
		console.log('removing frame '+num+' at index: '+index);
	if (index < 0) return;
	if (this.frameData.length == 1){
		console.log('cant delete last frame');
		return;
	}

	//remove framedata at num
	this.frameData.splice(index, 1);

	//adjust nums of all frames > num
	for (let f = 0; f < this.frameData.length; f++){
		let fdata = this.frameData[f],
			fnum = parseInt(fdata.num);

		if (fnum > num) {
			fdata.num = fnum-1;
		}
	}

	//select frame in deleted's place or last
	if (num == this.frameData.length+1){
		this.setFrame(this.frameData.length);
	}else{
		this.setFrame(num);
	}
}

//set current frame number
Sprite.prototype.setFrame = function (num){

	if (num < 1 || num > this.frameData.length) {
		console.log('invalid frame number: '+num);
		return;
	}
	console.log('Frame set to '+num);

	this.frameNum = num;
	this.setFrameData();
}

//the current frame's data
Sprite.prototype.setFrameData = function (){
	//set new frame reference	
	this.frame = this.frameData.find(obj => obj.num==this.frameNum);

	//set new data reference for layers
	if (typeof this.layer == 'undefined') return;
	let layerId = this.layer.id;
	//this.layer.data = this.layerData(layerId);
}

Sprite.prototype.getFrameData = function (frameNum){
	return this.frameData.find(obj => obj.num==frameNum);
}

//move frame to new position
Sprite.prototype.moveFrame = function (newpos){
	console.log('move frame to '+newpos);
	if (newpos < 1 || newpos > this.frameData.length){
		console.log('Cant move past available frames');
		return;
	}

	let oldpos = this.frame.num;
	if (newpos > oldpos) {
		for (let i =0; i < this.frameData.length; i++) {
			let frame = this.frameData[i];
			if (frame.num > oldpos && frame.num <= newpos)
				frame.num--;
		}
	}

	if (newpos < oldpos) {
		for (let i =0; i < this.frameData.length; i++) {
			let frame = this.frameData[i];
			if (frame.num < oldpos && frame.num >= newpos)
				frame.num++;
		}
	}
	//select new position
	this.frame.num = newpos;
	this.setFrame(newpos);
}

/*---Mixdowns ---*/


//combined layer stamp on current frame = mixdown OR pass (false, fnum) for single frame mixdown update
Sprite.prototype.makeLayerMixdown = function (allFrames, frameNum){
	
	if (allFrames){
		for (let f = 0; f < this.frameData.length; f++){
			makeMixdown(this.frameData[f], this);
		}
	}else{
		let fData = frameNum ? this.getFrameData(frameNum) : this.frame;
		makeMixdown(fData, this);
	}


	function makeMixdown(frameData, _this){
		let mixdown = frameData.mixdown,
			mixdownCtx = frameData.mixdown.getContext('2d'),
			layerStack = _this.layerStack,
			layerData = frameData.layerData,
			stampCtx = _this.stamp.getContext('2d'),
			stackNum = 1;

		mixdownCtx.clearRect(0, 0, _this.width, _this.height);
		stampCtx.clearRect(0, 0, _this.width, _this.height);

		for (let l = 0; l < layerStack.length; l++){
			let img = layerData[l].img, //assuming both arrays have same index-value pairs
				layer = layerStack[l];

			if (layer.stackPos == stackNum){

				stampCtx.putImageData(img, 0, 0);
				if (layer.visible || _this.showHiddenLayers) mixdownCtx.drawImage(_this.stamp, 0, 0);
				if (stackNum < layerStack.length){
					stackNum++;
					l = -1;
				}else{
					break;
				}
			}
		}
	}
}

/*---LAYERS ---*/


//Layers - accesses the current frame set by this.setFrame
//A layer on the current frame
Sprite.prototype.layerData = function (layerId, frameNum){
	let layerData;

	if (frameNum) {
		let frame = this.getFrameData(frameNum);
		layerData = frame.layerData.find(obj => obj.id==layerId);
	}else{
		layerData = this.frame.layerData.find(obj => obj.id==layerId);
	}
	return layerData;
}


Sprite.prototype.layerProps = function (layerId){
	let layerProps = this.layerStack.find(obj => obj.id==layerId);
	return layerProps;
}

//reference to this current layer
Sprite.prototype.setLayer = function (layerId){
	//let layerData = this.frame.layerData.find(obj => obj.id==layerId).img;

	this.layer = this.layerStack.find(obj => obj.id==layerId);
	this.layerId = layerId;
	//this.layer.img = layerData;
}


//add layer on all frames
Sprite.prototype.addLayer = function (layerId, obj){

	for (let f = 0; f < this.frameData.length; f++){
		let layerData = this.frameData[f].layerData,
			idLayerData = layerData.find(obj => obj.id==layerId),
			imgData;

		if (typeof idLayerData == 'undefined'){
			//blank layer
			imgData = new ImageData(this.width, this.height);
		} 			
		else {
			//clone
			imgData = idLayerData.img;
		}

		layerData.push({ 
			id : obj.id, 
			img : imgData
		});
	}	

	this.layerStack.push(obj);
	let newLayer = this.layerStack[this.layerStack.length-1];
	console.log(obj);
	console.log('layer added:'+newLayer.name);

	//Move stack order of upper layers +1, ignore newest layer
	let newpos = obj.stackPos;	
	for (let i = 0; i < this.layerStack.length-1; i++){
		let layer = this.layerStack[i];
		if (layer.stackPos >= newpos) layer.stackPos++;
	};
}

//remove layer on all frames
Sprite.prototype.deleteLayer = function (layerId){
	let selectLayerId = '';

	//Delete Layer data accross all frames
	for (let f = 0; f < this.frameData.length; f++){
		let layerData = this.frameData[f].layerData,
		thisLayer = layerData.find(obj => obj.id==layerId),
		index = layerData.indexOf(thisLayer);

		if (index <= -1) return;
		layerData.splice(index, 1);	
	}	
	
	//Delete Layer Properties for this layer
	let layerProps = this.layerStack,
		thisLayer = this.layerProps(layerId),
		index = layerProps.indexOf(thisLayer);
		pos = thisLayer.stackPos;

	if (index <= -1) return;
	layerProps.splice(index, 1);

	//adjust stack orders
	if (pos != layerProps.length+1){
		for (let i =0; i < layerProps.length; i++) {
			let layer = layerProps[i];
			//top layers move 1 down
			if (layer.stackPos > pos) {
				layer.stackPos--;
			}
			if (layer.stackPos == pos) selectLayerId = layer.id					
		}
	}
	else{
		for (let i =0; i < layerProps.length; i++) {
			let layer = layerProps[i];
			//select layer below deleted layer
			if (layer.stackPos == layerProps.length) {
				selectLayerId = layer.id	
			}
		}		
	}

	return selectLayerId;
}

Sprite.prototype.moveLayer = function (newpos){
	
	let layerStack = this.layerStack,
		oldpos = this.layer.stackPos;

	if (newpos > oldpos) {
		for (let i =0; i < layerStack.length; i++) {
			let layer = layerStack[i];
			if (layer.stackPos > oldpos && layer.stackPos <= newpos)
				layer.stackPos--;
		}
	}

	if (newpos < oldpos) {
		for (let i =0; i < layerStack.length; i++) {
			let layer = layerStack[i];
			if (layer.stackPos < oldpos && layer.stackPos >= newpos)
				layer.stackPos++;
		}
	}

	//assign new position
	this.layer.stackPos = newpos;
	//update all mixdowns since moving a layer happens accross all frames
	this.makeLayerMixdown(true);
}
/****Resize Sprite****/
//every layer on every frame

Sprite.prototype.resize = function (width, height, offsetX, offsetY, scale){
	let frameData = sprite.frameData,
		ctx = this.stamp.getContext('2d');

	//set sprite size
	this.setSize(width, height);

	//resize contents
	for (let f = 0; f < frameData.length; f++){
		//resize mixdowns
		frameData[f].mixdown.width = width;
		frameData[f].mixdown.height = height;

		let layerData = frameData[f].layerData;
		for (let l = 0; l < layerData.length; l++){
			//position and place on resized canvas
			console.log('offsets: '+offsetX+', '+offsetY);
			ctx.putImageData(layerData[l].img, offsetX, offsetY);
			let imgData = ctx.getImageData(0, 0, this.width, this.height);
			//read back into layerdata
			layerData[l].img = ctx.getImageData(0, 0, this.width, this.height);
		}
	}

	this.setFrame(this.frameNum);
}

/****Saving frameData to text****/

//returns string version of frameData
Sprite.prototype.getSpriteData = function (useJSON){

	var spriteData = '';

	if (useJSON){
		spriteData = 	'{"frameData":'+ JSON.stringify(this.frameData) + 
						',"layerStack":'+ JSON.stringify(this.layerStack) + 
						',"width":'+ this.width.toString() + 
						',"height":'+ this.height.toString() +
						'}';
	}else{

		/*New experimental encoding*/
		let layerStackStr = '[',
			layerStack = this.layerStack;

		for (let l = 0; l < layerStack.length; l++){
			layerStackStr += '{';
			for (k in layerStack[l]){
				layerStackStr += ('$'+k+':'+layerStack[l][k]);
			}
			layerStackStr += '}';
		}
		layerStackStr += ']';

		//frameData
		let fData = this.frameData,
			fDataStr = '['

		for (let f = 0; f < fData.length; f++){
			let lData = fData[f].layerData;

			fDataStr += '{$num:'+fData[f].num+'$layerData:['; 
			for (let l = 0; l < lData.length; l++){
				let bit = lData[l].img.data;

				fDataStr += '{$id:'+lData[l].id;
				fDataStr += '$img:['+encodeBit(bit)+']}';
			}
			fDataStr += ']}';
		}
		fDataStr += ']';

		spriteData = 	'$width:'+ this.width.toString() +
						 '$height:'+ this.height.toString() + 
						 '$layerStack:' + layerStackStr + 
						 '$frameData:' + fDataStr;
	}

	function encodeBit(bit){
		
		let bitColor = [],
			prevColor = [],
			repeat = 0,
			bitStr = '';

		for (let i = 0; i < bit.length; i++){
			let b = bit[i],
				sep = i < bit.length-1 ? ',' : '';

			//get color array
			bitColor.push(b)
			if (bitColor.length >= 4){
				if (compareArray(bitColor, prevColor)){
					repeat++;
				}else{
					if (repeat > 0){
						bitStr += repeat.toString()+'!,';
						repeat = 0;
					}
					bitStr += bitColor.join()+sep;
				}
				prevColor = bitColor.slice();
				bitColor = [];
			}
		}

		if (repeat > 0){
			bitStr += repeat.toString()+'!';
		}
		return bitStr;
	}

	return spriteData;
}

/****Load frameData from file****/
Sprite.prototype.setSpriteData = function (frameDataArray){

	for (let f = 0; f < frameDataArray.length; f++){
		let frameData = frameDataArray[f],
			layerData = frameData.layerData;

		//populate frames
		this.frameData.push({
			num : frameData.num,
			layerData : [],
			mixdown : document.createElement('canvas')
		});
		let i = this.frameData.length-1;
		//configure mixdown size
		this.frameData[i].mixdown.width = this.width;
		this.frameData[i].mixdown.height = this.height;

		//populate layers
		for (let l = 0; l < layerData.length; l++){
		
			let fileId = layerData[l].id,
				fileImg = layerData[l].img,
				imgData = new ImageData(this.width, this.height);

			//let newData = [];
			// for (k in fileImg.data){
			// 	newData.push(fileImg.data[k]);
			// }
			// imgData.data.set(newData);
			
			imgData.data.set(fileImg);

			this.frameData[i].layerData.push({
				id : fileId,
				img : imgData
			});
		}
	}
	this.setFrame(1);	
}


/****Export Animation****/

//To Gif

Sprite.prototype.compileGif = function (width, height, fStart, fEnd, fps, repeat, filename, quality, bgcolor){
	var encoder = new GIFEncoder(),
		bg = bgcolor || null;

	//scale up if needed
	let newCanvas = document.createElement('canvas');
	newCanvas.width = width;
	newCanvas.height = height;

	let newCtx = newCanvas.getContext('2d');

	//Set encoder
	encoder.setQuality(quality || 1);
	encoder.setRepeat(repeat || 0);
	encoder.setDelay(Math.round(1000/fps));
	encoder.setTransparent('#666');

	//start encoding
	encoder.start();
	for (let fnum = fStart; fnum <= fEnd; fnum++){
		let frameData = this.getFrameData(fnum),
			mixdown = frameData.mixdown;

		//project frame on new canvas
		newCtx.imageSmoothingEnabled = false;
		newCtx.clearRect(0, 0, width, height);
		newCtx.drawImage(mixdown, 0, 0, mixdown.width, mixdown.height, 0, 0, width, height);

		encoder.addFrame(newCtx);
	}

	encoder.finish();
	if (filename.length > 0) encoder.download(filename+".gif");
	else return encoder.stream().getData(); //or return binary
}


//To Sprite Sheet