const contextMenuId = "openSlideshow"
browser.contextMenus.create({
	id: contextMenuId,
	title: "Open in åsberg.net/slideshow",
	contexts: [
		"link"
	],
	targetUrlPatterns: [
		"*://imgur.com/a/*",
		"*://imgur.com/gallery/*",

		"*://*.reddit.com/*/*"
	]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === contextMenuId) {
		openLink(info.linkUrl, tab.windowId);
	}
});

async function openLink(link, windowId) {
	const tabs = await browser.tabs.query({
		url: "*://åsberg.net/slideshow/*",
		windowId: windowId
	});

	if (tabs.length > 0) {
		browser.tabs.update(
			tabs[0].id,
			{
				active: true,
				url: link
			}
		);
	}
	else {
		browser.tabs.create({
			active: true,
			url: link
		});
	}
}