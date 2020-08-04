import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
	providedIn: "root"
})
export class ImageService {
	public generators: Array<ImageGenerator> = new Array<ImageGenerator>();

	constructor(private http: HttpClient) {
		//#region Imgur
		const imgur = new ImageGenerator("Imgur", ["https://imgur.com/a/Ook7s", "https://imgur.com/gallery/bkChX"]);
		imgur.URLChecker = /(?:https?:\/\/)?imgur\.com\/(?:a|gallery)\/(\w{5,})/;
		imgur.infiniti = false;
		imgur.getImages = async (URL: string) => {
			const imgurClientID = "4805aaeb12200a0";

			const regexResults: RegExpExecArray = imgur.URLChecker.exec(URL);
			if (regexResults.length === 2) {
				const json = await this.http.get<any>(
					`https://api.imgur.com/3/album/${regexResults[1]}/images`,
					{
						headers: {
							"authorization": `Client-ID ${imgurClientID}`
						}
					}
				).toPromise();

				if (json.success === true && json.data.length > 0) {
					const images: Array<Image> = new Array<Image>();

					for (const imgurImage of json.data) {
						let imageURL: string;
						if (imgurImage.animated) {
							if (imgurImage.mp4 !== "") {
								imageURL = imgurImage.mp4;
							}
							else {
								imageURL = imgurImage.gifv.replace(".gifv", ".mp4");
							}
						}
						else {
							imageURL = imgurImage.link;
						}

						images.push(new Image(
							imgurImage.id,
							imageURL,
							imgurImage.title,
							imgurImage.description
						));
					}

					return images;
				}
				else {
					throw new Error("No response");
				}
			}
			else {
				throw new TypeError("Malformatted URL");
			}
		};
		this.generators.push(imgur);
		//#endregion
		//#region Reddit
		const reddit = new ImageGenerator("Reddit", ["https://www.reddit.com/r/aww/", "https://old.reddit.com/r/aww/top/?t=all", "https://reddit.com/user/bgiuseg8"]);
		reddit.URLChecker = /^(?:https?:\/\/)?(?:www\.|old\.|new\.)?reddit.com\/((r|u|(user))\/\w+(\/\w+)*)\/?(\?(&?\w+=\w+)+)?/i;
		reddit.infiniti = true;
		reddit.getImages = async (URL: string, after?: { item: Image, index: number }) => {
			if (reddit.URLChecker.test(URL)) {
				let apiURL: string = URL.replace(reddit.URLChecker, "https://www.reddit.com/$1.json$6");
				if (after != null) {
					apiURL += URL.indexOf("?") !== -1 ? "&" : "?" + "after=" + after.item.id;
				}

				const json = await this.http.get<any>(
					apiURL,
					{
						withCredentials: false
					}
				).toPromise();
				if (json.data.children.length > 0) {
					const images: Array<Image> = new Array<Image>();

					for (const redditImage of json.data.children) {
						if (redditImage.data.url != null) {
							let imageURL = null;

							if (/(\.png)|(\.jpg)|(\.gif)$/.test(redditImage.data.url)) {
								imageURL = redditImage.data.url;
							}
							else if (/\.gifv$/.test(redditImage.data.url)) {
								imageURL = redditImage.data.url.replace(".gifv", ".mp4");
							}
							else if (/^https?:\/\/(www\.)?imgur\.com\/(\w){5,7}(\/)?$/.test(redditImage.data.url)) {
								imageURL = redditImage.data.url + ".jpg";
							}
							else if (/^(https?:\/\/)(gfycat\.com\/(gifs\/detail\/)?\w+)$/.test(redditImage.data.url)) {
								imageURL = redditImage.data.preview.reddit_video_preview.fallback_url;
							}
							else if (/(^https?:\/\/(www\.)?instagram\.com\/p\/\w+)(\/)?$/.test(redditImage.data.url)) {
								imageURL = redditImage.data.url.replace(/(^https?:\/\/(www\.)?instagram\.com\/p\/\w+)(\/)?$/, "$1/media?size=l");
							}
							else if (imgur.URLChecker.test(redditImage.data.url)) {
								const imgurImages = await imgur.getImages(redditImage.data.url);

								if (imgurImages.length === 1) {
									imageURL = imgurImages[0].imageURL;
								}
							}

							if (imageURL !== null) {
								images.push(new Image(
									redditImage.data.name,
									imageURL,
									redditImage.data.title,
									null,
									redditImage.data.permalink
								));
							}
						}
					}

					return images;
				}
				else {
					throw new Error("No response");
				}
			}
			else {
				throw new Error("Malformatted URL");
			}
		};
		this.generators.push(reddit);
		//#endregion
		//#region Reddit Gallery
		const redditGallery = new ImageGenerator("Reddit Gallery", ["https://www.reddit.com/gallery/hrrh23"]);
		redditGallery.URLChecker = /^(?:https?:\/\/)?(?:www\.|old\.|new\.)?reddit\.com\/gallery\/(\w+)\/?$/i;
		redditGallery.infiniti = false;
		redditGallery.getImages = async (URL: string, after?: { item: Image, index: number }) => {
			const matches = redditGallery.URLChecker.exec(URL);
			if (matches.length > 1) {
				const id = matches[1];
				
				const json = await this.http.get<any>(`https://www.reddit.com/${id}.json`).toPromise();
				try {
					const items: Array<{ caption: string, media_id: string }> = json[0].data.children[0].data.gallery_data.items;

					return items.map(i => new Image(
						i.media_id,
						`https://i.redd.it/${i.media_id}.jpg`,
						null,
						i.caption,
						null
					));
				}
				catch {
					throw new Error("No response");
				}
			}
			else {
				throw new Error("Malformatted URL");
			}
		};
		this.generators.push(redditGallery);
		//#endregion
	}

	public async getAlbum(URL: string, after?: { item: Image, index: number }): Promise<Array<Image>> {
		for (const generator of this.generators) {
			if (generator.URLChecker.test(URL)) {
				return await generator.getImages(URL, after);
			}
		}
	}

	public isURLInfinit(URL: string): boolean {
		for (const generator of this.generators) {
			if (generator.URLChecker.test(URL)) {
				return generator.infiniti;
			}
		}
	}
}

export class ImageGenerator {
	public site: string;
	public examples: Array<string>;
	public URLChecker: RegExp;
	public infiniti: boolean;
	public showExample: boolean;

	constructor(site: string, examples: Array<string>|string = null) {
		this.site = site;

		if (examples !== null) {
			if (examples instanceof Array) {
				this.examples = examples;
			}
			else {
				this.examples = [examples];
			}
			this.showExample = true;
		}
		else {
			this.showExample = false;
		}
	}

	public getImages: (url: string, after?: { item: Image, index: number }) => Promise<Array<Image>>;
}

export class Image {
	public constructor(public readonly id: any,
	                   public readonly imageURL: string,
	                   public readonly title?: string,
	                   public readonly description?: string,
	                   public readonly sourceURL?: string) { }
}