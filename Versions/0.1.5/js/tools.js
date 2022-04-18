function drawLine(ctx,x0,y0,x1,y1,strokeWidth,color){var dx=Math.abs(x1-x0);var dy=Math.abs(y1-y0);var sx=(x0<x1)?1:-1;var sy=(y0<y1)?1:-1;var err=dx-dy;var clear=!1,fn;if(color=="rgba(0, 0, 0, 0)"||color=='none')
fn=function(){ctx.clearRect(x0,y0,strokeWidth,strokeWidth)}
else fn=function(){ctx.fillStyle=color;ctx.fillRect(x0,y0,strokeWidth,strokeWidth)}
for(;;){fn();if((x0==x1)&&(y0==y1))break;var e2=2*err;if(e2>-dy){err-=dy;x0+=sx}
if(e2<dx){err+=dx;y0+=sy}}}
function drawRect(context,x0,y0,x1,y1,strokeWidth,color,filled,fromCenter){if(fromCenter){let w=x0-x1,h=y0-y1;console.log('rect: '+x0+','+y0+','+w+','+h);x0=x0+w;y0=y0+h}
if(color=="rgba(0, 0, 0, 0)"||color=='none'){if(!filled){drawLine(context,x0,y0,x1,y0,strokeWidth,color);drawLine(context,x1,y0,x1,y1,strokeWidth,color);drawLine(context,x0,y1,x1,y1,strokeWidth,color);drawLine(context,x0,y0,x0,y1,strokeWidth,color)}
else{ctx.clearRect(x0,y0,x1,y1)}}
else{if(!filled){x0+=.5;x1+=.5;y0+=.5;y1+=.5;context.lineWidth=strokeWidth;context.strokeStyle=color;context.strokeRect(x0,y0,x1-x0,y1-y0)}
else{x1+=(x1-x0>0?1:0);y1+=(y1-y0>0?1:0);x0+=(x1-x0<0?1:0);y0+=(y1-y0<0?1:0);context.fillStyle=color;context.fillRect(x0,y0,x1-x0,y1-y0)}}}
function drawEllipse(context,x0,y0,x1,y1,strokeWidth,color,fromCenter){let clear=!1;if(color=="rgba(0, 0, 0, 0)"||color=='none')clear=!0;else context.fillStyle=color;if(fromCenter){let w=x0-x1,h=y0-y1;centerEllipse(context,x0,y0,Math.abs(w),Math.abs(h),strokeWidth,clear);return}
var map=getCirclePixels(x0,y0,x1,y1,strokeWidth);for(let i=0;i<map.length;i++){let cx=map[i][0],cy=map[i][1];if(clear){context.clearRect(cx,cy,1,1)}
else{context.clearRect(cx,cy,1,1);context.fillRect(cx,cy,1,1)}}}
function centerEllipse(ctx,xc,yc,a,b,strokeWidth,clear){var a2=a*a;var b2=b*b;var twoa2=2*a2;var twob2=2*b2;var p;var x=0;var y=b;var px=0;var py=twoa2*y;ellipsePlotPoints(xc,yc,x,y);p=Math.round(b2-(a2*b)+(0.25*a2));while(px<py){x++;px+=twob2;if(p<0)
p+=b2+px;else{y--;py-=twoa2;p+=b2+px-py}
ellipsePlotPoints(xc,yc,x,y)}
p=Math.round(b2*(x+0.5)*(x+0.5)+a2*(y-1)*(y-1)-a2*b2);while(y>0){y--;py-=twoa2;if(p>0)
p+=a2-py;else{x++;px+=twob2;p+=a2-py+px}
ellipsePlotPoints(xc,yc,x,y)}
function ellipsePlotPoints(xc,yc,x,y)
{if(!clear){ctx.clearRect(xc+x,yc+y,1,1);ctx.fillRect((xc+x),(yc+y),1,1);ctx.clearRect(xc-x,yc+y,1,1);ctx.fillRect((xc-x),(yc+y),1,1);ctx.clearRect(xc+x,yc-y,1,1);ctx.fillRect((xc+x),(yc-y),1,1);ctx.clearRect(xc-x,yc-y,1,1);ctx.fillRect((xc-x),(yc-y),1,1)}else{ctx.clearRect(xc+x,yc+y,1,1);ctx.clearRect(xc-x,yc+y,1,1);ctx.clearRect(xc+x,yc-y,1,1);ctx.clearRect(xc-x,yc-y,1,1)}}}
function colorFill(canvasElement,x,y,color,preview){let ctx=canvasElement.getContext('2d'),width=canvasElement.width,height=canvasElement.height,imageData=ctx.getImageData(0,0,width,height),data=imageData.data,previewData=[],list=[];var target={i:getIndex(x,y),color:ctx.getImageData(x,y,1,1).data}
var ox=x,oy=y,oi=target.i;if(color[0]==target.color[0]&&color[1]==target.color[1]&&color[2]==target.color[2]&&color[3]*255==target.color[3]){return}
list.push(oi);while(list.length>0){flowColor(ox,oy);paintPixel(oi)
list.shift();oi=list[0];ox=getXY(oi)[0];oy=getXY(oi)[1]}
imageData.data=data;if(preview)imageData.data=previewData;ctx.putImageData(imageData,0,0);function flowColor(ox,oy){let dir=[getIndex(ox,oy-1),getIndex(ox-1,oy),getIndex(ox+1,oy),getIndex(ox,oy+1)];for(let i=0;i<dir.length;i++){let pi=dir[i];if(list.indexOf(pi)>=0||pi<0)continue;if(matchColor(pi)){list.push(pi)}}}
function getIndex(px,py){if(px<0||px>width||py<0||py>height)return-1;else return(px+py*width)*4}
function getXY(i){let py=Math.floor(i/(width*4)),px=(i-width*4*py)/4;return[px,py]}
function matchColor(pi){let tColor=target.color;if(tColor[0]==data[pi]&&tColor[1]==data[pi+1]&&tColor[2]==data[pi+2]&&tColor[3]==data[pi+3]){return!0}
else return!1}
function paintPixel(oi){data[oi]=color[0];data[oi+1]=color[1];data[oi+2]=color[2];data[oi+3]=color[3]*255;if(preview){previewData[oi]=color[0];previewData[oi+1]=color[1];previewData[oi+2]=color[2];previewData[oi+3]=color[3]*255}}}
function getCirclePixels(x0,y0,x1,y1,penSize){var coords=getOrderedRectangleCoordinates(x0,y0,x1,y1);var pixels=[];var xC=Math.round((coords.x0+coords.x1)/2);var yC=Math.round((coords.y0+coords.y1)/2);var evenX=(coords.x0+coords.x1)%2;var evenY=(coords.y0+coords.y1)%2;var rX=coords.x1-xC;var rY=coords.y1-yC;var x;var y;var angle;var r;if(penSize==1){for(x=coords.x0;x<=xC;x++){angle=Math.acos((x-xC)/rX);y=Math.round(rY*Math.sin(angle)+yC);pixels.push([x-evenX,y]);pixels.push([x-evenX,2*yC-y-evenY]);pixels.push([2*xC-x,y]);pixels.push([2*xC-x,2*yC-y-evenY])}
for(y=coords.y0;y<=yC;y++){angle=Math.asin((y-yC)/rY);x=Math.round(rX*Math.cos(angle)+xC);pixels.push([x,y-evenY]);pixels.push([2*xC-x-evenX,y-evenY]);pixels.push([x,2*yC-y]);pixels.push([2*xC-x-evenX,2*yC-y])}
return pixels}
function getOrderedRectangleCoordinates(x0,y0,x1,y1){return{x0:Math.min(x0,x1),y0:Math.min(y0,y1),x1:Math.max(x0,x1),y1:Math.max(y0,y1)}}}