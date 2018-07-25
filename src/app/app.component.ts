import { Component, HostListener, ViewChild, ElementRef, HostBinding } from "@angular/core";
import { ImageService, Image } from "./image-service/image.service";

@Component({
	//tslint:disable-next-line:component-selector
	selector: "body",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"]
})
export class AppComponent {
	public showControls: boolean = true;
	public showInfo: boolean = false;
	public showText: boolean = false;

	public URL: string;
	public images: Array<Image> = new Array<Image>();
	@HostBinding("class.infinit")
	public infinit: boolean = false;
	private loadingImagesFor: number = 0;

	@ViewChild("imageArea")
	private imageArea: ElementRef;
	public get imageAreaScroll(): number {
		return Math.round(this.imageArea.nativeElement.scrollLeft / this.imageArea.nativeElement.offsetWidth);
	}
	public set imageAreaScroll(value: number) {
		this.imageArea.nativeElement.scrollLeft = this.imageArea.nativeElement.offsetWidth * value;
		this.pageNumber = this.imageAreaScroll + 1;

		this.shouldLoadMoreImages();
	}

	public pageNumber: number = 0;

	public get isTouch(): boolean {
		return "ontouchstart" in document.documentElement;
	}

	constructor(public imageService: ImageService) { }

	public async loadURL(URL: string): Promise<void> {
		this.images = await this.imageService.getAlbum(URL);
		this.infinit = this.imageService.isURLInfinit(URL);
		this.pageNumber = 1;

		if (!this.isTouch) {
			this.showControls = false;
		}
	}

	private shouldLoadMoreImages(): void {
		if (this.imageAreaScroll === this.images.length - 1) {
			this.loadMoreImages();
		}
	}
	private async loadMoreImages(): Promise<void> {
		if (this.infinit && this.loadingImagesFor !== this.images.length - 1) {
			this.loadingImagesFor = this.images.length - 1;

			const newImages: Array<Image> = await this.imageService.getAlbum(this.URL, { item: this.images[this.images.length - 1], index: this.images.length - 1});
			this.images = this.images.concat(newImages);
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
}