import { commify } from "@orderly.network/utils";
import { BasePaint, drawOptions, layoutInfo } from "./basePaint";
import { path } from "ramda";

export class DataPaint extends BasePaint {
  private positionInfoCellWidth = 100;

  private DEFAULT_PROFIT_COLOR = "rgb(0,181,159)";
  private DEFAULT_LOSE_COLOR = "rgb(255,103,194)";

  async draw(options: drawOptions) {
    const isDrawDetails =
      Array.isArray(options.data?.position?.informations) &&
      options.data?.position?.informations.length > 0;

    const offsetTop = 50;

    if (!!options.data?.message) {
      this.drawMessage(options);
    }

    if (!!options.data?.position) {
      this.drawPosition(options, isDrawDetails ? 0 : offsetTop);
    }

    if (
      Array.isArray(options.data?.position?.informations) &&
      options.data?.position?.informations.length > 0
    ) {
      this.drawInformations(options);
    }

    this.drawUnrealizedPnL(options, isDrawDetails ? 0 : offsetTop);

    if (!!options.data?.domain) {
      this.drawDomainUrl(options);
    }

    if (typeof options.data?.updateTime !== "undefined") {
      this.drawPositionTime(options);
    }
  }

  private drawMessage(options: drawOptions) {
    // console.log("draw message", options);

    const layout = path<layoutInfo>(
      ["layout", "message"],
      options
    ) as layoutInfo;
    const { position } = layout;

    this._drawText(`"${options.data?.message!}"`, {
      color: layout.color,
      fontSize: this._ratio(layout.fontSize as number),
      top: this._ratio(position.top!),
      left: this._ratio(position.left!),
      textBaseline: "top",
      fontFamily: options.fontFamily,
    });
  }
  private drawPosition(options: drawOptions, offsetTop: number = 0) {
    const layout = path<layoutInfo>(
      ["layout", "position"],
      options
    ) as layoutInfo;
    const { position } = layout;
    let left = this._ratio(position.left!);
    let top = position.top! + offsetTop;
    let prevElementBoundingBox: TextMetrics = {} as TextMetrics;

    // draw position side;

    if (typeof options.data?.position.side !== "undefined") {
      prevElementBoundingBox = this._drawText(options.data.position.side, {
        color:
          options.data?.position.side === "LONG"
            ? this.DEFAULT_PROFIT_COLOR
            : this.DEFAULT_LOSE_COLOR,
        left,
        top: this._ratio(top),
        fontSize: this._ratio(14),
        fontFamily: options.fontFamily,
      });
    }

    if (typeof options.data?.position.symbol !== "undefined") {
      left += (prevElementBoundingBox.width ?? 0) + this._ratio(7);

      if (prevElementBoundingBox.width) {
        prevElementBoundingBox = this._drawText("|", {
          color: "rgba(255,255,255,0.2)",
          left,
          top: this._ratio(top),
          fontSize: this._ratio(12),
          fontFamily: options.fontFamily,
        });
      }

      left += (prevElementBoundingBox.width ?? 0) + this._ratio(7);
      prevElementBoundingBox = this._drawText(options.data?.position.symbol!, {
        color: "rgba(255,255,255,0.98)",
        left: left,
        top: this._ratio(top),
        fontSize: this._ratio(12),
        fontFamily: options.fontFamily,
      });
    }

    if (typeof options.data?.position.leverage !== "undefined") {
      left += (prevElementBoundingBox.width ?? 0) + this._ratio(7);

      if (prevElementBoundingBox.width) {
        prevElementBoundingBox = this._drawText("|", {
          color: "rgba(255,255,255,0.2)",
          left,
          top: this._ratio(top),
          fontSize: this._ratio(12),
          fontFamily: options.fontFamily,
        });
      }
      left += (prevElementBoundingBox.width ?? 0) + this._ratio(7);
      prevElementBoundingBox = this._drawText(
        `${options.data?.position.leverage}X`,
        {
          color: "rgba(255,255,255,0.98)",
          left,
          top: this._ratio(top),
          fontSize: this._ratio(12),
          fontFamily: options.fontFamily,
        }
      );
    }
  }

