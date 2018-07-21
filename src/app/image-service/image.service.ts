import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
	providedIn: "root"
})
export class ImageService {
	public static generators: Array<ImageGenerator> = new Array<ImageGenerator>();

	constructor(private http: HttpClient) {
		const imgur = new ImageGenerator("Imgur", ["https://imgur.com/a/Ook7s", "https://imgur.com/gallery/bkChX"]);
		imgur.URLChecker = /https?:\/\/imgur\.com\/(?:a|gallery)\/(\w{5,})/;
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
		ImageService.generators.push(imgur);
	}

	public async getAlbum(URL: string): Promise<Array<Image>> {
		for (const generator of ImageService.generators) {
			if (generator.URLChecker.test(URL)) {
				return await generator.getImages(URL);
			}
		}
	}
}

export class ImageGenerator {
	public site: string;
	public examples: Array<string>;
	public URLChecker: RegExp;

	constructor(site: string, examples: Array<string>|string) {
		this.site = site;
		if (examples instanceof Array) {
			this.examples = examples;
		}
		else {
			this.examples = [examples];
		}
	}

	public getImages: (url: string) => Promise<Array<Image>>;
}

export class Image {
	public constructor(public readonly imageURL: string,
	                   public readonly title?: string,
	                   public readonly description?: string,
	                   public readonly sourceURL?: string) { }
}