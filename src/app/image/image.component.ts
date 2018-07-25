import { Component, Input } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
	selector: "app-image",
	templateUrl: "./image.component.html",
	styleUrls: ["./image.component.scss"]
})
export class ImageComponent {
	@Input()
	public imageURL: string;
	@Input()
	public title?: string;
	@Input()
	public description?: string;
	@Input()
	public sourceURL?: string;

	@Input()
	public showText: boolean;

	constructor(private sanitizer: DomSanitizer) { }

	public imageType(): ImageType {
		if (/\.(png|jpg|jpeg|gif)$/i.test(this.imageURL)) {
			return ImageType.Image;
		}
		else if (/\.(mp4|webm|ogg)$/i.test(this.imageURL) ||
		         /^https?:\/\/v.redd.it/i.test(this.imageURL)) {
			return ImageType.Video;
		}
	}
}

enum ImageType {
	Image = "Image",
	Video = "Video"
}