const contextMenuId = "openSlideshow"
browser.contextMenus.create({
	id: contextMenuId,
	title: "Open in åsberg.net/slideshow",
	contexts: [
		"link"
	]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === contextMenuId) {
		openLink(info.linkUrl);
	}
});

function openLink(link) {
	browser.tabs.create({
		active: true,
		url: link
	});
}