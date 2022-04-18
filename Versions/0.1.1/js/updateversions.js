
//force browser to reload from server if version change is made
let scriptTag = document.getElementsByTagName('script');

for (let i = 0; i < scriptTag.length; i++){
	let src = scriptTag[i].getAttribute('src')+'?v='+document.title;
	scriptTag[i].setAttribute('src', src);
}

let linkTag = document.getElementsByTagName('link');
for (let i = 0; i < linkTag.length; i++){
	let href = linkTag[i].getAttribute('href')+'?v='+document.title;
	linkTag[i].setAttribute('href', href);
}