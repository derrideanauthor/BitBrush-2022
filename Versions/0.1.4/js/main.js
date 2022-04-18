var props={appTitle:'Bit Brush - An online pixel art and sprite animation suite -  Beta v0.1',version:document.title,projectName:'Untitled Project',artWidth:32,artHeight:32,artColor:"#ccc",artScale:1,zoomFactor:.2,layerId:'',maxScale:200,minScale:2,artX:0,artY:0,artSX:0,artSY:0,pivotX:0,pivotY:0,autoPivotX:!0,autoPivotY:!0,mode:"draw",onionSkin:!1,onionSkinRange:[0,0],lockUI:!1};var project={saved:!1}
var sprite=new Sprite();var layerElement,layerContext,layerCount=1,artUIElement,artUIContext,hudElement,hudContext,artBgElement,artBgContext,bufferElement,buffer;var selection={active:!1};var clipboard={x:0,y:0,w:0,h:0,clip:document.createElement('canvas'),cache:document.createElement('canvas'),user:!1,show:!1};var animation;var cursor={mode:"primary",pixelX:0,pixelY:0,pixelSX:0,pixelSY:0,pixelPrevX:0,pixelPrevY:0,x:0,y:0,sx:0,sy:0,drawing:!1,pointerType:''};var keys={press:!1,keyCode:0,shift:!1,alt:!1,ctrl:!1};var toolProps={type:"brush",prevType:"",mode:"normal",pColor:new Color(),sColor:new Color(),size:1,active:!0};var hud={showGrid:!0,grid:1,gridBig:0,showGuides:!0,guideX:[],guideY:[]};var uiColor={'primary':'rgb(32,62,243)','secondary':'rgb(212,85,0)','selection':'rgb(218,50,86)','move':'rgb(27, 219, 163)'};var undolist={state:[],maxEntry:20,currentEntry:-1};if(window.PointerEvent){console.log('Ponter Events Supported.')}
var pointerEvent={'down':window.PointerEvent?'pointerdown':'mousedown','up':window.PointerEvent?'pointerup':'mouseup','move':window.PointerEvent?'pointermove':'mousemove','over':window.PointerEvent?'pointerover':'mouseover','out':window.PointerEvent?'pointerout':'mouseout','click':window.PointerEvent?'pointerdown':'click'}
var mPanel=new MainPanel(),cPanel=new ColorPanel(),fPanel=new FramesPanel(),lPanel=new LayersPanel(),tPanel=new ToolsPanel(),hPanel=new HistoryPanel(),fMaster=new FileMaster(),fileWindow=new appMenuPanel(),exportMenu=new ExportMenuPanel(),appHints=new tooltips(),appFeedback=new Component('popMsg');window.onload=function(){document.title=props.appTitle;fMaster.init(readFile);appFeedback.appendTo('#pasteboard');mPanel.init(appFeedback);tPanel.init();cPanel.init(toolProps.pColor,toolProps.sColor,appFeedback);fPanel.init();lPanel.init();hPanel.init();hPanel.clickItem=function(index){getHistory(0,index)}
appHints.init();appLaunch()}
window.onbeforeunload=function(){let msg='Sure you wanna do that?';if(!project.saved)return msg}
function appLaunch(){initPixelBuffer();createUILayer();initToolbars();artboardUIInit();updateHUD();zoomArtboard('fit')}
function reloadVersion(){if(getCookie('bitbrushversion')!=props.version){document.cookie='bitbrushversion='+props.version;location.reload(!0);console.log('Bitbrush updated to version '+props.version)}}
function newCanvasSprite(w,h){props.artScale=round(450/props.artWidth);if(sprite.frameData.length>0)eraseCanvasSprite();sprite.init(w,h);fPanel.addThumb(sprite.frameNum,function(fnum){sprite.setFrame(fnum);updateArtboard()});fPanel.playPreview(sprite);createLayer(1);zoomArtboard('fit')}
function readFile(txt){var fileData;console.log('Attempting to load file.');fileData=parseFileData(txt);var newW=fileData.width,newH=fileData.height;let splashMenus=document.getElementsByClassName('splash-menu');for(let i=0;i<splashMenus.length;i++){splashMenus[i].removeAttribute('data-active')}
newCanvasSprite(newW,newH);eraseCanvasSprite();sprite.setSize(newW,newH);let frameData=fileData.frameData;sprite.setSpriteData(frameData);props.artWidth=newW;props.artHeight=newH;bufferElement.width=props.artWidth;bufferElement.height=props.artHeight;let layerStack=fileData.layerStack
for(let i=0;i<layerStack.length;i++){sprite.layerStack.push(layerStack[i]);createLayerCanvas(layerStack[i].id,layerStack[i].stackPos);createLayerThumb(layerStack[i].id)}
selectLayer(layerStack[layerStack.length-1].id);layerCount=fileData.layerStack.length+1;let frameNum=1;for(let f=0;f<frameData.length;f++){frameNum=frameData[f].num;fPanel.addThumb(frameNum,function(fnum){sprite.setFrame(fnum);updateArtboard()})}
sprite.setFrame(frameNum);updateArtboard(!0);fPanel.player.play=!0;updateCanvasComponents(fileData)
appFeedback.newMsg('File successfully imported.',2000)}
function updateCanvasComponents(fileData){props.projectName=fileData.projectName;document.title='['+props.projectName+'] - '+props.appTitle;fileWindow.setName(props.projectName);cPanel.setSwatchData(fileData.presetSwatches)}
function eraseCanvasSprite(){console.log('Erasing old sprite');let layerStack=sprite.layerStack;for(let i=0;i<layerStack.length;i++){let layerId=layerStack[i].id;let layer=document.getElementById(layerId);layer.parentNode.removeChild(layer)}
lPanel.deleteAllLayerCards();fPanel.stopPreview();fPanel.removeAllThumbs();sprite.erase();layerCount=1}
function createLayer(stackNum,clone,hId,hName,hVis,hAlpha){let layerName=hName||"Layer "+layerCount,layerId=hId||"layer"+layerCount,visible=(typeof hVis!='undefined')?hVis:!0,opacity=hAlpha||1;createLayerCanvas(layerId,stackNum);let dataId=layerId;if(clone){dataId=sprite.layer.id;layerName=sprite.layer.name+' (copy)'}
sprite.addLayer(dataId,{name:layerName,id:layerId,visible:visible,opacity:opacity,stackPos:stackNum});createLayerThumb(layerId);updateDOMScale();layerCount++;selectLayer(layerId)}
function createLayerCanvas(layerId,stackNum){let parent=document.getElementById("pasteboard"),newLayer=document.createElement("canvas");newLayer.id=layerId;newLayer.className="layer";newLayer.width=props.artWidth;newLayer.height=props.artHeight;newLayer.style.zIndex=stackNum;let newLayerCtx=newLayer.getContext("2d");newLayerCtx.imageSmoothingEnabled=!1;newLayerCtx.clearRect(0,0,newLayer.width,newLayer.height);parent.appendChild(newLayer)}
function createLayerThumb(layerId){let layerStack=sprite.layerProps(layerId),title=layerStack.name,visible=layerStack.visible,card=lPanel.addLayerCard(layerId,title,visible);card.addAction(['click',function(){if(props.layerId!=layerId){selectLayer(layerId);console.log(title+' selected.')}}]);card.mapButtons({'layers-visible':toggleVisible});function toggleVisible(){toggleLayerVisibility(layerId)}}
function addNewLayer(clone){let newpos=sprite.layer.stackPos+1;createLayer(newpos,clone);updateDOMStack()}
function selectLayer(layerId,history){destroySelection();layerElement=document.getElementById(layerId);layerContext=layerElement.getContext("2d");props.layerId=layerId;sprite.setLayer(layerId);lPanel.setActiveCard(layerId);if(lPanel.settings.isolateLayer){toggleLayerVisibility(props.layerId,!0,!0)}
if(typeof history=='undefined')
setHistory('select layer')}
function deleteLayer(layerId){let layer=document.getElementById(layerId);layer.parentNode.removeChild(layer);lPanel.deleteLayerCard(layerId);let nextLayerId=sprite.deleteLayer(layerId);selectLayer(nextLayerId);updateArtboard(!0)}
function clearLayer(){setBuffer(props.layerId);buffer.clearRect(0,0,props.artWidth,props.artHeight);putBuffer(layerContext,props.layerId);updateArtboard(!0)}
function moveLayerToPos(newpos){sprite.moveLayer(newpos);updateDOMStack()}
function toggleLayerVisibility(layerId,toggleAll,isolate,visibleAll){let thisLayer=sprite.layerProps(layerId)||sprite.layer;thisLayer.visible=visibleAll||isolate||!thisLayer.visible;if(isolate){lPanel.setCardVisibility(layerId,visibleAll||isolate)}
if(toggleAll){let allLayers=sprite.layerStack;for(let i=0;i<allLayers.length;i++){if(allLayers[i].id==layerId)continue;allLayers[i].visible=visibleAll||!thisLayer.visible;lPanel.setCardVisibility(allLayers[i].id,allLayers[i].visible)}}
if(!sprite.showHiddenLayers){sprite.makeLayerMixdown(!0);fPanel.updateAllThumbs(sprite.frameData)}
updateDOMStack()}
function updateDOMStack(){let layerStack=sprite.layerStack,stackLen=layerStack.length;artUIElement.style.zIndex=layerStack.length+3;hudElement.style.zIndex=layerStack.length+2;for(let i=0;i<stackLen;i++){let layerProp=layerStack[i];let layerDOM=document.getElementById(layerProp.id);layerDOM.style.zIndex=layerProp.stackPos;layerDOM.style.visibility=layerProp.visible?'visible':'hidden';let thumb=lPanel.getLayerCard(layerProp.id);thumb.style.order=(stackLen-layerProp.stackPos+1).toString()}
updateMinimap();updateHUD();updateOnionSkin()}
function updateLayerThumb(layerId){setBuffer(layerId);let thumb=lPanel.getLayerCard(layerId).firstChild;putThumb(thumb)}
function updateMinimap(){let map=fPanel.minimap;let view=document.getElementById("pasteboard"),mw=map.width,mh=map.height,w=artUIElement.width,h=artUIElement.height,vx=-(props.artX/w)*mw,vy=-(props.artY/h)*mh,vw=view.offsetWidth/w*mw,vh=(view.offsetHeight)/h*mh;fPanel.updateViewfinder(vx,vy,vw,vh);fPanel.updateMinimap(sprite.frame)}
function createUILayer(){let parent=document.getElementById("pasteboard"),layerData=sprite.layerStack;artUIElement=document.createElement("canvas");artUIContext=artUIElement.getContext("2d");artUIElement.id="ui-layer";artUIElement.className="layer";artUIElement.width=props.artWidth;artUIElement.height=props.artHeight;artUIElement.style.zIndex=layerData.length+3;parent.appendChild(artUIElement);hudElement=document.createElement("canvas");hudContext=hudElement.getContext("2d");hudElement.id="hud-layer";hudElement.className="layer";hudElement.width=props.artWidth;hudElement.height=props.artHeight;hudElement.style.zIndex=layerData.length+2;parent.appendChild(hudElement);artBgElement=document.createElement("canvas");artBgContext=artBgElement.getContext("2d");artBgContext.imageSmoothingEnabled=!1;artBgElement.id="ref-layer";artBgElement.className="layer";artBgElement.width=props.artWidth;artBgElement.height=props.artHeight;artBgElement.style.zIndex="0";updateBgLayer("pattern");parent.appendChild(artBgElement)}
function updateBgLayer(source){let pixelSize=1*props.artScale,blockSize=pixelSize;if(isEven(props.artWidth))blockSize=4;else blockSize=5;let scale=3;artBgElement.style.background="url(assets/images/light.png)";artBgElement.style.backgroundSize=(blockSize*scale)+"px"}
function updateHUD(){let gridColor="#666",guideColor="cyan",ctx=hudContext,w=hudElement.width,h=hudElement.height,block=1*props.artScale;ctx.clearRect(0,0,w,h);ctx.imageSmoothingEnabled=!1;ctx.translate(.5,.5);if(hud.showGrid&&block>6){ctx.strokeStyle=gridColor;ctx.lineWidth=1;ctx.globalAlpha=.2;for(let i=1;i<props.artWidth;i++){let step=Math.round(i*props.artScale);ctx.beginPath();ctx.moveTo(step,0);ctx.lineTo(step,h);ctx.stroke();ctx.moveTo(0,step);ctx.lineTo(w,step);ctx.stroke()}}
if(hud.showGuides){ctx.globalAlpha=1;ctx.strokeStyle=guideColor;ctx.lineWidth=1;for(let i=0;i<hud.guideX.length;i++){let gx=Math.round(hud.guideX[i]*props.artScale);ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,h);ctx.stroke()}
for(let i=0;i<hud.guideY.length;i++){let gy=Math.round(hud.guideY[i]*props.artScale);ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(w,gy);ctx.stroke()}}
ctx.translate(-.5,-.5);ctx.globalAlpha=1}
function drawPixelGrid(ctx,w,h){let block=1*props.artScale,lineW=1;if(block>10){for(let i=1;i<props.artWidth;i++){let step=Math.round(i*props.artScale);ctx.clearRect(0,step,w,lineW);ctx.clearRect(step,0,lineW,h)}}}
function clearUI(){artUIContext.clearRect(0,0,artUIElement.width,artUIElement.height)}
function zoomArtboard(factor){let oldScale=props.artScale;if(factor=='fit'){let parent=document.getElementById("pasteboard"),pHeight=parent.offsetHeight;props.artScale=pHeight/props.artHeight;centerArtboard()}
else{let amount=props.artScale*factor;if(props.artScale>=props.minScale&&amount<0){props.artScale+=amount;if(props.artScale<props.minScale)
props.artScale=props.minScale}
if(props.artScale<props.maxScale&&amount>0){props.artScale+=amount;if(props.artScale>props.maxScale)
props.artScale=props.maxScale}
let xOff=((oldScale-props.artScale)*props.artWidth)/2,yOff=((oldScale-props.artScale)*props.artHeight)/2;props.artX+=xOff;props.artY+=yOff;constrainArtboardPos()}
updateDOMScale();updateHUD();if(sprite.active){updateMinimap();updateOnionSkin()}
appFeedback.updateMsg('zoom','Scale 1:'+(Math.round(props.artScale*10)/10));if(props.mode=="edit")drawClip()}
function updateDOMScale(){let artW=Math.ceil(props.artWidth*props.artScale),artH=Math.ceil(props.artHeight*props.artScale);let layers=document.getElementsByClassName('layer');for(let i=0;i<layers.length;i++){let layer=layers[i],ctx=layer.getContext('2d');if(layer.tagName.toUpperCase()!='CANVAS')continue;layer.style.top=props.artY+"px";layer.style.left=props.artX+"px";layer.width=artW;layer.height=artH;if(sprite.active){setBuffer(layer.id);putBuffer(ctx)}}
updateBgLayer("pattern")}
function updateDOMPos(){let layer=document.getElementsByClassName('layer');for(let i=0;i<layer.length;i++){if(layer[i].tagName.toUpperCase()!='CANVAS')break;layer[i].style.top=props.artY+"px";layer[i].style.left=props.artX+"px"}
updateMinimap()}
function centerArtboard(){let parent=document.getElementById("pasteboard"),pWidth=parent.offsetWidth,pHeight=parent.offsetHeight,cWidth=props.artWidth*props.artScale,cHeight=props.artHeight*props.artScale;if(cWidth<pWidth){props.autoPivotX=!0}
if(cHeight<pHeight){props.autoPivotY=!0}
if(props.autoPivotX)props.pivotX=cWidth/2;if(props.autoPivotY)props.pivotY=cHeight/2;props.artX=round(pWidth/2-props.pivotX);props.artY=round(pHeight/2-props.pivotY)}
function constrainArtboardPos(){let parent=document.getElementById("pasteboard"),xMax=(parent.offsetWidth/2),yMax=(parent.offsetHeight/2),xMin=xMax-(props.artWidth*props.artScale),yMin=yMax-(props.artHeight*props.artScale);if(props.artX<=xMin)props.artX=xMin;if(props.artX>=xMax)props.artX=xMax;if(props.artY<=yMin)props.artY=yMin;if(props.artY>=yMax)props.artY=yMax}
function initToolbars(){initMenus();initToolSelect();initLayerTools();initFrameTools();initStartupMenu()}
function initStartupMenu(){let startupMenu=new appMenuPanel();startupMenu.newFile.action=newFileProject;startupMenu.version=props.version;startupMenu.init('startup',props.lockUI);startupMenu.importMenu.mapButtons({'file-open':openFile});function openFile(){mPanel.file.click()}
startupMenu.splash.showWindow();props.lockUI=!0}
function newFileProject(){this.splash.hideWindow();let w=this.newFile.width,h=this.newFile.height;appFeedback.muteMsg(1);props.artWidth=w;props.artHeight=h;newCanvasSprite(w,h);lPanel.artboard.update(w,h);bufferElement.width=w;bufferElement.height=h;props.projectName=this.newFile.name;document.title='['+this.newFile.name+'] - '+props.appTitle;updateArtboard(!0);appFeedback.updateMsg('document','New Sprite Created ('+props.artWidth+'&times;'+props.artHeight+')')}
function initToolSelect(){selectTool('brush',"normal");tPanel.toolbar.drawing.mapButtons({'brush-tool':function(){selectTool('brush','normal')},'eraser-tool':function(){selectTool('brush','erase')},'line-tool':function(){selectTool('shape','line')},'rectangle-tool':function(){selectTool('shape','rect')},'ellipse-tool':function(){selectTool('shape','ellipse')},'fill-tool':function(){selectTool('fill','normal')}});cPanel.menu.button['eyedropper-tool'].callback=function(){selectTool('eyedropper')}
tPanel.drawer.brush.mapButtons({'size-1':function(){toolProps.size=1},'size-2':function(){toolProps.size=2},'size-3':function(){toolProps.size=3},'size-4':function(){toolProps.size=4}});tPanel.drawer.eraser.mapButtons({'size-1':function(){toolProps.size=1},'size-2':function(){toolProps.size=2},'size-3':function(){toolProps.size=3},'size-4':function(){toolProps.size=4}});tPanel.toolbar.editing.mapButtons({'marquee-tool':function(){selectTool('select')},'layer-clear':function(){clearLayer()},'undo':function(){getHistory(-1)},'redo':function(){getHistory(1)}});tPanel.drawer.marquee.mapButtons({'deselect':function(){destroySelection();appFeedback.updateMsg('selection','Selection destroyed.')},'copy':function(){copySelection(!0);appFeedback.updateMsg('selection','Pixels copied to clipboard.')},'paste':function(){pastePreview(!0);appFeedback.updateMsg('selection','Pixels pasted on '+sprite.layerProps(props.layerId).name)},'clear':function(){clearSelection();appFeedback.updateMsg('selection','Selected pixels has been cleared.')},'cut':function(){cutSelection(!0);appFeedback.updateMsg('selection','Pixels cut to clipboard.')},'reselect':function(){remakeSelection();appFeedback.updateMsg('selection','Selection remade.')}});tPanel.toolbar.nav.mapButtons({'art-pan':function(){selectTool('pan')}});tPanel.drawer.zoom.mapButtons({'art-zoom-in':function(){zoomArtboard(props.zoomFactor)},'art-zoom-out':function(){zoomArtboard(-props.zoomFactor)},'art-fit':function(){zoomArtboard('fit')},'art-center':function(){centerArtboard();updateDOMScale();updateHUD()}})}
function initMenus(){fileWindow.newFile.action=newFileProject;fileWindow.project.setName=function(val){props.projectName=val;document.title='['+val+'] - '+props.appTitle};fileWindow.init('full',props.lockUI);fileWindow.setName(props.projectName);fileWindow.panelMenu.mapButtons({'file-save':saveFile});fileWindow.importMenu.mapButtons({'file-open':openFile});function openFile(){mPanel.file.click()}
function saveFile(){let fileName=props.projectName.replace(/[^a-z0-9]/gi,'_').toLowerCase(),fileDataStr='$projectName:'+props.projectName+cPanel.getSwatchData()+sprite.getSpriteData();var blob=new Blob([fileDataStr],{type:"text/plain;charset=utf-8"});saveAs(blob,fileName+".bitbr");appFeedback.updateMsg('document','Project saved!');project.saved=!0}
exportMenu.init(props.lockUI);exportMenu.quickExport.mapButtons({'export-gif':exportGIF,'export-png':exportPNG})}
function exportGIF(){let fileName=props.projectName.replace(/[^a-z0-9]/gi,'_').toLowerCase(),fps=fPanel.player.fps;sprite.exportGif(fileName,0,fps)}
function exportPNG(){let source=sprite.frame.mixdown,fileName=props.projectName.replace(/[^a-z0-9]/gi,'_').toLowerCase();source.toBlob(function(blob){saveAs(blob,fileName+".png")})}
function initLayerTools(){lPanel.panelMenu.mapButtons({'file-menu':openFileMenu});function openFileMenu(){fileWindow.splash.showWindow();props.lockUI=!0}
lPanel.layerTools.mapButtons({'layers-add':addLayer,'layers-delete':delLayer,'layers-up':upLayer,'layers-down':downLayer,'layers-duplicate':cloneLayer});function addLayer(){addNewLayer()}
function delLayer(){if(sprite.layerStack.length>1){setHistory('delete layer');deleteLayer(props.layerId)}
else alert("At least one layer must remain.")}
function upLayer(){let layerData=sprite.layer;if(layerData.stackPos<sprite.layerStack.length){moveLayerToPos(parseInt(layerData.stackPos)+1);fPanel.updateAllThumbs(sprite.frameData)}}
function downLayer(){let layerData=sprite.layer;if(layerData.stackPos>1){moveLayerToPos(parseInt(layerData.stackPos)-1);fPanel.updateAllThumbs(sprite.frameData)}}
function cloneLayer(){addNewLayer(!0);updateArtboard()}
lPanel.titleBar.mapButtons({'layers-all':toggleLayerMode.bind(this)});function toggleLayerMode(){if(!lPanel.settings.isolateLayer){toggleLayerVisibility(props.layerId,!0,!0);lPanel.settings.isolateLayer=!0}else{toggleLayerVisibility(props.layerId,!0,!0,!0);lPanel.settings.isolateLayer=!1}}
lPanel.artboardTools.mapButtons({'art-resize':resizeCanvas.bind(this),'art-guides-clear':clearGuides.bind(this)});function resizeCanvas(){let w=lPanel.artboard.width,h=lPanel.artboard.height,anchor=lPanel.artboard.anchor;resizeSprite(w,h,anchor);props.artWidth=w;props.artHeight=h;bufferElement.width=props.artWidth;bufferElement.height=props.artHeight;updateArtboard(!0)}
function clearGuides(){hud.guideX=[];hud.guideY=[];updateHUD()}
lPanel.artboard.ui.hud.mapButtons({'art-toggle-grid':function(){hud.showGrid=!hud.showGrid;updateHUD()},'art-toggle-guide':function(){hud.showGuides=!hud.showGuides;updateHUD()}})}
function initFrameTools(){fPanel.frameTools.mapButtons({'frames-add':addFrame,'frames-delete':deleteFrame,'frames-left':moveFrameLeft,'frames-right':moveFrameRight,'frames-duplicate':cloneFrame,'frames-export':exportSprite});function addFrame(){sprite.addFrame(sprite.frameNum);fPanel.addThumb(sprite.frameNum,function(fnum){sprite.setFrame(fnum);updateArtboard();setHistory('add frame')});updateArtboard();setHistory('add frame')}
function cloneFrame(){sprite.addFrame(sprite.frameNum,!0);fPanel.addThumb(sprite.frameNum,function(fnum){sprite.setFrame(fnum);updateArtboard();setHistory('clone frame')});updateArtboard();fPanel.updateThumb(sprite.frame);setHistory('clone frame')}
function deleteFrame(){setHistory('delete frame');fPanel.removeThumb(sprite.frameNum);sprite.removeFrame(sprite.frameNum);updateArtboard()}
function moveFrameLeft(){setHistory('move frame');sprite.moveFrame(parseInt(sprite.frameNum)-1);fPanel.updateAllThumbs(sprite.frameData);updateOnionSkin();setHistory('move frame')}
function moveFrameRight(){setHistory('move frame');sprite.moveFrame(parseInt(sprite.frameNum)+1);fPanel.updateAllThumbs(sprite.frameData);updateOnionSkin();setHistory('move frame')}
function exportSprite(){exportMenu.splash.showWindow();props.lockUI=!0}
fPanel.panelMenu.mapButtons({'frames-onionskin':toggleOnionSkin});function toggleOnionSkin(){props.onionSkin=!props.onionSkin;if(props.onionSkin){if(props.onionSkinRange[0]==0&&props.onionSkinRange[1]==0){props.onionSkinRange[0]=-1;props.onionSkinRange[1]=0;fPanel.onionSkinGizmo.update(-1)}}
updateArtboard()}
fPanel.onionSkinGizmo.setFormat('number',-10,10);fPanel.onionSkinUpdate=onionSkinUpdate;function onionSkinUpdate(val){let left=val<0?val:0,right=val>0?val:0;if(!props.onionSkin){fPanel.panelMenu.button['frames-onionskin'].DOM.setAttribute('data-active','');props.onionSkin=!0}
props.onionSkinRange[0]=left;props.onionSkinRange[1]=right;updateOnionSkin()}
fPanel.panelMenu.button['frames-timeline'].callback=function(){let preview=document.getElementById('frames-preview');toggleClass(preview,'pop-out');updateDOMScale()}}
function resizeSprite(newW,newH,anchor){let oldW=props.artWidth,oldH=props.artHeight,offsetW=newW-oldW,offsetH=newH-oldH,offsetX=Math.round((offsetW*.5)*anchor[0]),offsetY=Math.round((offsetH*.5)*anchor[1]);sprite.resize(newW,newH,offsetX,offsetY,!1)}
function updateArtboard(deep){let layerStack=sprite.layerStack;for(let i=0;i<layerStack.length;i++){updateLayerThumb(layerStack[i].id)}
clearBuffer();updateOnionSkin();if(deep){sprite.makeLayerMixdown(!0);fPanel.updateAllThumbs(sprite.frameData)}
updateDOMScale();updateDOMStack()}
function updateOnionSkin(layerId){if(!props.onionSkin)return;let w=artBgElement.width,h=artBgElement.height,sw=sprite.width,sh=sprite.height;artBgContext.clearRect(0,0,w,h);artBgContext.imageSmoothingEnabled=!1;let fnum=parseInt(sprite.frameNum),max=sprite.frameData.length,minOpacity=.05,maxOpacity=.5,left=Math.abs(props.onionSkinRange[0]),right=Math.abs(props.onionSkinRange[1]);if(left>=fnum)left=fnum-1;if(right>max-fnum)right=max-fnum;let amount=left+right,ofac=.05,opacity=maxOpacity-(left*ofac);if(opacity<0)opacity=0;for(let f=fnum-left;f<=fnum+right;f++){if(f==fnum||f<1||f>max)continue;artBgContext.globalAlpha=opacity;sprite.showHiddenLayers=!1;sprite.makeLayerMixdown(!1,f);let img=sprite.getFrameData(f).mixdown;artBgContext.drawImage(img,0,0,sw,sh,0,0,w,h);sprite.showHiddenLayers=!0;sprite.makeLayerMixdown(!1,f);if(f<fnum){if(opacity<maxOpacity)opacity+=ofac;else opacity=maxOpacity}else{if(opacity>minOpacity)opacity-=ofac;else opacity=minOpacity}}
artBgContext.globalAlpha=1}
function artboardUIInit(){let pasteboard=document.getElementById("pasteboard"),pinchZoomDist=0;document.addEventListener('contextmenu',function(e){e.preventDefault()},!1);artUIElement.addEventListener(pointerEvent.move,onPointerMove,!1);function onPointerMove(e){if(pinchZoomDist==0){getCursorPos(e,!1);draw(e)}}
artUIElement.addEventListener(pointerEvent.out,function(e){e.preventDefault();artUIContext.clearRect(0,0,this.width,this.height)},!1);artUIElement.addEventListener(pointerEvent.down,onPointerDown,!1);function onPointerDown(e){e.preventDefault();if(e.button===2)cursor.mode="secondary";else cursor.mode="primary";cursor.drawing=!0}
document.addEventListener(pointerEvent.up,function(e){cursor.drawing=!1},!1);artUIElement.addEventListener(pointerEvent.up,onPointerUp,!1);function onPointerUp(e){if(pinchZoomDist==0){singleClickAction(e);e.preventDefault();draw(e);cursor.mode="primary"}}
artUIElement.addEventListener('touchmove',function(e){if(e.touches.length>1){pinchZoomDist=0;return}
getCursorPos(e,!0);draw(e)},!1);artUIElement.addEventListener('touchend',function(e){if(e.touches.length>1){pinchZoomDist=0;return}
cursor.drawing=!1;onPointerUp(e)},!1);artUIElement.addEventListener('touchstart',function(e){if(e.touches.length>1){pinchZoomDist=0;return}
getCursorPos(e,!0);onPointerDown(e)},!1);pasteboard.addEventListener('touchmove',function(e){e.preventDefault();if(e.touches.length>1){pinchZoomDist=findDistance(e.targetTouches[0].clientX,e.targetTouches[0].clientY,e.targetTouches[1].clientX,e.targetTouches[1].clientY,!0);console.log('dist '+pinchZoomDist)}else{pinchZoomDist=0}},!1);pasteboard.addEventListener('wheel',function(e){if(e.deltaY>0)zoomArtboard(-.1)
else zoomArtboard(0.1)},!1);window.addEventListener("keydown",function(e){keys={press:!0,keyCode:e.keyCode||e.which,space:(e.which==32||e.keyCode==32),shift:e.shiftKey,alt:e.altKey,del:(e.keyCode==46||e.which==46||e.key=='Delete'),ctrl:(e.ctrlKey||e.metaKey||e.keyCode==17||e.which==17)}
keyboardActions(e)},!1);window.addEventListener("keyup",function(e){keys.press=!1;keyboardActions(e)},!1)}
function singleClickAction(e){let mx=cursor.pixelX,my=cursor.pixelY,sx=cursor.pixelSX,sy=cursor.pixelSY;if(toolProps.active)destroySelection();if(toolProps.type=='brush'||toolProps.type=='fill'||toolProps.type=='eyedropper'){if(sx==mx&&sy==my){draw(e);setHistory('draw')}}
cursor.drawing=!1}
function keyboardActions(e){if(keys.press){if(!props.lockUI)e.preventDefault();if(keys.alt&&toolProps.type=='brush'){toolProps.prevType=toolProps.type;selectTool('eyedropper')}
if(keys.space&&toolProps.type!=='pan'){toolProps.prevType=toolProps.type;selectTool('pan')}
if(keys.shift&&keys.ctrl&&keys.keyCode==72){hPanel.toggleHide()}
if(keys.ctrl&&keys.shift&&keys.keyCode==90){e.preventDefault();getHistory(1);return}
if(keys.ctrl&&keys.keyCode==90){getHistory(-1);return}
if(keys.ctrl&&keys.keyCode==67){copySelection(!0);appFeedback.updateMsg('selection','Pixels cut to clipboard.')}
if(keys.ctrl&&keys.keyCode==88){cutSelection(!0);appFeedback.updateMsg('selection','Pixels cut to clipboard.')}
if(keys.ctrl&&keys.keyCode==86){pastePreview(!0);appFeedback.updateMsg('selection','Pixels pasted on '+sprite.layerProps(props.layerId).name)}
if(keys.keyCode==27){destroySelection();appFeedback.updateMsg('selection','Selection destroyed.')}
if(keys.del){clearSelection();appFeedback.updateMsg('selection','Selected pixels has been cleared.')}
if(keys.ctrl&&keys.shift&&keys.keyCode==82){e.preventDefault();remakeSelection();appFeedback.updateMsg('selection','Selection remade.')}}
else{if((keys.alt||keys.space)&&toolProps.prevType!=""){console.log("switch to prev tool "+toolProps.prevType);selectTool(toolProps.prevType);toolProps.prevType=""}
keys.alt=!1;keys.shift=!1;keys.ctrl=!1}}
function selectTool(type,mode){toolProps.type=type;toolProps.mode=mode||"normal";clearUI();setCursor(type,mode);console.log("Tool Selected : "+toolProps.type+", Mode : "+toolProps.mode)}
function setCursor(type,mode){let variant=mode||'normal';let offset=20,style=type+'-'+variant,cursorStyle={"brush-normal":"url(assets/icons/brush.png) 0 "+offset+", none","brush-erase":"url(assets/icons/eraser.png) 0 "+offset+", none","shape-line":"crosshair","shape-rect":"crosshair","shape-ellipse":"crosshair","fill-normal":'crosshair',"eyedropper-normal":"url(assets/icons/eyedropper.png) 0 "+offset+", none","select-normal":'crosshair',"select-move":"move","pan-normal":"all-scroll","general-normal":"crosshair"};if(cursorStyle[style])
artUIElement.style.cursor=cursorStyle[style];else artUIElement.style.cursor="auto"}
function getCursorPos(e,usePen){let canvas=e.currentTarget,rect=canvas.getBoundingClientRect();var penx=0;var peny=0;if(usePen){penx=e.targetTouches[0].clientX||0;peny=e.targetTouches[0].clientY||0}
cursor.x=usePen?penx:e.clientX;cursor.y=usePen?peny:e.clientY;cursor.pixelPrevX=cursor.pixelX;cursor.pixelPrevY=cursor.pixelY;cursor.pixelX=Math.floor((cursor.x-rect.left)/props.artScale);cursor.pixelY=Math.floor((cursor.y-rect.top)/props.artScale);if(!cursor.drawing){cursor.sx=cursor.x;cursor.sy=cursor.y;cursor.pixelSX=cursor.pixelX;cursor.pixelSY=cursor.pixelY}}
function initPixelBuffer(){bufferElement=document.createElement('canvas');bufferElement.width=props.artWidth;bufferElement.height=props.artHeight;bufferElement.id="buffer";buffer=bufferElement.getContext('2d');buffer.imageSmoothingEnabled=!1}
function setBuffer(layerId){let bw=bufferElement.width,bh=bufferElement.height,layerData,layerProps;if(typeof layerId=='string'){layerData=sprite.layerData(layerId);layerProps=sprite.layerProps(layerId)}
else{layerData=sprite.frame.layerData[layerId];layerProps=sprite.layerStack[layerId]}
if(typeof layerData=='undefined')return!1;clearBuffer();buffer.imageSmoothingEnabled=!1;buffer.putImageData(layerData.img,0,0)}
function putBuffer(ctx,layerId){let ele=ctx.canvas,w=ele.width,h=ele.height,bw=bufferElement.width,bh=bufferElement.height,layerData,layerProps;if(layerId||layerId!=undefined){layerProps=sprite.layerProps(layerId);if(!layerProps.visible){clearBuffer();return}
putThumb();layerData=sprite.layerData(layerId);layerData.img=buffer.getImageData(0,0,bw,bh);sprite.makeLayerMixdown();fPanel.updateThumb(sprite.frame);updateMinimap()}
ctx.imageSmoothingEnabled=!1;ctx.clearRect(0,0,w,h);ctx.drawImage(bufferElement,0,0,bw,bh,0,0,w,h);clearBuffer()}
function putThumb(layerThumb){let w=bufferElement.width,h=bufferElement.height,thumb=layerThumb||lPanel.thumb,tw=thumb.width,th=thumb.height;let ctx=thumb.getContext('2d');ctx.imageSmoothingEnabled=!1;ctx.clearRect(0,0,tw,th);ctx.drawImage(bufferElement,0,0,w,h,0,0,tw,th)}
function clearBuffer(){let bw=bufferElement.width,bh=bufferElement.height;buffer.clearRect(0,0,bw,bh);buffer.globalAlpha=1}
function showBrushSize(){let size=toolProps.size,mx=cursor.pixelX,my=cursor.pixelY,sx=cursor.pixelSX,sy=cursor.pixelSY,previewColor;if(cursor.mode!="secondary")previewColor=uiColor.secondary;else previewColor=uiColor.primary;if(toolProps.type=='select'){previewColor=uiColor.selection}
if(toolProps.type=="brush"||((mx==sx&&my==sy)&&!cursor.drawing)){if(toolProps.type!="brush")size=1;buffer.clearRect(0,0,bufferElement.width,bufferElement.height);buffer.globalAlpha=.6;buffer.fillStyle=previewColor;buffer.fillRect(mx-size+1,my,size,size);putBuffer(artUIContext)}
if(toolProps.type=="shape"&&toolProps.mode=="line"){size=1;buffer.clearRect(0,0,bufferElement.width,bufferElement.height);buffer.globalAlpha=.6;drawLine(buffer,sx-size+1,sy,mx-size+1,my,size,previewColor);putBuffer(artUIContext)}
if(cursor.drawing&&toolProps.type=="shape"){size=1;if(keys.shift){let w=sx-mx,h=sy-my;if(Math.abs(w)>Math.abs(h))my=sy-w;else mx=sx-h}
buffer.globalAlpha=.6;if(toolProps.mode=="rect"){buffer.clearRect(0,0,bufferElement.width,bufferElement.height);drawRect(buffer,sx,sy,mx,my,size,previewColor,!1,keys.alt);putBuffer(artUIContext)}
if(toolProps.mode=="ellipse"){buffer.clearRect(0,0,bufferElement.width,bufferElement.height);drawEllipse(buffer,sx,sy,mx,my,size,previewColor,keys.alt);putBuffer(artUIContext)}}
if(cursor.drawing&&toolProps.type=='select'&&toolProps.active){if(keys.shift){let w=sx-mx,h=sy-my;if(Math.abs(w)>Math.abs(h))my=sy-w;else mx=sx-h}
buffer.clearRect(0,0,bufferElement.width,bufferElement.height);buffer.globalAlpha=.4;drawRect(buffer,sx,sy,mx,my,1,previewColor,!1);putBuffer(artUIContext)}
if(toolProps.type=="fill"){let rgba=[212,85,0,.6];buffer.clearRect(0,0,bufferElement.width,bufferElement.height);setBuffer(props.layerId);colorFill(bufferElement,mx,my,rgba,!0);putBuffer(artUIContext)}}
function draw(e){var toolFunction={"brush":brushTool,"pan":panTool,"eyedropper":eyedropperTool,"shape":shapeTool,"fill":fillTool,"select":marqueeTool,};toolFunction[toolProps.type]();if(e.pointerType!=cursor.pointerType){if(e.pointerType=='mouse')setCursor(toolProps.type,toolProps.mode);if(e.pointerType=='touch'||e.pointerType=='pen')setCursor('pointer');cursor.pointerType=e.pointerType}}
function brushTool(){let size=toolProps.size,color=toolProps.pColor.getRGBA(),mx=cursor.pixelX-size+1,my=cursor.pixelY,px=cursor.pixelPrevX-size+1,py=cursor.pixelPrevY,sx=cursor.pixelSX-size+1,sy=cursor.pixelSY;showBrushSize();if(cursor.drawing){let swatch=1;if(toolProps.mode=='erase'){color='none'}
else{if(cursor.mode=="secondary"){color=toolProps.sColor.getRGBA();swatch=2}
cPanel.setRecentColor(swatch)}
setBuffer(props.layerId);drawLine(buffer,px,py,mx,my,size,color);putBuffer(layerContext,props.layerId)}
else if(mx!=sx||my!=sy){setHistory('draw')}}
function shapeTool(){let size=1,mx=cursor.pixelX-size+1,my=cursor.pixelY,sx=cursor.pixelSX-size+1,sy=cursor.pixelSY,color=toolProps.pColor.getRGBA(),mode=toolProps.mode
showBrushSize();if(!cursor.drawing){let w=sx-mx,h=sy-my;if(keys.shift){let w=sx-mx,h=sy-my;if(Math.abs(w)>Math.abs(h))my=sy-w;else mx=sx-h}
if(mx!=sx||my!=sy){clearUI();let swatch=1;if(cursor.mode=="secondary"){color=toolProps.sColor.getRGBA();swatch=2}
cPanel.setRecentColor(swatch);if(mode=="line"){setBuffer(props.layerId);drawLine(buffer,sx,sy,mx,my,size,color);putBuffer(layerContext,props.layerId)}
else if(mode=="rect"){setBuffer(props.layerId);drawRect(buffer,sx,sy,mx,my,size,color,!1,keys.alt);putBuffer(layerContext,props.layerId)}
else if(mode=="ellipse"){setBuffer(props.layerId);drawEllipse(buffer,sx,sy,mx,my,size,color,keys.alt);putBuffer(layerContext,props.layerId)}
setHistory('draw')}}}
function fillTool(){let mx=cursor.pixelX,my=cursor.pixelY,color=toolProps.pColor;if(cursor.drawing){let swatch=1;if(cursor.mode=="secondary"){color=toolProps.sColor,swatch=2}
cPanel.setRecentColor(swatch);rgba=[color.r,color.g,color.b,color.a];setBuffer(props.layerId);colorFill(bufferElement,mx,my,rgba);putBuffer(layerContext,props.layerId);cursor.drawing=!1}else{showBrushSize()}}
function panTool(){if(cursor.drawing){let dx=cursor.sx-cursor.x,dy=cursor.sy-cursor.y,sx=props.artSX,sy=props.artSY;props.artX=sx-dx;props.artY=sy-dy;constrainArtboardPos();updateDOMPos()}
else{props.artSX=props.artX;props.artSY=props.artY}}
function eyedropperTool(){let mx=cursor.pixelX-toolProps.size+1,my=cursor.pixelY,ele=document.createElement('canvas');if(cursor.drawing){let imgData;if(toolProps.mode=="all-layers"){let mixdown=sprite.getMixdown().getContext('2d');imgData=mixdown.getImageData(mx,my,1,1).data}else{setBuffer(props.layerId);imgData=buffer.getImageData(mx,my,1,1).data}
if(cursor.mode=="secondary"){toolProps.sColor.setRGBA(imgData[0],imgData[1],imgData[2],round(imgData[3]/255));cPanel.update()}
else{toolProps.pColor.setRGBA(imgData[0],imgData[1],imgData[2],round(imgData[3]/255));cPanel.update()}
cursor.drawing=!1}}
function marqueeTool(){let size=1,mx=cursor.pixelX-size+1,my=cursor.pixelY,sx=cursor.pixelSX-size+1,sy=cursor.pixelSY,mode=toolProps.mode;showBrushSize();if(!cursor.drawing){if(insideSelection(mx,my)){if(toolProps.mode!="move"){toolProps.mode="move";setCursor('select','move')}
clearUI();toolProps.active=!1}
else{if(toolProps.mode!="normal"){toolProps.mode="normal";setCursor('select')}
toolProps.active=!0}
if(mx!=sx||my!=sy){if(!(insideSelection(sx,sy))){let w=sx-mx,h=sy-my;if(keys.shift){if(w>h)h=w;else w=h;mx=sx-w;my=sy-h}
clearUI();destroySelection();makeSelection(sx,sy,mx,my,'artboard')}
if(insideSelection(mx,my)){let sel=selection;sel.initx=sel.x;sel.inity=sel.y;sel.moving=!1;sel.dx=0;sel.dy=0;sel.empty=!1}}}else{if(insideSelection(sx,sy)){let sel=selection;if(props.mode=='edit'||sel.empty){let dx=sx-mx,dy=sy-my;if(cursor.mode=="secondary"&&!sel.empty){destroySelection();remakeSelection()}
else if(!(dx==sel.dx&&dy==sel.dy)){sel.moving=!0;sel.x=sel.initx-dx;sel.y=sel.inity-dy;sel.dx=dx;sel.dy=dy;drawClip();updateHUD();showAnts()}}else{if(cursor.mode!="secondary"){clearUI();if(cutSelection()){pastePreview();cursor.pixelSX=cursor.pixelX;cursor.pixelSY=cursor.pixelY}}else sel.empty=!0}
toolProps.active=!1}}}
function insideSelection(x,y){if(typeof selection.active!=undefined&&selection.active){let s=selection;if((x>=s.x&&x<=s.x+s.w&&y>=s.y&&y<=s.y+s.h)||s.moving){return!0}else return!1}
else return!1}
function makeSelection(sx,sy,mx,my,from){selection={layerId:props.layerId,x:sx<mx?sx:mx,y:sy<my?sy:my,initx:0,inity:0,dx:0,dy:0,moving:!1,w:Math.abs(sx-mx),h:Math.abs(sy-my),active:!0,antsOffset:0,content:from,empty:!1};selection.initx=selection.x;selection.inity=selection.y;if(selection.active){console.log("selection created.");updateHUD();animation=setInterval(showAnts,100)}}
function remakeSelection(){let s=selection;if(typeof s.active!=undefined&&!s.active&&s.w!=0){s.active=!0;s.initx=s.x;s.inity=s.y;s.content="artboard";updateHUD();animation=setInterval(showAnts,100)}}
function showAnts(){let ctx=hudContext,sel=selection,x=Math.round(sel.x*props.artScale),y=Math.round(sel.y*props.artScale),w=Math.round((sel.w+1)*props.artScale),h=Math.round((sel.h+1)*props.artScale),lineW=2,dashW=5,color=uiColor.selection;if(sel.content=="clipboard")color=uiColor.move;ctx.globalAlpha=1;ctx.lineWidth=lineW;ctx.lineDashOffset=sel.antsOffset;if(props.mode=="edit"&&cursor.drawing){ctx.setLineDash([])}
else{ctx.strokeStyle="white";ctx.strokeRect(x,y,w,h);ctx.setLineDash([dashW,dashW])}
ctx.strokeStyle=color;ctx.strokeRect(x,y,w,h);ctx.setLineDash([]);ctx.lineDashOffset=0;if(sel.antsOffset>=10)sel.antsOffset=1;else sel.antsOffset++}
function destroySelection(){if(typeof selection.active!="undefined"&&selection.active){if(props.mode=="edit")commitEdit();selection.active=!1;clearInterval(animation);animation=null;updateHUD()}}
function clearSelection(){let s=selection;if(s.active&&props.mode!="edit"){setBuffer(props.layerId);buffer.clearRect(s.x,s.y,s.w+1,s.h+1);putBuffer(layerContext,props.layerId)}else{setBuffer(props.layerId);putBuffer(layerContext,props.layerId);props.mode="draw";s.content="artboard";console.log('selection : Nothing cleared.')}}
function cutSelection(user){let s=selection;if(s.active){if(copySelection(user)){clearSelection();return!0}
else return!1}}
function copySelection(user){let s=selection,c=clipboard;if(s.active){setBuffer(props.layerId);let imgData=buffer.getImageData(s.x,s.y,s.w+1,s.h+1),ele;if(user){ele=c.cache;c.x=s.x;c.y=s.y;c.w=s.w;c.h=s.h}
else ele=c.clip;let ctx=ele.getContext('2d');ctx.clearRect(0,0,ele.width,ele.height);if(props.mode!="edit"){if(isEmpty(imgData)){s.empty=!0;return!1}else{s.empty=!1}
ctx.putImageData(imgData,0,0)}
else{console.log("user copy: to cache");ctx.drawImage(c.clip,0,0)}}else{console.log('selection : Nothing to copy!')}
return!0}
function isEmpty(imgData){for(var i=0;i<imgData.data.length;i+=4){if(imgData.data[i+3]!==0)return!1}
return!0}
function pasteSelection(newx,newy){let x=newx,y=newy,data;if(clipboard.user)data=clipboard.cache;else data=clipboard.clip;setBuffer(props.layerId);buffer.drawImage(data,x,y);putBuffer(layerContext,props.layerId)}
function pastePreview(user){let c=clipboard;if(user){destroySelection();selectTool("select");makeSelection(c.x,c.y,c.x+c.w,c.y+c.h,"clipboard")}else selection.content="clipboard";c.user=user||!1;drawClip();props.mode="edit"}
function drawClip(){let c=clipboard,s=selection,data;if(c.user)data=c.cache;else data=c.clip;if(!s.empty){setBuffer(props.layerId);buffer.drawImage(data,s.x,s.y);putBuffer(layerContext)}}
function commitEdit(){pasteSelection(selection.x,selection.y);props.mode="draw"}
function trimData(imgData){let top=0,btm=0,left=0,right=0,w=imgData.width,h=imgData.height;for(var i=0;i<imgData.data.length;i+=4){top=Math.floor(((i+1)/4)/w);if(imgData.data[i+3]!==0)break}
for(var i=0;i<imgData.data.length;i+=4){let j=imgData.data.length-1-i;btm=Math.floor(((i+1)/4)/w);if(imgData.data[j]!==0)break}
for(var j=0;j<w;j++){let i=0,flag=!1;for(var v=top;v<h-btm;v++){i=(v*w+j)*4;if(imgData.data[i+3]!==0){flag=!0;break}}
if(flag){left=j;break}}
for(var j=0;j<w;j++){let i=0,flag=!1;for(var v=top;v<h-btm;v++){i=(w*(v+1)-j)*4-1;if(imgData.data[i]!==0){flag=!0;break}}
if(flag){right=j;break}}
return[top,right,btm,left]}
function getHistory(inc,index){var i=index>=0?index:undolist.currentEntry+parseInt(inc);if(i<0){console.log('Sry. You cant undo past this point.');return}
if(i>=undolist.state.length){console.log('Sry. You cant redo past this point.');return}
hPanel.setActiveItem(i);let hist=undolist.state[i],action={'select layer':layerAction,'delete layer':layerAction,'draw':layerAction,'add frame':frameAction,'clone frame':frameAction,'delete frame':frameAction,'move frame':frameAction};function layerAction(){if(!sprite.layerStack.find(obj=>obj.id==hist.layerId)){restoreLayers();return}
sprite.setFrame(hist.frameNum);fPanel.selectThumb(hist.frameNum);updateArtboard();selectLayer(hist.layerId,!0);clearBuffer();buffer.imageSmoothingEnabled=!1;buffer.putImageData(hist.imgData,0,0);putBuffer(layerContext,hist.layerId)}
function restoreLayers(){createLayer(hist.order,!1,hist.layerId,hist.name,hist.visible);let layerProps=sprite.layerProps(hist.layerId);layerProps.name=hist.name;for(let f=0;f<sprite.frameData.length;f++){let fnum=sprite.frameData[f].num,spriteImg=sprite.layerData(hist.layerId,fnum).img,imgData=hist.imgData[fnum];spriteImg.data.set(imgData)}
updateArtboard()}
function renameLayer(otherLayerId){let lId=otherLayerId||hist.layerId}
function addLayer(){if(inc<0){deleteLayer(hist.layerId)}else{}}
function frameAction(){}
console.log('Undo: '+hist.action);action[hist.action]();undolist.currentEntry=i}
function setHistory(actionType){let layerId=props.layerId,frameNum=sprite.frameNum;let action={'draw':captureLayer,'select layer':captureLayer,'delete layer':captureLayerOnAllFrames,'add frame':frameAction,'delete frame':frameAction,'clone frame':frameAction,'move frame':frameAction,};let layerInfo=sprite.layerProps(layerId),capture={action:actionType,layerId:layerId,frameNum:frameNum,name:layerInfo.name,order:layerInfo.stackPos,visible:layerInfo.visible},bw=bufferElement.width,bh=bufferElement.height;function captureLayerOnAllFrames(){capture.imgData={};for(let f=0;f<sprite.frameData.length;f++){let fnum=sprite.frameData[f].num,spriteImg=sprite.layerData(layerId,fnum).img.data;capture.imgData[fnum]=spriteImg;console.log('capturing imgdata frame:'+fnum+'data:'+capture.imgData[fnum])}
return capture}
function captureLayer(){capture.imgData=new ImageData(sprite.width,sprite.height);setBuffer(layerId);capture.imgData=buffer.getImageData(0,0,bw,bh);return capture}
function frameAction(){return capture}
function frameBackup(){return capture}
let n=(undolist.state.length-1)-undolist.currentEntry;if(n>0){console.log('starting new timeline');for(let j=0;j<n;j++){hPanel.removeItem(undolist.state.length-1);undolist.state.pop()}}
if(undolist.state.length>=undolist.maxEntry){hPanel.removeItem(0);undolist.state.shift()}
undolist.state.push(action[actionType]());project.saved=!1;hPanel.addItem(actionType=='draw'?(toolProps.mode+' '+toolProps.type+' tool'):actionType);let i=undolist.state.length-1;undolist.currentEntry=i;console.log('H'+undolist.currentEntry+'"'+actionType+'" at f:'+undolist.state[i].frameNum+', l:'+undolist.state[i].layerId)}
function isEven(value){if(value%2==0)
return!0;else return!1}
function forEach(selector,fn){let elements=document.querySelectorAll(selector);for(let i=0;i<elements.length;i++){fn(elements[i])}}
function round(amount){return Math.round(amount*100)/100}
function cap(v,min,max){return(Math.min(max,Math.max(min,v)))}
function inArray(arr,value){for(var i=0;i<arr.length;i++){if(arr[i]==value)return!0}
return!1}
function delArray(arr,value){let newArray=[];for(var i=0;i<arr.length;i++){if(arr[i]!==value)newArray.push(arr[i])}
return newArray}
function getHex(r,g,b){var value="#"+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);return value.toUpperCase()}
function toggleClass(element,className){let oldClass=element.className.trim(),newClass=oldClass.replace(className,'').trim();if(newClass==oldClass){newClass=newClass+' '+className}
if(newClass.length>1)element.className=newClass.trim();else element.removeAttribute('class')}
function findDistance(fromX,fromY,toX,toY,roundUp){var dx=fromX-toX,dy=fromY-toY,result=Math.sqrt(dx*dx+dy*dy)
if(roundUp)result=Math.round(result*100)/100;return result}
function animateNode(node,nodeTo,offsetX,offsetY,opposite){let to=nodeTo,from=document.createElement('div'),rectTo=nodeTo.getBoundingClientRect(),rectFrom=node.getBoundingClientRect(),speed=.2;from.style.position='absolute';from.style.top=rectFrom.top+'px';from.style.left=rectFrom.left+'px';from.style.backgroundColor=node.style.backgroundColor;from.className=node.className+' swatchAnim';let container=document.getElementById('app-container');container.appendChild(from);var fromX=rectFrom.left,fromY=rectFrom.top,toX=parseInt(rectTo.left+offsetX),toY=parseInt(rectTo.top+offsetY),opacity=1;if(opposite){toX=parseInt(rectTo.right-offsetX);toY=parseInt(rectTo.bottom-offsetY)}
var slide=setInterval(function(){var dx=toX-fromX,dy=toY-fromY,dist=Math.sqrt(dx*dx+dy*dy),angle=Math.asin(Math.abs(dy)/dist),b_dx=Math.sign(dx)*Math.cos(angle)*speed,b_dy=Math.sign(dy)*Math.sin(angle)*speed;if(dist>speed){fromX+=b_dx;fromY+=b_dy}
else{clearInterval(slide);container.removeChild(from)}
from.style.left=fromX+'px';from.style.top=fromY+'px';speed+=.02},1)}
function getCookie(cname){var name=cname+"=";var decodedCookie=decodeURIComponent(document.cookie);var ca=decodedCookie.split(';');for(var i=0;i<ca.length;i++){var c=ca[i];while(c.charAt(0)==' '){c=c.substring(1)}
if(c.indexOf(name)==0){return c.substring(name.length,c.length)}}
return""}
function compareArray(array1,array2){if(array1.length!=array2.length||array1.length==0||array2.length==0){return!1}
for(let i=0;i<array1.length;i++){if(array1[i]!==array2[i])return!1}
return!0}
function parseFileData(str){var fileData={},obj=[],keyName='',keyValue='',tempValue='',tree=0,treeBack=0,mode=0;obj.push(fileData);str+='$';for(let i=0;i<str.length;i++){let c=str.charAt(i);if(c=='$'){if(keyName!=''&&(keyValue!=''||Array.isArray(keyValue))){obj[tree][keyName]=keyValue;if(treeBack>0)shrinkTree();if(mode==4){obj.push(obj[tree][keyName]);tree=obj.length-1;if(Array.isArray(obj[tree])){obj[tree].push({});obj.push(obj[tree][obj[tree].length-1]);tree=obj.length-1}}
if(mode==5){obj.pop();let oldObj=obj[tree-1];oldObj.push({});obj.push(oldObj[oldObj.length-1]);tree=obj.length-1}}
keyName='';keyValue='';mode=1;continue}
if(c==':'){mode=2;continue}
if(c=='['){mode=3;keyValue=[];continue}
if(c=='{'){if(mode==3)mode=4;continue}
if(c=='}'){mode=5;continue}
if(c==']'){if(mode==3){if(tempValue!='')keyValue.push(parseInt(tempValue));tempValue='';continue}
if(mode==5)treeBack++;treeBack++;mode=0;continue}
if(mode==1){keyName+=c}
if(mode==2){keyValue+=c}
if(mode==3){if(c==','){if(tempValue!='')keyValue.push(parseInt(tempValue));tempValue=''}
else if(c=='!'){let col=keyValue.slice(-4);for(let r=0;r<parseInt(tempValue);r++){for(let c=0;c<col.length;c++){keyValue.push(col[c])}}
tempValue=''}
else tempValue+=c}}
function shrinkTree(){for(let t=0;t<treeBack;t++){obj.pop();tree--}
treeBack=0}
return fileData}
function pointerType(e,type){if(e.pointerType=='mouse'){}
else if(e.pointerType=='pen'){}
else if(e.pointerType=='touch'){}}