import { Component, HostListener, ViewChild, ElementRef, HostBinding, OnInit } from "@angular/core";
import { ImageService, Image } from "./image-service/image.service";
import { ImageComponent } from "./image/image.component";
import { openExtensionLink } from "./extension-opener/extension-opener";

@Component({
	//tslint:disable-next-line:component-selector
	selector: "body",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
	public showControls: boolean = true;
	public showInfo: boolean = false;
	public showText: boolean = false;

	public URL: string;
	public images: Array<Image>;
	@HostBinding("class.infinit")
	public isInfinit: boolean = false;
	private loadingImagesFor: number = 0;

	@ViewChild("imageArea")
	private imageArea: ElementRef;
	public get imageAreaScroll(): number {
		return Math.round(this.imageArea.nativeElement.scrollLeft / this.imageArea.nativeElement.offsetWidth);
	}
	public set imageAreaScroll(value: number) {
		this.imageArea.nativeElement.scrollLeft = this.imageArea.nativeElement.offsetWidth * value;

		if (this.images && this.images.length > 0) {
			this.pageNumber = this.imageAreaScroll + 1;
		}
		else {
			this.pageNumber = 0;
		}

		this.shouldLoadMoreImages();
	}

	public pageNumber: number = 0;

	public get isTouch(): boolean {
		return "ontouchstart" in document.documentElement;
	}

	constructor(public imageService: ImageService) { }

	public ngOnInit(): void {
		const matches = window.location.href.match(/link=(.*?)(?=&|$)/);
		if (matches != null && matches.length > 1) {
			const initLink = decodeURIComponent(matches[1]);
			if (initLink != null) {
				this.URL = initLink;
				this.loadURL(this.URL);
			}
		}
	}

	public async loadURL(URL: string): Promise<void> {
		this.images = await this.imageService.getAlbum(URL);
		if (this.images != null) {
			this.isInfinit = this.imageService.isURLInfinit(URL);

			this.imageAreaScroll = 0;

			this.showControls = false;
		}
	}

	private shouldLoadMoreImages(): void {
		if (this.images && this.imageAreaScroll === this.images.length - 1) {
			this.loadMoreImages();
		}
	}
	private async loadMoreImages(): Promise<void> {
		if (this.isInfinit && this.images && this.loadingImagesFor !== this.images.length - 1) {
			this.loadingImagesFor = this.images.length - 1;

			const newImages: Array<Image> = await this.imageService.getAlbum(this.URL, { item: this.images[this.images.length - 1], index: this.images.length - 1});
			this.images = this.images.concat(newImages);
		}
	}

	public isNear(index: number): boolean {
		return Math.abs(index - this.imageAreaScroll) < 2;
	}

	public removeFailure(failure: ImageComponent) {
		if (this.images) {
			this.images = this.images.filter(x => x.imageURL !== failure.imageURL);
		}
	}

	@HostListener("keydown", ["$event.keyCode"])
	public keyDown(keyCode: number): void {
		if (!this.isTouch) {
			switch (keyCode) {
				case 37:
				case 65:
					//Left
				case 38:
				case 87:
					//Up
					this.imageAreaScroll--;
					break;
				case 39:
				case 68:
					//Right
				case 40:
				case 83:
					//Down
					this.imageAreaScroll++;
					break;
			}
		}
	}
	@HostListener("body:wheel", ["$event"])
	public wheel(event: WheelEvent): void {
		if (!this.isTouch) {
			if (event.wheelDelta < 0) {
				this.imageAreaScroll++;
			}
			else {
				this.imageAreaScroll--;
			}
		}
	}
	public scroll(event: UIEvent): void {
		this.pageNumber = this.imageAreaScroll + 1;

		this.shouldLoadMoreImages();
	}

	public openExtensionPage(): void {
		const success = openExtensionLink();

		if (!success) {
			alert("The extension isn't available to your browser.");
		}
	}
}