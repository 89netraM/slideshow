import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
	selector: "app-image",
	templateUrl: "./image.component.html",
	styleUrls: ["./image.component.scss"]
})
export class ImageComponent {
	public _imageURL: string;
	@Input()
	public get imageURL(): string {
		return this._imageURL;
	}
	public set imageURL(value: string) {
		this._imageURL = value;

		if (/\.(png|jpg|jpeg|gif)(\?.*)?$/i.test(value)) {
			this.imageType = ImageType.Image;
		}
		else if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(value) ||
		         /^https?:\/\/v.redd.it/i.test(value)) {
			this.imageType = ImageType.Video;
		}
	}
	@Input()
	public title?: string;
	@Input()
	public description?: string;

	@Input()
	private sourceURL?: string;

	public imageType: ImageType;

	@Input()
	public showText: boolean;

	@Input()
	public near: boolean;

	private _active: boolean = false;
	@Input()
	public get active(): boolean {
		return this._active;
	}
	public set active(value: boolean) {
		if (this._active !== value) {
			if (value) {
				this.activate();
			}
			else {
				this.deactivate();
			}
		}

		this._active = value;
	}

	public zoom: number = 0;

	@ViewChild("imageElement")
	private imageElement: ElementRef<HTMLImageElement>;

	@ViewChild("videoElement")
	private videoElement: ElementRef<HTMLVideoElement>;

	// tslint:disable-next-line:no-output-rename
	@Output("error")
	public errorEvent: EventEmitter<{ sender: ImageComponent }> = new EventEmitter();

	constructor(private sanitizer: DomSanitizer) { }

	public imageError(e: UIEvent): void {
		this.errorEvent.emit({
			sender: this
		});
	}

	public onScroll(e: WheelEvent): void {
		if (this.zoom !== 0) {
			e.stopPropagation();
		}
	}

	public activate(): void {
		//TODO: Do stuff!
	}
	public deactivate(): void {
		this.zoom = 0;
	}

	public toggleZoom(): void {
		switch (this.zoom) {
			case 0:
				this.zoom = 1;
				break;
			case 1:
				if (this.imageElement.nativeElement.naturalWidth >= document.body.getBoundingClientRect().width) {
					this.zoom = 2;
					break;
				}
			default:
				this.zoom = 0;
				break;
		}
	}
	public canZoom(): boolean {
		switch (this.zoom) {
			case 0:
				return true;
			case 1:
				if (this.imageElement.nativeElement.naturalWidth >= document.body.getBoundingClientRect().width) {
					return true;
				}
			default:
				return false;
		}
	}
}

enum ImageType {
	Image = "Image",
	Video = "Video"
}