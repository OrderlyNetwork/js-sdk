import { BackgroundPaint } from "./backgroundPaint";
import { drawOptions } from "./basePaint";
import { DataPaint } from "./dataPaint";
export class PosterPainter {
  private ctx: CanvasRenderingContext2D;
  width: number = 0;
  height: number = 0;
  ratio: number = 1;
  // resourceManager: Resource;
  constructor(private canvas: HTMLCanvasElement) {
    // console.log("PosterPainter constructor");

    this.ctx = this.canvas.getContext("2d")!;

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.ratio = Math.floor(window.devicePixelRatio) || 1;

    console.log("this ratio", this.ratio);

    // render to high resolution
    this.canvas.width = this.width * this.ratio;
    this.canvas.height = this.height * this.ratio;
    this.canvas.style.width = this.width + "px";
    this.canvas.style.height = this.height + "px";

    //
  }

  draw(options: drawOptions) {
    requestAnimationFrame(() => this._draw.bind(this)(options));
  }

  async _draw(options: drawOptions) {
    if (this.ctx === null) return;
    console.log("============ DRAW ============");
    // this.ctx.clearRect(0, 0, this.width * this.ratio, this.height * this.ratio);
    // start draw
    // background
    await new BackgroundPaint(this.ctx, this).draw(options);
    // data paint
    await new DataPaint(this.ctx, this).draw(options);
  }
}
