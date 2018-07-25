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
		imgur.URLChecker = /https?:\/\/imgur\.com\/(?:a|gallery)\/(\w{5,})/;
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
		const reddit = new ImageGenerator("Reddit", ["https://www.reddit.com/r/aww/", "https://www.reddit.com/r/aww/top/?t=all", "https://www.reddit.com/user/bgiuseg8"]);
		reddit.URLChecker = /^https?:\/\/(?:www\.)?reddit.com\/((r|u|(user))\/\w+(\/\w+)*)\/?(\?(&?\w+=\w+)+)?/i;
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

	constructor(site: string, examples: Array<string>|string) {
		this.site = site;
		if (examples instanceof Array) {
			this.examples = examples;
		}
		else {
			this.examples = [examples];
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