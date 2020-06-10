const bro = window.browser || window.chrome;

const contextMenuId = "openSlideshow"
bro.contextMenus.create({
	id: contextMenuId,
	title: "Open in åsberg.net/slideshow",
	contexts: [
		"link"
	]
});

bro.contextMenus.onClicked.addListener((info, tab) => {
	console.log(info, tab);
});