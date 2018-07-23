import { Component, HostListener, ViewChild, ElementRef } from "@angular/core";
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

	@ViewChild("imageArea")
	private imageArea: ElementRef;
	public get imageAreaScroll(): number {
		return Math.round(this.imageArea.nativeElement.scrollLeft / this.imageArea.nativeElement.offsetWidth);
	}
	public set imageAreaScroll(value: number) {
		this.imageArea.nativeElement.scrollLeft = this.imageArea.nativeElement.offsetWidth * value;
	}

	public pageNumber: number;
	public get pageIndicator(): number {
		return this.images.length > 0 ? this.imageAreaScroll + 1 : 0;
	}
	public set pageIndicator(value: number) {
		this.pageNumber = value - 1;
	}

	public get isTouch(): boolean {
		return "ontouchstart" in document.documentElement;
	}

	constructor(private imageService: ImageService) { }

	public async loadURL(URL: string): Promise<void> {
		this.images = await this.imageService.getAlbum(URL);

		if (!this.isTouch) {
			this.showControls = false;
		}
	}

	@HostListener("keydown", ["$event.keyCode"])
	public keyDown(keyCode: number): void {
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

	@HostListener("body:wheel", ["$event"])
	public scroll(event: WheelEvent): void {
		if (event.wheelDelta < 0) {
			this.imageAreaScroll++;
		}
		else {
			this.imageAreaScroll--;
		}
	}
}