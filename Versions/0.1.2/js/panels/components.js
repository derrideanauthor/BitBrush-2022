var Component=function(type,id){this.type=type;this.DOM=document.createElement('div');this.panel;this.gizmo={};this.button={};this.title={};this.focus='none';this.focusId;if(type=='panel'){let comp=this.DOM;this.panel=this;comp.id=id;return}
if(type=='subPanel'){let comp=this.DOM;comp.id=id;comp.className='sub-panel';return}
if(type=='contentBox'){let comp=this.DOM;comp.id=id||'';comp.className='content';return}
if(type=='frame'){let comp=this.DOM;comp.className='frame';return}
if(type=='idBox'){let comp=this.DOM;comp.id=id;return}
if(type=='classBox'){let comp=this.DOM;comp.className=id;return}
if(type=='titleBar'){let comp=this.DOM;comp.className='title-bar main';return}
if(type=='titleBarThin'){let comp=this.DOM;comp.className='title-bar thin';return}
if(type=='titleBarHeading'){let comp=this.DOM;comp.className='title-bar heading';return}
if(type=='titleBarBare'){let comp=this.DOM;comp.className='title-bar bare';return}
if(type=='topMenu'){let comp=this.DOM;comp.className='top';comp.setAttribute('data-height','1');return}
if(type=='bottomMenu'){let comp=this.DOM;comp.className='bottom';return}
if(type=='sideMenu'){let comp=this.DOM;comp.className='side';comp.setAttribute('data-height','2');return}
if(type=='drawer'){let comp=this.DOM;comp.className='drawer';comp.id=id;return}
if(type=='card'){let comp=this.DOM;comp.className='card';comp.setAttribute('data-card',id);return}
if(type=='popMsg'){let comp=this.DOM;comp.className='pop-msg';this.msg=[];return}
if(type=='splashPanel'){this.panel=this;let comp=this.DOM;comp.className='splash-menu';return}}
Component.prototype.offsetPosition=function(obj){this.DOM.style.position='absolute';this.DOM.parentNode.style.position='relative';for(let k in obj){this.DOM.style[k]=obj[k]}}
Component.prototype.createWindow=function(id,notClosable){let splash=this.DOM;let box=document.createElement('div');box.setAttribute('data-menu',id);box.className='window';box.setAttribute('data-height','3');splash.appendChild(box);if(!notClosable)
splash.addEventListener(pointerEvent.click,function(e){if(e.target==splash){splash.removeAttribute('data-active')}},!1);this.DOM=box;return this}
Component.prototype.showWindow=function(){this.DOM.parentNode.setAttribute('data-active','')}
Component.prototype.hideWindow=function(){this.DOM.parentNode.removeAttribute('data-active')}
Component.prototype.newMsg=function(msg,delay,unAdd){if(this.MsgMuted())return;let fadeTime=200,time=delay||1000,msgBox=this.DOM,newMsg=document.createElement('div');newMsg.className='new-msg';newMsg.style.animationDelay=time+'ms';newMsg.style.animationDuration=fadeTime+'ms';newMsg.innerHTML=msg;if(typeof unAdd=='undefined'||!unAdd){msgBox.appendChild(newMsg)}
let timer=window.setTimeout(expire,time+fadeTime);function expire(){if(newMsg.parentNode==msgBox)
msgBox.removeChild(newMsg)}
return newMsg}
Component.prototype.updateMsg=function(id,msg,delay){if(this.MsgMuted(id))return;let prefix='pop-msg-';let msgs=document.getElementsByClassName('new-msg'),found=!1;for(let i=0;i<msgs.length;i++){if(msgs[i].id==prefix+id){let newMsg=this.newMsg(msg,delay,!0);newMsg.id=prefix+id;this.DOM.replaceChild(newMsg,msgs[i]);found=!0;break}}
if(!found){let newMsg=this.newMsg(msg,delay);newMsg.id=prefix+id}}
Component.prototype.muteMsg=function(times,id){if(typeof times=='boolean'){if(times==!0)
times=-1;else times=0}
this.mute=times;this.muteId=id||''}
Component.prototype.MsgMuted=function(id){if(id){if(id!=this.muteId&&this.muteId!=''){return!1}}
if(this.mute>0){this.mute--;return!0}
if(this.mute==-1)
return!0;if(this.mute==0){this.muteId='';return!1}}
Component.prototype.addHeading=function(headingText,imageURL,sub){let hType=sub?'h2':'h1';let head=document.createElement(hType);if(imageURL){let logo=document.createElement('img');logo.onload=function(){}
logo.src=imageURL;head.appendChild(logo)}
let text=document.createElement('span');text.innerHTML=headingText;head.appendChild(text);this.DOM.appendChild(head)}
Component.prototype.addText=function(text){let textStr=document.createElement('span');textStr.className='text';textStr.innerHTML=text;this.DOM.appendChild(textStr)}
Component.prototype.addTitle=function(titleText){this.title={DOM:document.createElement('span'),editable:makeEditable,text:titleText,update:updateText}
let titleSpan=this.title.DOM;titleSpan.className='title';updateText(titleText)
function updateText(txt){titleSpan.innerHTML=txt}
this.DOM.appendChild(titleSpan);function makeEditable(dataObj,key){this.DOM.contentEditable=!0;this.DOM.addEventListener(pointerEvent.click,function(e){let title=e.currentTarget;selectElementText(title)},!1);this.DOM.addEventListener('keypress',updateTitle.bind(this),!1);this.DOM.addEventListener('blur',updateTitle.bind(this),!1);function updateTitle(e){let title=e.currentTarget,prevText=this.text;if(e.type=='keypress'){if(!(event.which==13||event.keyCode==13))return!0;else e.preventDefault()}
let newText=title.innerHTML;if(newText!=prevText){dataObj[key]=newText;this.text=newText}
title.blur();clearSelection()}}
return this.title}
Component.prototype.updateTitle=function(txt){this.title.text=txt;this.title.DOM.innerHTML=txt}
Component.prototype.setHeight=function(height){if(height==0)this.DOM.removeAttribute('data-height');else this.DOM.setAttribute('data-height',height)}
Component.prototype.appendTo=function(parentSelector){let parent;if(typeof parentSelector=='string'){parent=document.querySelector(parentSelector)}else{parent=parentSelector.DOM;this.panel=parentSelector.panel}
parent.appendChild(this.DOM);if(parent.dataset.height&&!this.DOM.dataset.height)
this.setHeight(parent.getAttribute('data-height')||'3')}
Component.prototype.append=function(child){this.DOM.appendChild(child)}
Component.prototype.addGizmo=function(type,title,value,label,callback,parent){var callbackFn=callback||function(){};this.panel.gizmo[title]={valueDOM:{},type:type,name:title,value:value||0,snapValue:value,callback:callbackFn,range:[],symbol:'',symbolPos:'back',setFormat:setFormat,format:'number',editing:!1,pair:{set:pairWith,toggle:pairToggle,addUI:pairUI,active:!1,gizmo:{},ratio:1,type:'aspect'},drag:{setControl:setControl,controlSet:!1}}
this.gizmo[title]=this.panel.gizmo[title];var thisGizmo=this.gizmo[title];var gizmo=this.panel.gizmo[title].DOM,parentDOM=parent||this.DOM;if(type=='panelDrag'){let px=parentDOM.style.left,py=parentDOM.style.top;gizmo=document.createElement('button');gizmo.id=title;gizmo.setAttribute('data-gizmo','panel-drag');this.DOM.appendChild(gizmo);let icon=document.createElement('span');icon.className='mdi mdi-drag-vertical';gizmo.appendChild(icon);let panel=this.panel.DOM,parent=this.panel.DOM.parentNode,rect=panel.getBoundingClientRect(),parentRect=parent.parentNode.getBoundingClientRect();thisGizmo.value=[rect.left-parentRect.left,rect.top-parentRect.top];thisGizmo.dynamicUpdate=dynamicUpdate.bind(this);function dynamicUpdate(val){thisGizmo.range=[(parent.offsetWidth-panel.offsetWidth),(parent.offsetHeight-this.DOM.offsetHeight)];for(let i=0;i<val.length;i++){if(val[i]<0)val[i]=0;else if(val[i]>thisGizmo.range[i])val[i]=thisGizmo.range[i]}
thisGizmo.value=val;panel.style.left=val[0]+'px';panel.style.top=val[1]+'px';updatePair();callbackFn(val)}}
function setControl(component){}
if(type=='numberDrag'){let frame=document.createElement('label');frame.innerHTML=label;parentDOM.appendChild(frame);gizmo=document.createElement('input');gizmo.value=value;thisGizmo.format='number';formatValue(value);gizmo.size='2';gizmo.id=title;gizmo.setAttribute('data-gizmo','number-drag');frame.appendChild(gizmo);gizmo.addEventListener(pointerEvent.click,function(e){if(!thisGizmo.editing){thisGizmo.editing=!0;e.target.select()}},!1);gizmo.addEventListener('blur',function(e){console.log('blurring');commitChanges(gizmo.value);thisGizmo.editing=!1},!1);gizmo.addEventListener('keyup',function(e){commitChanges(gizmo.value,!0,e.target);if(event.which==13||event.keyCode==13){e.target.blur()}},!1);function commitChanges(val,skipSymbol,dom){let selectText=!1;if(val=='')selectText=!0;gizmo.value=formatValue(val,skipSymbol);updatePair();callbackFn(thisGizmo.value);if(selectText)gizmo.select()}
thisGizmo.dynamicUpdate=dynamicUpdate;function dynamicUpdate(val,skipCallback){gizmo.value=formatValue(val);updatePair();if(typeof skipCallback=='undefined')callbackFn(thisGizmo.value);gizmo.blur()}
thisGizmo.update=update;function update(val){gizmo.value=formatValue(val)}
return thisGizmo}
if(type=='hexBox'){let gizmoObject=this.gizmo[title];gizmo=document.createElement('input');gizmo.type="text";gizmo.setAttribute('data-gizmo','hex-box');gizmo.value=value;this.DOM.appendChild(gizmo);thisGizmo.valueDOM=gizmo;gizmo.addEventListener('keyup',keyUp.bind(this),!1);function keyUp(e){let val=e.target.value;val='#'+val.replace(/[G-Zg-z\W]/g,'');e.target.value=val;callbackFn(val);gizmoObject.value=val}
this.gizmo[title].update=update;function update(val){gizmo.value=val}}
if(type=='textBox'){thisGizmo.format='string';let frame=document.createElement('label');parentDOM.appendChild(frame);let $Text='',labelText=label;if(label){let $Pos=label.indexOf('$');if($Pos>-1){$Text=label.slice($Pos+1);labelText=label.slice(0,$Pos)}
let pref=document.createElement('span');pref.innerHTML=labelText;pref.className="prefix"
frame.appendChild(pref)}
gizmo=document.createElement('input');gizmo.type="text";gizmo.setAttribute('data-gizmo','text-box');gizmo.value=value;frame.appendChild(gizmo);thisGizmo.valueDOM=gizmo;if($Text.length>0){let suff=document.createElement('span');suff.innerHTML=$Text;suff.className='suffix';frame.appendChild(suff)}
gizmo.addEventListener(pointerEvent.click,function(e){if(!thisGizmo.editing){thisGizmo.editing=!0;e.target.select()}},!1);gizmo.addEventListener('blur',function(e){commitChanges(e);thisGizmo.editing=!1},!1);gizmo.addEventListener('keyup',function(e){commitChanges(e);if(event.which==13||event.keyCode==13){ele.blur()}},!1);function commitChanges(e){let ele=e.target,val=formatValue(ele.value);ele.value=val;updatePair();callbackFn(val)}
thisGizmo.update=update;function update(val){gizmo.value=val;thisGizmo.value=val}}
if(type=='colorGraph'){gizmo=document.createElement('section');gizmo.id=title;gizmo.setAttribute('data-gizmo','color-graph');this.DOM.appendChild(gizmo);let graph=document.createElement('canvas');graph.width=186;graph.height=100;graph.setAttribute('data-gizmo','color-graph');graph.id=title+'-graph';gizmo.appendChild(graph);let level=document.createElement('div');level.className='lvl';gizmo.appendChild(level);thisGizmo.update=update;function update(colorObj,drawGraph){thisGizmo.value={h:parseInt(colorObj.h),s:parseInt(colorObj.s),l:parseInt(colorObj.l)}
let val=thisGizmo.value;if(drawGraph){let ctx=graph.getContext('2d'),gw=Math.round(graph.width/100),gh=Math.round(graph.height/100);for(let s=0;s<=100;s++){for(let l=0;l<=100;l++){ctx.fillStyle='hsl('+val.h+', '+s+'%, '+l+'%)';ctx.fillRect(s*gw,graph.height-l*gh,(gw),(gh))}}}
var userX=(val.s/100)*graph.width,userY=graph.height-(val.l/100)*graph.height;level.style.left=userX+'px';level.style.top=userY+'px'}
update(value,!0)}
if(type=='colorHue'){gizmo=document.createElement('section');gizmo.id=title;gizmo.setAttribute('data-gizmo','color-hue');this.DOM.appendChild(gizmo);let slider=document.createElement('canvas');slider.width=186;slider.height=25;slider.setAttribute('data-gizmo','color-hue');slider.id=title+'-slider';gizmo.appendChild(slider);let level=document.createElement('div');level.className='lvl';gizmo.appendChild(level);let ctx=slider.getContext('2d'),step=slider.width/360,s=100,l=50;for(let i=0;i<=360;i++){ctx.fillStyle='hsl('+i+', '+s+'%, '+l+'%)';ctx.fillRect(step*i,0,1,slider.height)}
thisGizmo.update=update;function update(colorObj){thisGizmo.value={h:parseInt(colorObj.h),s:parseInt(colorObj.s),l:parseInt(colorObj.l)}
let userX=(thisGizmo.value.h/360)*slider.width;level.style.left=userX+'px'}
update(value)}
if(type=='colorRGB'){gizmo=document.createElement('div');gizmo.className='frame';gizmo.id=title;gizmo.setAttribute('data-gizmo','color-rgb');this.DOM.appendChild(gizmo);var slider={'r':document.createElement('canvas'),'g':document.createElement('canvas'),'b':document.createElement('canvas')};let labelName={'r':'RED','g':'GREEN','b':'BLUE'}
for(var s in slider){slider[s].width=182;slider[s].height=20;slider[s].id=title+'--'+s;slider[s].setAttribute('data-gizmo','color-rgb');let frame=document.createElement('section');frame.className='rgb-slider';let rgbNum=this.addGizmo('numberDrag',title+'-v-'+s,0,labelName[s],updateVal.bind(s),frame);rgbNum.setFormat('number',0,255);function updateVal(val){thisGizmo.value[this]=val;thisGizmo.update(val)}
frame.appendChild(slider[s]);let level=document.createElement('div');level.className='lvl';frame.appendChild(level);gizmo.appendChild(frame)}
let _this=this;thisGizmo.update=update.bind(this);function update(colorObj){thisGizmo.value={r:parseInt(colorObj.r),g:parseInt(colorObj.g),b:parseInt(colorObj.b)}
var val=thisGizmo.value;for(var s in slider){_this.gizmo[title+'-v-'+s].update(val[s]);let parent=slider[s].parentNode,ctx=slider[s].getContext('2d'),step=Math.round(slider[s].width/255),r=val.r,g=val.g,b=val.b;for(let i=0;i<=255;i++){if(s=='r'){ctx.fillStyle='rgb('+i+', '+g+', '+b+')'}
if(s=='g')ctx.fillStyle='rgb('+r+', '+i+', '+b+')';if(s=='b')ctx.fillStyle='rgb('+r+', '+g+', '+i+')';ctx.fillRect(step*i,0,1,slider[s].height)}
let userX=(val[s]/255)*slider[s].width;parent.lastChild.style.left=userX+'px'}}
update(value)}
function setFormat(type,min,max,symbol,symbolPos){if(type=='string'){this.format='string';this.range=[];return}
if(type=='number'){let symbolText=symbol||'';this.range=[min,max];this.symbol=symbolText.toString();this.symbolPos=symbolPos||'back';this.format='number'}}
function pairWith(otherGizmo,pairingType){this.active=!0;this.type=pairingType;this.gizmo=otherGizmo;this.ratio=Math.round((thisGizmo.value/otherGizmo.value)*1000)/1000;otherGizmo.pair.active=!0;otherGizmo.pair.type=pairingType;otherGizmo.pair.gizmo=thisGizmo;otherGizmo.pair.ratio=Math.round((otherGizmo.value/thisGizmo.value)*1000)/1000}
function pairUI(w,h){let ui=new Component('classBox','gizmo-aspect-ui'),ele=ui.DOM;gizmo.appendChild(ele);ele.style.width=w+'px';ele.style.height=h+'px';ele.style.right=-w+'px'}
function pairToggle(){if(this.active){this.active=!1;this.gizmo.pair.active=!1}
else{this.active=!0;this.ratio=Math.round((thisGizmo.value/this.gizmo.value)*1000)/1000;this.gizmo.pair.active=!0;this.gizmo.pair.ratio=Math.round((this.gizmo.value/thisGizmo.value)*1000)/1000}}
function updatePair(){if(isNaN(thisGizmo.value)||!thisGizmo.pair.active)return;if(thisGizmo.pair.type=='aspect'){let val=Math.round(thisGizmo.value/thisGizmo.pair.ratio);thisGizmo.pair.gizmo.update(val);thisGizmo.pair.gizmo.callback(val)}}
function formatValue(value,skipSymbol){let currentValue=thisGizmo.value,newValue;if(thisGizmo.format=='number')
newValue=Math.sign(parseInt(value))*parseInt(value.toString().replace(/\D/g,''));else{newValue=value}
if(thisGizmo.range.length>0){if(isNaN(newValue)){return currentValue}
if(newValue<thisGizmo.range[0])newValue=thisGizmo.range[0];if(newValue>thisGizmo.range[1])newValue=thisGizmo.range[1]}
thisGizmo.value=newValue;if(!skipSymbol){if(thisGizmo.symbolPos=='back')return(newValue.toString()+thisGizmo.symbol);else return(thisGizmo.symbol+newValue.toString())}else{return newValue}}
return thisGizmo}
Component.prototype.activateGizmos=function(){var sx=0,sy=0;let app=document.getElementById('app-main');this.panel.DOM.removeEventListener(pointerEvent.down,mouseDown,!1);this.panel.DOM.addEventListener(pointerEvent.down,mouseDown.bind(this.panel),!1);function mouseDown(e){this.focus=e.target.getAttribute('data-gizmo')||'none';if(this.focus!='none'){this.focusId=e.target.id;sx=e.clientX;sy=e.clientY;e.target.blur();snapValue(this.focusId);gizmoActions(e,this.focus,this.focusId)}}
document.removeEventListener(pointerEvent.up,mouseUp,!1);document.addEventListener(pointerEvent.up,mouseUp.bind(this.panel),!1);function mouseUp(e){gizmoActions(e,this.focus,this.focusId);this.focus="none"}
document.removeEventListener(pointerEvent.move,mouseMove,!1);document.addEventListener(pointerEvent.move,mouseMove.bind(this.panel),!1);function mouseMove(e){if(this.focus!='none')gizmoActions(e,this.focus,this.focusId)}
console.log('Gizmos enabled on '+this.panel.DOM.id+'.');var _this=this.panel;function snapValue(focusId){if(typeof _this.gizmo[focusId]=='undefined')return;_this.gizmo[focusId].snapValue=_this.gizmo[focusId].value}
function gizmoActions(e,focus,focusId){if(focus==='color-graph'){let element=document.getElementById(focusId),rect=element.getBoundingClientRect(),relX=element.width/100,relY=element.height/100,mx=cap(e.clientX-rect.left,0,element.width),my=cap(e.clientY-rect.top,0,element.height),s=Math.round(mx/relX),l=100-Math.round(my/relY);focusId=focusId.replace('-graph','');let val=_this.gizmo[focusId].value;val.l=l;val.s=s;_this.gizmo[focusId].callback(val,e,'color-graph');return}
if(focus==='color-hue'){let element=document.getElementById(focusId),rect=element.getBoundingClientRect(),rel=element.width/360,mx=cap(e.clientX-rect.left,0,element.width),h=Math.round(mx/rel);focusId=focusId.replace('-slider','');let val=_this.gizmo[focusId].value;val.h=h;_this.gizmo[focusId].callback(val,e,'color-hue');return}
if(focus==='color-rgb'){let keyStr=focusId.substr(focusId.length-3,3),str='--r--g--b';if(str.search(keyStr)>-1){let element=document.getElementById(focusId),rect=element.getBoundingClientRect(),rel=element.width/255,mx=cap(e.clientX-rect.left,0,element.width);let key=keyStr.replace('--','');focusId=focusId.replace(keyStr,'');let val=_this.gizmo[focusId].value;val[key]=Math.round(mx/rel);_this.gizmo[focusId].callback(val,e,'color-rgb')}
return}
if(focus==='number-drag'){let element=document.getElementById(focusId),rect=element.getBoundingClientRect(),dOff=10,dx=e.clientX-(rect.left+element.offsetWidth/2),dy=e.clientY-(rect.top+element.offsetHeight/2),d=Math.sign(dy*-1)*Math.sqrt(dx*dx+dy*dy),dMax=300;if(d>=dOff||d<=-dOff){d-=dOff*Math.sign(d);let gizmo=_this.gizmo[focusId],range=gizmo.range[1]||100,append=d/dMax*range,newVal=parseInt(gizmo.snapValue+append);gizmo.dynamicUpdate(newVal)}
return}
if(focus=='panel-drag'){let gizmo=_this.gizmo[focusId],dx=sx-e.clientX,dy=sy-e.clientY,newX=gizmo.snapValue[0]-dx,newY=gizmo.snapValue[1]-dy;gizmo.dynamicUpdate([newX,newY]);return}}}
Component.prototype.addAction=function(map){let evt=map[0];this.DOM.addEventListener(evt,runAction.bind(map),!1);function runAction(){map[1]()}}
Component.prototype.addButton=function(type,action,label){this.button[action]={action:action,DOM:document.createElement('button'),panel:this.panel,label:label,setLabel:buttonText,cycleTabs:cycleTabs,toggleMenu:menuToggle,toggle:toggle,toggleHeight:toggleHeight,toggleSelf:!0,toggleTab:!0,autoHeight:!0,radio:radioBind,callback:function(){}}
let btn=this.button[action].DOM,wrapper=btn,btnLabel=label||'';if(type=='check'){wrapper=document.createElement('label');wrapper.className='checkbox';let labelText=document.createElement('span');wrapper.appendChild(btn);wrapper.appendChild(labelText)}
if(type=='aspect'){wrapper=document.createElement('aside');wrapper.appendChild(btn);wrapper.className='aspect'}
this.DOM.appendChild(wrapper);buttonText(btnLabel);let parentH=wrapper.parentNode.dataset.height||'1';if(type=='tab'){btn.setAttribute('data-tab',action);if(this.button[action].autoHeight)
btn.setAttribute('data-height',parentH)}
if(type=='function'){btn.setAttribute('data-func',action)}
if(type=='cta'){btn.className='cta';btn.setAttribute('data-func',action)}
if(type=='item'){btn.className='item';btn.setAttribute('data-func',action)}
if(type=='check'){btn.setAttribute('data-func',action)}
if(type=='aspect'){btn.setAttribute('data-func',action)}
return this.button[action];function buttonText(txt,append){if(typeof txt=='undefined'||txt=='')return;if(type=='check'){let ico=getMaterialIcon('mdi-square');btn.appendChild(ico);wrapper.lastChild.innerHTML=txt;return}
if(btn.firstChild&&!append)btn.removeChild(btn.firstChild);if(txt.substr(0,3)=='url'){let url=txt.substr(4,txt.length-5),icon=document.createElement('img');btn.appendChild(icon);icon.onload=function(){}
icon.src=url
btn.appendChild(icon)}
else if(txt.substr(0,3)=='mdi'){let ico=getMaterialIcon(txt);btn.appendChild(ico)}
else if(txt.substr(0,3)=='bb-'){let ico=getBBIcon(txt);btn.appendChild(ico)}
else{let span=document.createElement('span');span.className='text';span.innerHTML=txt;btn.appendChild(span)}}
function getMaterialIcon(icon){var item=document.createElement('span');item.className='mdi '+icon;return item}
function getBBIcon(icon){var item=document.createElement('span');item.className=icon;return item}
function radioBind(groupName,toggleSelf,toggleMenu){this.toggleSelf=toggleSelf||!1;this.toggleTab=toggleMenu||this.toggleSelf;this.DOM.setAttribute('data-radio',groupName);return this}
function toggleHeight(tH){this.autoHeight=tH}
function cycleTabs(callback){let btn=this.DOM,menuId=this.action.split(',');if(menuId.length==0)return this;btn.setAttribute('data-cycle','0');btn.addEventListener(pointerEvent.click,function(e){let cycleBtn=e.currentTarget;for(i=0;i<menuId.length;i++){let menu=document.getElementById(menuId[i]);menu.style.display='none'}
let index=parseInt(cycleBtn.getAttribute('data-cycle'));index++;if(index>=menuId.length)index=0;cycleBtn.setAttribute('data-cycle',index);let thisMenu=document.getElementById(menuId[index]);thisMenu.style.display='';callback()},!1);let firstMenu=document.getElementById(menuId[0]);firstMenu.style.display='';for(i=1;i<menuId.length;i++){let menu=document.getElementById(menuId[i]);menu.style.display='none'}
return this}
function menuToggle(active,callback){this.callback=callback||function(){};let tabEle=document.getElementById(this.action),tabBtn=this.DOM;let tabHeight=tabEle.getAttribute('data-height')||'3';if(active){if(this.autoHeight)tabBtn.setAttribute('data-height',tabHeight);tabBtn.setAttribute('data-active','');tabEle.style.display=''}
else{tabEle.style.display='none'}
var _this=this;tabBtn.addEventListener(pointerEvent.click,function(e){let btn=e.currentTarget,tab=document.getElementById(btn.dataset.tab),parentH=btn.parentNode.dataset.height||'1',act=active;if(typeof btn.dataset.active!='undefined'){if(_this.toggleSelf){if(_this.autoHeight)btn.setAttribute('data-height',parentH);btn.removeAttribute('data-active');act=!1}
if(_this.toggleTab){if(tab.style.display!='none')
tab.style.display='none';else tab.style.display=''}}
else{if(_this.autoHeight)btn.setAttribute('data-height',tabHeight);btn.setAttribute('data-active','');act=!0;tab.style.display='';if(btn.dataset.radio){let child=document.getElementsByTagName('button');for(let i=0;i<child.length;i++){let c=child[i];if(c==btn)continue;let group=c.getAttribute('data-radio');if(typeof group=='undefined')continue;if(group==btn.dataset.radio){if(_this.autoHeight)c.setAttribute('data-height',parentH);c.removeAttribute('data-active');if(typeof c.dataset.tab!='undefined'){let gtab=document.getElementById(c.dataset.tab);gtab.style.display='none'}}}}}
_this.callback(act)},!1);return this}
function toggle(active,btnLabelAlt,toggleHeightN){let toggleBtn=this.DOM,label=this.label,newH=toggleHeightN||0;if(active)setActive(toggleBtn,this)
else setInactive(toggleBtn);toggleBtn.removeEventListener(pointerEvent.click,btnFunc.bind(this),!1);toggleBtn.addEventListener(pointerEvent.click,btnFunc.bind(this),!1);function btnFunc(e){let btn=e.currentTarget;if(typeof btn.dataset.active!='undefined'){if(this.toggleSelf){setInactive(btn)}}else{setActive(btn,this)}}
function setActive(btn,_this){btn.setAttribute('data-active','');if(btnLabelAlt)buttonText(label);_this.callback(btn);if(newH>0)btn.setAttribute('data-height',newH.toString());if(btn.dataset.radio){let child=document.getElementsByTagName('button');for(let i=0;i<child.length;i++){let c=child[i];if(c==btn){continue}
let group=c.getAttribute('data-radio');if(typeof group=='undefined')continue;if(group==btn.dataset.radio){c.removeAttribute('data-active');if(newH>0)btn.removeAttribute('data-height');if(typeof c.dataset.tab!='undefined'){c.removeAttribute('data-height');let tab=document.getElementById(c.dataset.tab);tab.style.display='none'}}}}}
function setInactive(btn){btn.removeAttribute('data-active');if(btnLabelAlt)buttonText(btnLabelAlt);if(newH>0)btn.removeAttribute('data-height')}
return this}}
Component.prototype.mapButtons=function(objMap){for(k in objMap){let action=this.button[k].action;this.button[k].DOM.addEventListener('click',runAction.bind(objMap),!1);function runAction(e){objMap[action]()}}}
Component.prototype.mapButton=function(btnTitle,fn){this.button[btnTitle].DOM.addEventListener('click',fn,!1)}
function selectElementText(element){var sel,range;var el=element;if(window.getSelection&&document.createRange){sel=window.getSelection();if(sel.toString()==''){window.setTimeout(function(){range=document.createRange();range.selectNodeContents(el);sel.removeAllRanges();sel.addRange(range)},1)}}else if(document.selection){sel=document.selection.createRange();if(sel.text==''){range=document.body.createTextRange();range.moveToElementText(el);range.select()}}}
function clearSelection(){if(window.getSelection){window.getSelection().removeAllRanges()}
else if(document.selection){document.selection.empty()}}
function getInlineSVG(url){var svg=document.createElement('svg'),use=document.createElement('use');svg.setAttribute('role','img');svg.style.width="20px";svg.style.height="20px";use.style.width="20px";use.style.height="20px";use.setAttribute('xlink:href',url);svg.appendChild(use);return svg}