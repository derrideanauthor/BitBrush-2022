
function drawLine(ctx, x0, y0, x1, y1, strokeWidth, color){
   var dx = Math.abs(x1-x0);
   var dy = Math.abs(y1-y0);
   var sx = (x0 < x1) ? 1 : -1;
   var sy = (y0 < y1) ? 1 : -1;
   var err = dx-dy;
   var clear = false,
   	   fn;

   
   if (color == "rgba(0, 0, 0, 0)" || color == 'none') 
   fn = function (){ 
   		ctx.clearRect(x0, y0, strokeWidth, strokeWidth);
   }
   else fn = function (){
   		ctx.fillStyle = color;
   		ctx.fillRect(x0, y0, strokeWidth, strokeWidth);
   }

   while(true){     
   	 	fn();
     	if ((x0==x1) && (y0==y1)) break;
     	var e2 = 2*err;
     	if (e2 >-dy){ err -= dy; x0  += sx; }
     	if (e2 < dx){ err += dx; y0  += sy; }
   }
}


function drawRect(context, x0, y0, x1, y1, strokeWidth, color, filled, fromCenter){ 

	if (fromCenter){
		let w = x0 - x1,
			h = y0 - y1;
		
	console.log('rect: '+x0+','+y0+','+w+','+h);

		x0 = x0 + w;
		y0 = y0 + h;
	}

    if (color == "rgba(0, 0, 0, 0)" || color == 'none') {
   		if (!filled){
	   		drawLine(context, x0, y0, x1, y0, strokeWidth, color);//top
	   		drawLine(context, x1, y0, x1, y1, strokeWidth, color);//right
	   		drawLine(context, x0, y1, x1, y1, strokeWidth, color);//bottom
	   		drawLine(context, x0, y0, x0, y1, strokeWidth, color);//left
	   	}
   		else{
   			ctx.clearRect(x0, y0, x1, y1);
   		}
    }
    else {

    	if (!filled){
    		x0 += .5;
			x1 += .5;
			y0 += .5;
			y1 += .5;
			context.lineWidth = strokeWidth;
			context.strokeStyle = color;
			context.strokeRect(x0,y0,x1-x0,y1-y0);
		}
		else{
			x1 += (x1-x0 > 0 ? 1 : 0);
			y1 += (y1-y0 > 0 ? 1 : 0);
			x0 += (x1-x0 < 0 ? 1 : 0);
			y0 += (y1-y0 < 0 ? 1 : 0);

			context.fillStyle = color;
			context.fillRect(x0,y0,x1-x0,y1-y0);
		}
    }
}

function drawEllipse(context, x0, y0, x1, y1, strokeWidth, color, fromCenter) {

	let clear = false;

	if (color == "rgba(0, 0, 0, 0)" || color == 'none') clear = true;
		else context.fillStyle = color;

	if (fromCenter){
		let w = x0 - x1,
			h = y0 - y1;

		//! x0 = x0 + Math.round(w / 2);
		//! y0 = y0 + Math.round(h / 2);
		//! for getCirclePixels
		centerEllipse(context, x0, y0,  Math.abs(w),  Math.abs(h), strokeWidth, clear);
		return;
	}
	
	var map = getCirclePixels(x0, y0, x1, y1, strokeWidth);
	for (let i = 0; i < map.length; i++){
		let cx = map[i][0],
			cy = map[i][1];

		if (clear){
			context.clearRect(cx, cy, 1, 1);
		}
		else{
			context.clearRect(cx, cy, 1, 1);
			context.fillRect (cx, cy, 1, 1);				
		}
	}	
}

