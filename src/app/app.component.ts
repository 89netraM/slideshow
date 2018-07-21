import { Component, OnInit } from "@angular/core";
import { ImageService, Image } from "./image-service/image.service";

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

	public get isMobile(): boolean {
		return "ontouchstart" in document.documentElement;
	}

	public URL: string;
	public images: Array<Image>;

	constructor(private imageService: ImageService) {}

	public ngOnInit(): void {
		this.loadURL("https://imgur.com/gallery/lDSwT");
	}

	public async loadURL(URL: string): Promise<void> {
		this.images = await this.imageService.getAlbum(URL);

		if (!this.isMobile) {
			this.showControls = false;
		}
	}
}