  private drawUnrealizedPnL(options: drawOptions, offsetTop: number = 0) {
    // reset left value;
    const layout = path<layoutInfo>(
      ["layout", "unrealizedPnl"],
      options
    ) as layoutInfo;
    const { position } = layout;
    let left = this._ratio(position.left!);
    let prevElementBoundingBox: TextMetrics = {} as TextMetrics;

    const top = (position.top ?? 0) + offsetTop;

    // ROI
    if (typeof options.data?.position.ROI !== "undefined") {
      const prefix = options.data?.position.ROI! > 0 ? "+" : "";
      prevElementBoundingBox = this._drawText(
        `${prefix}${commify(options.data?.position.ROI)}%`,
        {
          color:
            prefix === "+"
              ? options.profitColor || this.DEFAULT_PROFIT_COLOR
              : options.loseColor || this.DEFAULT_LOSE_COLOR,
          left,
          top: this._ratio(top),

          fontSize: this._ratio(layout.fontSize as number),
          fontWeight: 700,
          fontFamily: options.fontFamily,
        }
      );
    }
    // unrelPnL
    if (typeof options.data?.position.pnl !== "undefined") {
      const prefix = options.data?.position.pnl! > 0 ? "+" : "";
      let text = `${prefix}${commify(options.data?.position.pnl)} ${
        options.data?.position.currency
      }`;

      if (prevElementBoundingBox.width) {
        left += (prevElementBoundingBox.width ?? 0) + this._ratio(8);
        text = `(${text})`;
      } else {
        left = this._ratio(position.left!);
      }

      prevElementBoundingBox = this._drawText(text, {
        color: "rgba(255,255,255,0.5)",
        left,
        top: this._ratio(top),
        fontSize: this._ratio((layout.fontSize as number) * 0.6),
        fontWeight: 600,
        fontFamily: options.fontFamily,
      });
    }
  }

  private drawInformations(options: drawOptions) {
    const layout = path<layoutInfo>(
      ["layout", "informations"],
      options
    ) as layoutInfo;
    const { position } = layout;

    const isVertical = (options.data?.position.informations.length ?? 0) === 2;

    options.data?.position.informations.forEach((info, index) => {
      // let cellWidth = this.positionInfoCellWidth;
      let left =
        position.left! + this.positionInfoCellWidth * Math.floor(index / 2);
      let top = (position.top as number) + (index % 2) * 40;

      // if (isVertical && index === 1) {
      //   left = position.left!;
      //   top = (position.top as number) + index * 40;
      // }

      this._drawText(info.title, {
        left: this._ratio(left),
        top: this._ratio(top),
        fontSize: this._ratio(10),
        color: "rgba(255,255,255,0.2)",
        fontFamily: options.fontFamily,
      });
      this._drawText(info.value, {
        left: this._ratio(left),
        top: this._ratio(top + 17),
        fontSize: this._ratio(layout.fontSize as number),
        fontWeight: 500,
        color: layout.color as string,
        fontFamily: options.fontFamily,
      });
    });
  }

  private drawDomainUrl(options: drawOptions) {
    const layout = path<layoutInfo>(
      ["layout", "domain"],
      options
    ) as layoutInfo;
    const { position } = layout;
    const top = this.painter.height - position.bottom!;

    this._drawText(options.data?.domain!, {
      left: this._ratio(position.left!),
      top: this._ratio(top),
      fontSize: this._ratio(layout.fontSize as number),
      color: options.brandColor ?? this.DEFAULT_PROFIT_COLOR,
      fontFamily: options.fontFamily,
    });
  }

  private drawPositionTime(options: drawOptions) {
    const layout = path<layoutInfo>(
      ["layout", "updateTime"],
      options
    ) as layoutInfo;
    const { position } = layout;
    const top = this.painter.height - position.bottom!;
    const left = this.painter.width - position.right!;

    this._drawText(options.data?.updateTime!, {
      left: this._ratio(left),
      top: this._ratio(top),
      fontSize: this._ratio(layout.fontSize as number),
      color: layout.color as string,
      textAlign: "end",
      fontFamily: options.fontFamily,
    });
  }

  private _drawText(
    str: string,
    options?: {
      left?: number;
      top?: number;
      fontSize?: number;
      fontFamily?: string;
      fontWeight?: number;
      color?: string;
      textBaseline?: CanvasTextBaseline;
      textAlign?: CanvasTextAlign;
    }
  ): TextMetrics {
    let boundingBox: TextMetrics;
    const {
      left = 30,
      top = 30,
      fontSize = 13,
      fontWeight = 500,
      color = "black",
      textBaseline = "middle",
      textAlign = "start",
    } = options ?? {};

    console.log("draw text", str, options);

    this.ctx.save();
    // "Nunito Sans",-apple-system,"San Francisco",BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Helvetica,Arial,sans-serif
    this.ctx.font = `${fontWeight} ${fontSize}px ${options?.fontFamily}`;
    this.ctx.fillStyle = color;
    this.ctx.textBaseline = textBaseline;
    this.ctx.textAlign = textAlign;
    boundingBox = this.ctx.measureText(str);

    this.ctx.fillText(str, left, top);
    this.ctx.restore();

    return boundingBox;
  }

  private _ratio(num: number) {
    return num * this.painter.ratio;
  }
}