function centerEllipse(ctx, xc, yc,  a,  b, strokeWidth, clear) {

    var a2 = a * a;
    var b2 = b * b;
    var twoa2 = 2 * a2;
    var twob2 = 2 * b2;
    var p;
    var x = 0;
    var y = b;
    var px = 0;
    var py = twoa2 * y;

    /* Plot the initial point in each quadrant. */
    ellipsePlotPoints (xc,yc, x, y);

    /* Region 1 */
    p = Math.round (b2 - (a2 * b) + (0.25 * a2));
    while (px < py) {
        x++;
        px += twob2;
        if (p < 0)
        p += b2 + px;
        else {
        y--;
        py -= twoa2;
        p += b2 + px - py;
        }
        ellipsePlotPoints (xc,yc, x, y);
    }

    /* Region 2 */
    p = Math.round (b2 * (x+0.5) * (x+0.5) + a2 * (y-1) * (y-1) - a2 * b2);
    while (y > 0) {
        y--;
        py -= twoa2;
        if (p > 0)
        p += a2 - py;
        else {
        x++;
        px += twob2;
        p += a2 - py + px;
        }
        ellipsePlotPoints (xc,yc, x, y);
    }

    function ellipsePlotPoints (xc, yc,  x,  y)
	{
	    if (!clear){
	    	ctx.clearRect (xc + x, yc + y, 1, 1);
	    	ctx.fillRect ((xc + x), (yc + y), 1, 1);
	    	ctx.clearRect (xc - x, yc + y, 1, 1);
	    	ctx.fillRect ((xc - x), (yc + y), 1, 1);
	    	ctx.clearRect (xc + x, yc - y, 1, 1);
	    	ctx.fillRect ((xc + x), (yc - y), 1, 1);
	    	ctx.clearRect (xc - x, yc - y, 1, 1);
	    	ctx.fillRect ((xc - x), (yc - y), 1, 1);
	    }else{
	    	ctx.clearRect (xc + x, yc + y, 1, 1);
	    	ctx.clearRect (xc - x, yc + y, 1, 1);
	    	ctx.clearRect (xc + x, yc - y, 1, 1);
	    	ctx.clearRect (xc - x, yc - y, 1, 1);	    	
	    }	    
	}
}

function reflectRotate(canvasElement, mode, direction){
	let ctx = canvasElement.getContext('2d'),
		width = canvasElement.width, 
		height = canvasElement.height, 
		imageData = ctx.getImageData(0, 0, width, height),
		data = imageData.data,
		newData = []
		pixelData = []

	//copy current pixel data
	for (let i = 0; i < data.length; i++)
		newData.push(data[i]);

	//Flip 
	if (mode == 'flip'){
		for (let py = 0; py < height; py++){
			for (let px = 0; px < width; px++){
				let i = getIndex(px, py),
				 	ni = 0;

				if (direction == "horizontal")
					ni = getIndex((width-1)-px, py);
				else
					ni = getIndex(px, (height-1)-py);

				for (let c = 0; c < 4; c++)
					data[i+c] = newData[ni+c];					
			}
		}
	}

	//Rotate
	let nh = width,
		nw = height,
		nx = 0, 
		ny = 0;	

	if (mode == 'rotate'){
		if (direction != 'clockwise') ny = nh-1;
		canvasElement.width = nw;
		canvasElement.height = nh;

		for (let px = 0; px < width; px++){
			for (let py = 0; py < height; py++){
				let i = getIndex(px, py),
					ni = 0;

				if (direction == 'clockwise') nx = nw-py-1;
				else nx = py;

				ni = (nx+ny*nw)*4;

				for (let c = 0; c < 4; c++)
					data[ni+c] = newData[i+c];	
			}
			if (direction == 'clockwise') ny++;
				else ny--;
		}
		imageData = new ImageData(nw, nh);
		
	}


	//return data
	imageData.data.set(data);
	ctx.putImageData(imageData, 0, 0);

	function getIndex(px, py){
		//check if in bounds
		if (px < 0 || px > width || py < 0 || py > height) return -1;
		else 
		return (px+py*width)*4;
	}

	function getXY(i){
		let py = Math.floor(i/(width*4)),
			px = (i - width*4*py)/4;
		return [px, py];
	}
}



