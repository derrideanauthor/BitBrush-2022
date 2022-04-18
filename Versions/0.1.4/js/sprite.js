var Sprite=function(){this.active=!1;this.frameNum=0;this.frameData=[];this.frame;this.layerStack=[];this.layerId;this.width;this.height;this.stamp=document.createElement('canvas');this.showHiddenLayers=!0}
Sprite.prototype.init=function(w,h){this.setSize(w,h);this.addFrame(this.frameNum);this.active=!0}
Sprite.prototype.erase=function(){this.frameNum=0;this.frameData=[];this.layerStack=[];this.width=0;this.height=0}
Sprite.prototype.setSize=function(w,h){this.width=w;this.height=h;this.stamp.width=w;this.stamp.height=h}
Sprite.prototype.addFrame=function(num,clone){let i=parseInt(num)+1,makeClone=clone||!1;for(let f=0;f<this.frameData.length;f++){if(this.frameData[f].num>=i){this.frameData[f].num++}}
this.frameData.push({num:i,layerData:[],mixdown:document.createElement('canvas')});let n=this.frameData.length-1,mix=this.frameData[n].mixdown;mix.width=this.width;mix.height=this.height;this.setFrame(i);if(n>0){let prevLayers=this.frameData.find(obj=>obj.num==num).layerData;for(let l=0;l<prevLayers.length;l++){this.frame.layerData.push({});let prevLayer=prevLayers[l],len=this.frame.layerData.length,newLayer=this.frame.layerData[len-1];newLayer.id=prevLayer.id;if(makeClone){newLayer.img=prevLayer.img}else{newLayer.img=new ImageData(this.width,this.height)}}
this.makeLayerMixdown()}}
Sprite.prototype.removeFrame=function(num){let frame=this.frameData.find(obj=>obj.num==num),index=this.frameData.indexOf(frame);if(index<0)return;if(this.frameData.length==1){console.log('cant delete last frame');return}
this.frameData.splice(index,1);for(let f=0;f<this.frameData.length;f++){let fr=this.frameData[f];if(fr.num>num)fr.num--}
if(num==this.frameData.length+1){this.setFrame(this.frameData.length)}else{this.setFrame(num)}}
Sprite.prototype.setFrame=function(num){if(num<1||num>this.frameData.length){console.log('invalid frame number: '+num);return}
console.log('Frame set to '+num);this.frameNum=num;this.setFrameData()}
Sprite.prototype.setFrameData=function(){this.frame=this.frameData.find(obj=>obj.num==this.frameNum);if(typeof this.layer=='undefined')return;let layerId=this.layer.id}
Sprite.prototype.getFrameData=function(frameNum){return this.frameData.find(obj=>obj.num==frameNum)}
Sprite.prototype.moveFrame=function(newpos){console.log('move frame to '+newpos);if(newpos<1||newpos>this.frameData.length){console.log('Cant move past available frames');return}
let oldpos=this.frame.num;if(newpos>oldpos){for(let i=0;i<this.frameData.length;i++){let frame=this.frameData[i];if(frame.num>oldpos&&frame.num<=newpos)
frame.num--}}
if(newpos<oldpos){for(let i=0;i<this.frameData.length;i++){let frame=this.frameData[i];if(frame.num<oldpos&&frame.num>=newpos)
frame.num++}}
this.frame.num=newpos;this.setFrame(newpos)}
Sprite.prototype.makeLayerMixdown=function(allFrames,frameNum){if(allFrames){for(let f=0;f<this.frameData.length;f++){makeMixdown(this.frameData[f],this)}}else{let fData=frameNum?this.getFrameData(frameNum):this.frame;makeMixdown(fData,this)}
function makeMixdown(frameData,_this){let mixdown=frameData.mixdown,mixdownCtx=frameData.mixdown.getContext('2d'),layerStack=_this.layerStack,layerData=frameData.layerData,stampCtx=_this.stamp.getContext('2d'),stackNum=1;mixdownCtx.clearRect(0,0,_this.width,_this.height);stampCtx.clearRect(0,0,_this.width,_this.height);for(let l=0;l<layerStack.length;l++){let img=layerData[l].img,layer=layerStack[l];if(layer.stackPos==stackNum){stampCtx.putImageData(img,0,0);if(layer.visible||_this.showHiddenLayers)mixdownCtx.drawImage(_this.stamp,0,0);if(stackNum<layerStack.length){stackNum++;l=-1}else{break}}}}}
Sprite.prototype.layerData=function(layerId,frameNum){let layerData;if(frameNum){let frame=this.getFrameData(frameNum);layerData=frame.layerData.find(obj=>obj.id==layerId)}else{layerData=this.frame.layerData.find(obj=>obj.id==layerId)}
return layerData}
Sprite.prototype.layerProps=function(layerId){let layerProps=this.layerStack.find(obj=>obj.id==layerId);return layerProps}
Sprite.prototype.setLayer=function(layerId){this.layer=this.layerStack.find(obj=>obj.id==layerId);this.layerId=layerId}
Sprite.prototype.addLayer=function(layerId,obj){for(let f=0;f<this.frameData.length;f++){let layerData=this.frameData[f].layerData,idLayerData=layerData.find(obj=>obj.id==layerId),imgData;if(typeof idLayerData=='undefined'){imgData=new ImageData(this.width,this.height)}
else{imgData=idLayerData.img}
layerData.push({id:obj.id,img:imgData})}
this.layerStack.push(obj);let newLayer=this.layerStack[this.layerStack.length-1];console.log(obj);console.log('layer added:'+newLayer.name);let newpos=obj.stackPos;for(let i=0;i<this.layerStack.length-1;i++){let layer=this.layerStack[i];if(layer.stackPos>=newpos)layer.stackPos++}}
Sprite.prototype.deleteLayer=function(layerId){let selectLayerId='';for(let f=0;f<this.frameData.length;f++){let layerData=this.frameData[f].layerData,thisLayer=layerData.find(obj=>obj.id==layerId),index=layerData.indexOf(thisLayer);if(index<=-1)return;layerData.splice(index,1)}
let layerProps=this.layerStack,thisLayer=this.layerProps(layerId),index=layerProps.indexOf(thisLayer);pos=thisLayer.stackPos;if(index<=-1)return;layerProps.splice(index,1);if(pos!=layerProps.length+1){for(let i=0;i<layerProps.length;i++){let layer=layerProps[i];if(layer.stackPos>pos){layer.stackPos--}
if(layer.stackPos==pos)selectLayerId=layer.id}}
else{for(let i=0;i<layerProps.length;i++){let layer=layerProps[i];if(layer.stackPos==layerProps.length){selectLayerId=layer.id}}}
return selectLayerId}
Sprite.prototype.moveLayer=function(newpos){let layerStack=this.layerStack,oldpos=this.layer.stackPos;if(newpos>oldpos){for(let i=0;i<layerStack.length;i++){let layer=layerStack[i];if(layer.stackPos>oldpos&&layer.stackPos<=newpos)
layer.stackPos--}}
if(newpos<oldpos){for(let i=0;i<layerStack.length;i++){let layer=layerStack[i];if(layer.stackPos<oldpos&&layer.stackPos>=newpos)
layer.stackPos++}}
this.layer.stackPos=newpos;this.makeLayerMixdown(!0)}
Sprite.prototype.resize=function(width,height,offsetX,offsetY,scale){let frameData=sprite.frameData,ctx=this.stamp.getContext('2d');this.setSize(width,height);for(let f=0;f<frameData.length;f++){frameData[f].mixdown.width=width;frameData[f].mixdown.height=height;let layerData=frameData[f].layerData;for(let l=0;l<layerData.length;l++){console.log('offsets: '+offsetX+', '+offsetY);ctx.putImageData(layerData[l].img,offsetX,offsetY);let imgData=ctx.getImageData(0,0,this.width,this.height);layerData[l].img=ctx.getImageData(0,0,this.width,this.height)}}
this.setFrame(this.frameNum)}
Sprite.prototype.getSpriteData=function(useJSON){var spriteData='';if(useJSON){spriteData='{"frameData":'+JSON.stringify(this.frameData)+',"layerStack":'+JSON.stringify(this.layerStack)+',"width":'+this.width.toString()+',"height":'+this.height.toString()+'}'}else{let layerStackStr='[',layerStack=this.layerStack;for(let l=0;l<layerStack.length;l++){layerStackStr+='{';for(k in layerStack[l]){layerStackStr+=('$'+k+':'+layerStack[l][k])}
layerStackStr+='}'}
layerStackStr+=']';let fData=this.frameData,fDataStr='['
for(let f=0;f<fData.length;f++){let lData=fData[f].layerData;fDataStr+='{$num:'+fData[f].num+'$layerData:[';for(let l=0;l<lData.length;l++){let bit=lData[l].img.data;fDataStr+='{$id:'+lData[l].id;fDataStr+='$img:['+encodeBit(bit)+']}'}
fDataStr+=']}'}
fDataStr+=']';spriteData='$width:'+this.width.toString()+'$height:'+this.height.toString()+'$layerStack:'+layerStackStr+'$frameData:'+fDataStr}
function encodeBit(bit){let bitColor=[],prevColor=[],repeat=0,bitStr='';for(let i=0;i<bit.length;i++){let b=bit[i],sep=i<bit.length-1?',':'';bitColor.push(b)
if(bitColor.length>=4){if(compareArray(bitColor,prevColor)){repeat++}else{if(repeat>0){bitStr+=repeat.toString()+'!,';repeat=0}
bitStr+=bitColor.join()+sep}
prevColor=bitColor.slice();bitColor=[]}}
if(repeat>0){bitStr+=repeat.toString()+'!'}
return bitStr}
return spriteData}
Sprite.prototype.setSpriteData=function(frameDataArray){for(let f=0;f<frameDataArray.length;f++){let frameData=frameDataArray[f],layerData=frameData.layerData;this.frameData.push({num:frameData.num,layerData:[],mixdown:document.createElement('canvas')});let i=this.frameData.length-1;this.frameData[i].mixdown.width=this.width;this.frameData[i].mixdown.height=this.height;for(let l=0;l<layerData.length;l++){let fileId=layerData[l].id,fileImg=layerData[l].img,imgData=new ImageData(this.width,this.height);imgData.data.set(fileImg);this.frameData[i].layerData.push({id:fileId,img:imgData})}}
this.setFrame(1)}
Sprite.prototype.exportGif=function(filename,repeat,fps,bgcolor){var encoder=new GIFEncoder(),bg=bgcolor||null;encoder.setRepeat(repeat);encoder.setDelay(Math.round(1000/fps));encoder.setTransparent(bg);encoder.start();for(let fnum=1;fnum<=this.frameData.length;fnum++){let frameData=this.getFrameData(fnum),frame=frameData.mixdown,ctx=frame.getContext('2d');encoder.addFrame(ctx)}
encoder.finish();encoder.download(filename+".gif")}