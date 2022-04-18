var Color=function(){this.r=0;this.g=0;this.b=0;this.a=1;this.h=360;this.s=0;this.l=0;this.v=0;this.hex="#000000";this.mode="hsl"}
Color.prototype.RGBtoHSL=function(){var r=this.r/255,g=this.g/255,b=this.b/255;var max=Math.max(r,g,b),min=Math.min(r,g,b);var h,s,l=(max+min)/2;if(max==min){h=s=0}else{var d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break}
h/=6}
this.h=Math.round(h*360);this.s=Math.round(s*100);this.l=Math.round(l*100)}
Color.prototype.HSLtoRGB=function(){var r,g,b;var h=this.h/360,s=this.s/100,l=this.l/100;if(s==0){r=g=b=l}else{var hue2rgb=function hue2rgb(p,q,t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p}
var q=l<0.5?l*(1+s):l+s-l*s;var p=2*l-q;r=hue2rgb(p,q,h+1/3);g=hue2rgb(p,q,h);b=hue2rgb(p,q,h-1/3)}
this.r=Math.round(r*255);this.g=Math.round(g*255);this.b=Math.round(b*255)}
Color.prototype.RGBtoHSV=function(){var red=this.r/255;var green=this.g/255;var blue=this.b/255;var cmax=Math.max(red,green,blue);var cmin=Math.min(red,green,blue);var delta=cmax-cmin;var hue=0;var saturation=0;if(delta){if(cmax===red){hue=((green-blue)/delta)}
if(cmax===green){hue=2+(blue-red)/delta}
if(cmax===blue){hue=4+(red-green)/delta}
if(cmax)saturation=delta/cmax}
this.h=60*hue|0;if(this.h<0)this.h+=360;this.s=(saturation*100)|0;this.v=(cmax*100)|0};Color.prototype.HSVtoRGB=function(){var sat=this.s/100;var value=this.v/100;var C=sat*value;var H=this.h/60;var X=C*(1-Math.abs(H%2-1));var m=value-C;var precision=255;C=(C+m)*precision|0;X=(X+m)*precision|0;m=m*precision|0;if(H>=0&&H<1){this.toRGB(C,X,m);return}
if(H>=1&&H<2){this.toRGB(X,C,m);return}
if(H>=2&&H<3){this.toRGB(m,C,X);return}
if(H>=3&&H<4){this.toRGB(m,X,C);return}
if(H>=4&&H<5){this.toRGB(X,m,C);return}
if(H>=5&&H<6){this.toRGB(C,m,X);return}};Color.prototype.toRGB=function(red,green,blue){this.r=red|0;this.g=green|0;this.b=blue|0;this.a=1};Color.prototype.setRGBA=function(red,green,blue,alpha){this.r=red|0;this.g=green|0;this.b=blue|0;this.a=alpha|0;this.RGBtoHSL();this.getHex()};Color.prototype.setHSL=function(hue,saturation,lightness){this.h=hue;this.s=saturation;this.l=lightness;this.HSLtoRGB();this.getHex()};Color.prototype.setHex=function(value){var valid=/(^#{0,1}[0-9A-F]{6}$)|(^#{0,1}[0-9A-F]{3}$)/i.test(value);if(valid!==!0)
return;if(value[0]==='#')
value=value.slice(1,value.length);if(value.length===3)
value=value.replace(/([0-9A-F])([0-9A-F])([0-9A-F])/i,'$1$1$2$2$3$3');this.r=parseInt(value.substr(0,2),16);this.g=parseInt(value.substr(2,2),16);this.b=parseInt(value.substr(4,2),16);this.a=1};Color.prototype.getHex=function(){var r=this.r,g=this.g,b=this.b;var value="#"+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);this.hex=value;return value.toUpperCase()};Color.prototype.getRGBA=function(){var rgb='('+this.r+', '+this.g+', '+this.b,a='',v='',x=parseFloat(this.a);if(x!==1){a='a';v=', '+x}
var value='rgb'+a+rgb+v+')';return value};Color.prototype.getHSLA=function(){var a='';var v='';var hsl='('+this.h+', '+this.s+'%, '+this.l+'%';var x=parseFloat(this.a);if(x!==1){a='a';v=', '+x}
var value='hsl'+a+hsl+v+')';return value}