/*Zero tolerance color fill by yours truely*/
function colorFill(canvasElement, x, y, color, preview){
	let ctx = canvasElement.getContext('2d'),
		width = canvasElement.width,
		height = canvasElement.height,
		imageData = ctx.getImageData(0, 0, width, height),
		data = imageData.data,
		previewData = [],
		list = [];

	var target = {
		i : getIndex(x, y),
		color : ctx.getImageData(x, y, 1, 1).data
	}

	var ox = x,
		oy = y,
		oi = target.i;

	//skip function if fill colour is the same as the target colour
	if (color[0] == target.color[0] && 
		color[1] == target.color[1] &&
		color[2] == target.color[2] &&
		color[3]*255 == target.color[3]){
		return;
	}


	list.push(oi);

	while(list.length > 0){
		flowColor(ox, oy);

		//color current pixel
		paintPixel(oi)
		list.shift();

		//next pixel
		oi = list[0];
		ox = getXY(oi)[0];
		oy = getXY(oi)[1];
	}

	//return data
	imageData.data = data;
	if (preview) imageData.data = previewData;
	ctx.putImageData(imageData, 0, 0);

	function flowColor(ox, oy){
		let dir = [
				getIndex(ox, oy-1), 	//up
				getIndex(ox-1, oy),		//left
				getIndex(ox+1, oy),		//right	
				getIndex(ox, oy+1)		//down
			];

		for (let i = 0; i < dir.length; i++){
			let pi = dir[i];
			//already in list or not on canvas
			if (list.indexOf(pi) >= 0 || pi < 0) continue;
			//if color matches, put in list
			if (matchColor(pi)) {
				list.push(pi);
			}
		}
	}

	function getIndex(px, py){
		//check if in bounds
		if (px < 0 || px > width || py < 0 || py > height) return -1;
		else 
		return (px+py*width)*4;
	}

	function getXY(i){
		let py = Math.floor(i/(width*4)),
			px = (i - width*4*py)/4;
		return [px, py];
	}

	function matchColor(pi){
		let tColor = target.color;

		if (tColor[0] == data[pi] && 
			tColor[1] == data[pi+1] && 
			tColor[2] == data[pi+2] && 
			tColor[3] == data[pi+3]){
			return true;
		}
		else return false;
	}

	function paintPixel(oi){
		data[oi] = color[0];
		data[oi+1] = color[1];
		data[oi+2] = color[2];
		data[oi+3] = color[3]*255;

		if (preview){
			previewData[oi] = color[0];
			previewData[oi+1] = color[1];
			previewData[oi+2] = color[2];
			previewData[oi+3] = color[3]*255;
		}
	}
}

//piskelapp circle
function getCirclePixels (x0, y0, x1, y1, penSize) {

    var coords = getOrderedRectangleCoordinates(x0, y0, x1, y1);
    var pixels = [];
    var xC = Math.round((coords.x0 + coords.x1) / 2);
    var yC = Math.round((coords.y0 + coords.y1) / 2);
    var evenX = (coords.x0 + coords.x1) % 2;
    var evenY = (coords.y0 + coords.y1) % 2;
    var rX = coords.x1 - xC;
    var rY = coords.y1 - yC;

    var x;
    var y;
    var angle;
    var r;

    if (penSize == 1) {
      for (x = coords.x0 ; x <= xC ; x++) {
        angle = Math.acos((x - xC) / rX);
        y = Math.round(rY * Math.sin(angle) + yC);
        pixels.push([x - evenX, y]);
        pixels.push([x - evenX, 2 * yC - y - evenY]);
        pixels.push([2 * xC - x, y]);
        pixels.push([2 * xC - x, 2 * yC - y - evenY]);
      }
      for (y = coords.y0 ; y <= yC ; y++) {
        angle = Math.asin((y - yC) / rY);
        x = Math.round(rX * Math.cos(angle) + xC);
        pixels.push([x, y - evenY]);
        pixels.push([2 * xC - x - evenX, y - evenY]);
        pixels.push([x, 2 * yC - y]);
        pixels.push([2 * xC - x - evenX, 2 * yC - y]);
      }
      return pixels;
    }

    function getOrderedRectangleCoordinates (x0, y0, x1, y1) {
      return {
        x0 : Math.min(x0, x1),
        y0 : Math.min(y0, y1),
        x1 : Math.max(x0, x1),
        y1 : Math.max(y0, y1)
      };
    }
}

