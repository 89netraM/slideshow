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
	if (info.menuItemId === contextMenuId) {
		openLink(info.linkUrl);
	}
});

function openLink(link) {
	bro.tabs.create({
		active: true,
		url: link
	});
}