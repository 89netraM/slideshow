interface ExtensionLink {
	link: string;
	isApplicable: (agent: string) => boolean;
};

const extensionLinks: Array<ExtensionLink> = [
	{
		link: "https://microsoftedge.microsoft.com/addons/detail/slideshow/dcomcnbndleoefogapclcifaiediodfh",
		isApplicable: agent => {
			return /Edg\//.test(agent);
		}
	},
	{
		link: "https://addons.mozilla.org/en-US/firefox/addon/%C3%A5sberg-slideshow/",
		isApplicable: agent => {
			return /Firefox/.test(agent);
		}
	}
];

export function openExtensionLink(): boolean {
	const agent = navigator.userAgent;
	for (const extensionLink of extensionLinks) {
		if (extensionLink.isApplicable(agent)) {
			window.open(extensionLink.link, "_blank");
			return true;
		}
	}

	return false;
};