// // Flood FIll - Paint Bucket Tool

// var floodfill = (function() {

// 	//Copyright(c) Max Irwin - 2011, 2015, 2016
// 	//MIT License

// 	function floodfill(data,x,y,fillcolor,tolerance,width,height) {

// 		var length = data.length;
// 		var Q = [];
// 		var i = (x+y*width)*4;
// 		var e = i, w = i, me, mw, w2 = width*4;

// 		var targetcolor = [data[i],data[i+1],data[i+2],data[i+3]];

// 		if(!pixelCompare(i,targetcolor,fillcolor,data,length,tolerance)) { return false; }
// 		Q.push(i);
// 		while(Q.length) {
// 			i = Q.pop();
// 			if(pixelCompareAndSet(i,targetcolor,fillcolor,data,length,tolerance)) {
// 				e = i;
// 				w = i;
// 				mw = parseInt(i/w2)*w2-1; //left bound
// 				me = mw+w2;             //right bound
// 				while(mw<w && mw<(w-=4) && pixelCompareAndSet(w,targetcolor,fillcolor,data,length,tolerance)); //go left until edge hit
// 				while(me>e && me>(e+=4) && pixelCompareAndSet(e,targetcolor,fillcolor,data,length,tolerance)); //go right until edge hit
// 				for(var j=w+4;j<e;j+=4) {
// 					if(j-w2>=0     && pixelCompare(j-w2,targetcolor,fillcolor,data,length,tolerance)) Q.push(j-w2); //queue y-1
// 					if(j+w2<length && pixelCompare(j+w2,targetcolor,fillcolor,data,length,tolerance)) Q.push(j+w2); //queue y+1
// 				}
// 			}
// 		}
// 		return data;
// 	};

// 	function pixelCompare(i,targetcolor,fillcolor,data,length,tolerance) {
// 		if (i<0||i>=length) return false; //out of bounds
// 		if (data[i+3]===0 && fillcolor.a>0) return true;  //surface is invisible and fill is visible

// 		if (
// 			Math.abs(targetcolor[3] - fillcolor.a)<=tolerance &&
// 			Math.abs(targetcolor[0] - fillcolor.r)<=tolerance &&
// 			Math.abs(targetcolor[1] - fillcolor.g)<=tolerance &&
// 			Math.abs(targetcolor[2] - fillcolor.b)<=tolerance
// 		) return false; //target is same as fill


// 		if (
// 			(targetcolor[3] === data[i+3]) &&
// 			(targetcolor[0] === data[i]  ) &&
// 			(targetcolor[1] === data[i+1]) &&
// 			(targetcolor[2] === data[i+2])
// 		) return true; //target matches surface


// 		if (
// 			Math.abs(targetcolor[3] - data[i+3])<=(255-tolerance) &&
// 			Math.abs(targetcolor[0] - data[i]  )<=tolerance &&
// 			Math.abs(targetcolor[1] - data[i+1])<=tolerance &&
// 			Math.abs(targetcolor[2] - data[i+2])<=tolerance
// 		) return true; //target to surface within tolerance


// 		return false; //no match
// 	};

// 	function pixelCompareAndSet(i,targetcolor,fillcolor,data,length,tolerance) {
// 		if(pixelCompare(i,targetcolor,fillcolor,data,length,tolerance)) {
// 			//fill the color
// 			data[i]   = fillcolor.r;
// 			data[i+1] = fillcolor.g;
// 			data[i+2] = fillcolor.b;
// 			data[i+3] = fillcolor.a;
// 			return true;
// 		}
// 		return false;
// 	};

