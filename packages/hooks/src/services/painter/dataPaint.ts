import { commify } from "@orderly.network/utils";
import { BasePaint, DrawOptions, layoutInfo } from "./basePaint";
import { path } from "ramda";

export class DataPaint extends BasePaint {
  private positionInfoCellWidth = 110;

  private DEFAULT_PROFIT_COLOR = "rgb(0,181,159)";
  private DEFAULT_LOSE_COLOR = "rgb(255,103,194)";

  private transformTop = 0;

  async draw(options: DrawOptions) {
    const needDrawDetails =
      Array.isArray(options.data?.position?.informations) &&
      (options.data?.position?.informations?.length ?? 0) > 0;

    const hasMessage = !!options.data?.message;

    this.transformTop = hasMessage ? 0 : needDrawDetails ? -40 : -150;

    // If position details are not displayed, the position PNL information will be margin
    const offsetTop = hasMessage ? 50 : 100;
    // const offsetMessage = hasMessage ? 0 : -50;

    if (!!options.data?.message) {
      this.drawMessage(options);
    }

    if (!!options.data?.position) {
      this.drawPosition(options, needDrawDetails ? 0 : offsetTop);
    }

    if (needDrawDetails) {
      this.drawInformations(options);
    }

    this.drawUnrealizedPnL(options, needDrawDetails ? 0 : offsetTop);

    if (!!options.data?.domain) {
      this.drawDomainUrl(options);
    }

    if (typeof options.data?.updateTime !== "undefined") {
      this.drawPositionTime(options);
    }
  }

  private drawMessage(options: DrawOptions) {
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
  private drawPosition(options: DrawOptions, offsetTop: number = 0) {
    const layout = path<layoutInfo>(
      ["layout", "position"],
      options
    ) as layoutInfo;
    const { position } = layout;
    let left = this._ratio(position.left!);

    let top = layout.position.top! + offsetTop + this.transformTop;
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
        color: layout.color,
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
          color: layout.color,
          left,
          top: this._ratio(top),
          fontSize: this._ratio(12),
          fontFamily: options.fontFamily,
        }
      );
    }
  }

  private drawUnrealizedPnL(options: DrawOptions, offsetTop: number = 0) {
    // reset left value;
    const layout = path<layoutInfo>(
      ["layout", "unrealizedPnl"],
      options
    ) as layoutInfo & {
      secondaryColor: string;
    };
    const { position } = layout;
    let left = this._ratio(position.left!);
    let prevElementBoundingBox: TextMetrics = {} as TextMetrics;

    const top = (position.top ?? 0) + offsetTop + this.transformTop;

    // ROI
    if (typeof options.data?.position.ROI !== "undefined") {
      const prefix = options.data?.position.ROI! > 0 ? "+" : "";
      prevElementBoundingBox = this._drawText(
        `${prefix}${commify(options.data?.position.ROI)}%`,
        {
          color:
            prefix === "+"
              ? options.profitColor || this.DEFAULT_PROFIT_COLOR
              : options.lossColor || this.DEFAULT_LOSE_COLOR,
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

      const color =
        typeof options.data.position.ROI === "undefined"
          ? prefix === "+"
            ? options.profitColor || this.DEFAULT_PROFIT_COLOR
            : options.lossColor || this.DEFAULT_LOSE_COLOR
          : layout.secondaryColor;

      const fontSize =
        typeof options.data.position.ROI === "undefined"
          ? this._ratio(layout.fontSize as number)
          : this._ratio((layout.fontSize as number) * 0.6);

      prevElementBoundingBox = this._drawText(text, {
        color,
        left,
        top: this._ratio(top),
        fontSize,
        fontWeight: 600,
        fontFamily: options.fontFamily,
      });
    }
  }

  private drawInformations(options: DrawOptions) {
    const layout = path<layoutInfo>(
      ["layout", "informations"],
      options
    ) as layoutInfo & {
      labelColor?: string;
    };
    const { position } = layout;

    const isVertical = (options.data?.position.informations.length ?? 0) === 2;

    options.data?.position.informations.forEach((info, index) => {
      // let cellWidth = this.positionInfoCellWidth;
      let left =
        position.left! + this.positionInfoCellWidth * Math.floor(index / 2);
      let top = (position.top as number) + (index % 2) * 38 + this.transformTop;

      this._drawText(info.title, {
        left: this._ratio(left),
        top: this._ratio(top),
        fontSize: this._ratio(10),
        color: layout.labelColor,
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

  private drawDomainUrl(options: DrawOptions) {
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

  private drawPositionTime(options: DrawOptions) {
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