// 	function fillUint8ClampedArray(data,x,y,color,tolerance,width,height) {
// 		if (!data instanceof Uint8ClampedArray) throw new Error("data must be an instance of Uint8ClampedArray");
// 		if (isNaN(width)  || width<1)  throw new Error("argument 'width' must be a positive integer");
// 		if (isNaN(height) || height<1) throw new Error("argument 'height' must be a positive integer");
// 		if (isNaN(x) || x<0) throw new Error("argument 'x' must be a positive integer");
// 		if (isNaN(y) || y<0) throw new Error("argument 'y' must be a positive integer");
// 		if (width*height*4!==data.length) throw new Error("width and height do not fit Uint8ClampedArray dimensions");

// 		var xi = Math.floor(x);
// 		var yi = Math.floor(y);

// 		if (xi!==x) console.warn("x truncated from",x,"to",xi);
// 		if (yi!==y) console.warn("y truncated from",y,"to",yi);

// 		//Maximum tolerance of 254, Default to 0
// 		tolerance = (!isNaN(tolerance)) ? Math.min(Math.abs(Math.round(tolerance)),254) : 0;

// 		return floodfill(data,xi,yi,color,tolerance,width,height);
// 	};

// 	var getComputedColor = function(c) {
// 		var temp = document.createElement("div");
// 		var color = {r:0,g:0,b:0,a:0};
// 		temp.style.color = c;
// 		temp.style.display = "none";
// 		document.body.appendChild(temp);
// 		//Use native window.getComputedStyle to parse any CSS color pattern
// 		var style = window.getComputedStyle(temp,null).color;
// 		document.body.removeChild(temp);

// 		var recol = /([\.\d]+)/g;
// 		var vals  = style.match(recol);
// 		if (vals && vals.length>2) {
// 			//Coerce the string value into an rgba object
// 			color.r = parseInt(vals[0])||0;
// 			color.g = parseInt(vals[1])||0;
// 			color.b = parseInt(vals[2])||0;
// 			color.a = Math.round((parseFloat(vals[3])||1.0)*255);
// 		}
// 		return color;
// 	};

// 	function fillContext(x,y,tolerance,left,top,right,bottom) {
// 		var ctx  = this;
		
// 		//Gets the rgba color from the context fillStyle
// 		var color = getComputedColor(this.fillStyle);

// 		//Defaults and type checks for image boundaries
// 		left     = (isNaN(left)) ? 0 : left;
// 		top      = (isNaN(top)) ? 0 : top;
// 		right    = (!isNaN(right)&&right) ? Math.min(Math.abs(right),ctx.canvas.width) : ctx.canvas.width;
// 		bottom   = (!isNaN(bottom)&&bottom) ? Math.min(Math.abs(bottom),ctx.canvas.height) : ctx.canvas.height;

// 		var image = ctx.getImageData(left,top,right,bottom);
		
// 		var data = image.data;
// 		var width = image.width;
// 		var height = image.height;
		
// 		if(width>0 && height>0) {
// 			fillUint8ClampedArray(data,x,y,color,tolerance,width,height);
// 			ctx.putImageData(image,left,top);
// 		}
// 	};

// 	if (typeof CanvasRenderingContext2D != 'undefined') {
// 		CanvasRenderingContext2D.prototype.fillFlood = fillContext;
// 	};

// 	return fillUint8ClampedArray;

// })();

/****ANIMATION RENDERER****/

// (function() {
//     var lastTime = 0;
//     var vendors = ['ms', 'moz', 'webkit', 'o'];
//     for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
//         window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
//         window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
//                                    || window[vendors[x]+'CancelRequestAnimationFrame'];
//     }
 
//     if (!window.requestAnimationFrame)
//         window.requestAnimationFrame = function(callback, element) {
//             var currTime = new Date().getTime();
//             var timeToCall = Math.max(0, 16 - (currTime - lastTime));
//             var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
//               timeToCall);
//             lastTime = currTime + timeToCall;
//             return id;
//         };
 
//     if (!window.cancelAnimationFrame)
//         window.cancelAnimationFrame = function(id) {
//             clearTimeout(id);
//         };
// }());