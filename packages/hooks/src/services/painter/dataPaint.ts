import { commify } from "@orderly.network/utils";
import { BasePaint, DrawOptions, layoutInfo } from "./basePaint";
import { path } from "ramda";
import { qrPaint } from "./qrPaint";

export class DataPaint extends BasePaint {
  private positionInfoCellWidth = 110;

  private DEFAULT_PROFIT_COLOR = "rgb(0,181,159)";
  private DEFAULT_LOSS_COLOR = "rgb(255,103,194)";

  private transformTop = 0;

  private QRCODE_SIZE = 56;

  async draw(options: DrawOptions) {
    const needDrawDetails =
      Array.isArray(options.data?.position?.informations) &&
      (options.data?.position?.informations?.length ?? 0) > 0;

    const hasReferral = this.hasReferral(options);

    // const hasMessage = !!options.data?.message;
    const hasMessage = true;

    this.transformTop = hasMessage ? 0 : needDrawDetails ? -40 : -150;

    // If position details are not displayed, the position PNL information will be margin
    // const offsetTop = hasMessage ? 50 : 100;
    const offsetTop = 0; // 100;
    // const offsetMessage = hasMessage ? 0 : -50;

    if (!!options.data?.message) {
      this.drawMessage(options);
    }

    if (!!options.data?.position) {
      this.drawPosition(
        options,
        needDrawDetails || hasReferral ? 0 : offsetTop
      );
    }

    if (needDrawDetails) {
      this.drawInformations(options);
    }

    this.drawUnrealizedPnL(
      options,
      needDrawDetails || hasReferral ? 0 : offsetTop
    );

    if (!hasReferral) {
      if (!!options.data?.domain) {
        this.drawDomainUrl(options);
      }

      if (typeof options.data?.updateTime !== "undefined") {
        this.drawPositionTime(options);
      }
    }

    if (typeof options.data?.referral !== "undefined") {
      this.drawReferralCode(options);
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
    const { position, fontSize = 14 } = layout;
    let left = this._ratio(position.left!);

    let top = layout.position.top! + offsetTop + this.transformTop;
    let prevElementBoundingBox: TextMetrics = {} as TextMetrics;

    // draw position side;

    if (typeof options.data?.position.side !== "undefined") {
      prevElementBoundingBox = this._drawText(options.data.position.side, {
        color:
          options.data?.position.side.toUpperCase() === "LONG"
            ? this.DEFAULT_PROFIT_COLOR
            : this.DEFAULT_LOSS_COLOR,
        left,
        top: this._ratio(top),
        fontSize: this._ratio(fontSize),
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
          fontSize: this._ratio(fontSize),
          fontFamily: options.fontFamily,
        });
      }

      left += (prevElementBoundingBox.width ?? 0) + this._ratio(7);
      prevElementBoundingBox = this._drawText(options.data?.position.symbol!, {
        color: layout.color,
        left: left,
        top: this._ratio(top),
        fontSize: this._ratio(fontSize),
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
          fontSize: this._ratio(fontSize),
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
          fontSize: this._ratio(fontSize),
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
      secondaryFontSize: number;
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
              : options.lossColor || this.DEFAULT_LOSS_COLOR,
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
      const prefix = options.data?.position.pnl! >= 0 ? "+" : "";
      let text = `${prefix}${commify(options.data?.position.pnl)} ${
        options.data?.position.currency
      }`;
      let fontWeight = 600;

      if (prevElementBoundingBox.width) {
        left += (prevElementBoundingBox.width ?? 0) + this._ratio(8);
        text = `(${text})`;
      } else {
        left = this._ratio(position.left!);
        fontWeight = 700;
      }

      const color =
        typeof options.data.position.ROI === "undefined"
          ? prefix === "+"
            ? options.profitColor || this.DEFAULT_PROFIT_COLOR
            : options.lossColor || this.DEFAULT_LOSS_COLOR
          : layout.secondaryColor;

      const fontSize =
        typeof options.data.position.ROI === "undefined"
          ? this._ratio(layout.fontSize as number)
          : this._ratio(layout.secondaryFontSize as number);

      prevElementBoundingBox = this._drawText(text, {
        color,
        left,
        top: this._ratio(top),
        fontSize,
        fontWeight,
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
      let left = position.left! + (index % 2) * this.positionInfoCellWidth;
      // let top = (position.top as number) + (index / 2) * 38 + this.transformTop;
      let top =
        (position.top as number) +
        Math.floor(index / 2) * 38 +
        this.transformTop;

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

  private drawDomainUrl(options: DrawOptions, onlyMeasure: boolean = false) {
    const layout = path<layoutInfo>(
      ["layout", "domain"],
      options
    ) as layoutInfo;

    const hasReferral = this.hasReferral(options);

    const { position } = layout;
    const top = this.painter.height - position.bottom!;

    return this._drawText(
      options.data?.domain!,
      {
        left: !hasReferral
          ? this._ratio(position.left!)
          : this._ratio(this.painter.width - 20),
        top: !hasReferral
          ? this._ratio(top)
          : this._ratio(this.painter.height - 16),
        fontSize: this._ratio(layout.fontSize as number),
        color: options.brandColor ?? this.DEFAULT_PROFIT_COLOR,
        fontFamily: options.fontFamily,
        textBaseline: layout.textBaseline,
        textAlign: !hasReferral ? layout.textAlign : "end",
        fontWeight: 600,
      },
      onlyMeasure
    );
  }

  private drawPositionTime(options: DrawOptions) {
    const layout = path<layoutInfo>(
      ["layout", "updateTime"],
      options
    ) as layoutInfo;
    const { position } = layout;
    const hasReferral = this.hasReferral(options);

    let top = this.painter.height - position.bottom!;
    let left = this._ratio(position.left!);

    if (hasReferral) {
      const metrics = this.drawDomainUrl(options, true);
      // console.log("metrics", metrics);
      left =
        this._ratio(this.painter.width) -
        metrics.width -
        this._ratio(8 + position.left!);
      top = this.painter.height - position.bottom!;
      // console.log("left", left, top, metrics.width, this._ratio(top));
    }

    this._drawText(
      !hasReferral
        ? options.data?.updateTime!
        : `Share on ${options.data?.updateTime}   |`,
      {
        left,
        top: this._ratio(top),
        // top: 536,
        fontSize: this._ratio(layout.fontSize as number),
        color: layout.color as string,
        // color: "red",
        textAlign: !hasReferral ? layout.textAlign : "end",
        fontFamily: options.fontFamily,
        textBaseline: layout.textBaseline,
      }
    );
  }

  private drawReferralCode(options: DrawOptions) {
    if (!options.data?.referral) {
      return;
    }

    const layout = path<layoutInfo>(
      ["layout", "updateTime"],
      options
    ) as layoutInfo;
    const { position } = layout;
    const top = this.painter.height - (position.bottom ?? 0);

    const messageLayout = path<layoutInfo>(
      ["layout", "message"],
      options
    ) as layoutInfo;

    const url = new URL(options.data.referral.link);

    const searchParams = url.searchParams;
    searchParams.append("ref", options.data.referral.code);

    url.search = searchParams.toString();

    qrPaint(this.ctx, {
      size: this._ratio(this.QRCODE_SIZE),
      padding: this._ratio(2),
      left: this._ratio(position.left!),
      top: this._ratio(top - this.QRCODE_SIZE),
      data: `${url.toString()}`,
    });

    this._drawText(options.data.referral.slogan, {
      left: this._ratio(position.left! + 66),
      top: this._ratio(top - this.QRCODE_SIZE),
      fontSize: this._ratio(14),
      color: options.brandColor ?? this.DEFAULT_PROFIT_COLOR,
      fontFamily: options.fontFamily,
      textBaseline: "top",
    });

    this._drawText("Referral Code", {
      left: this._ratio(position.left! + 66),
      top: this._ratio(top - 29),
      fontSize: this._ratio(12),
      color: layout.color as string,
      fontFamily: options.fontFamily,
      textBaseline: "middle",
    });

    this._drawText(options.data.referral.code, {
      left: this._ratio(position.left! + 66),
      top: this._ratio(top),
      fontSize: this._ratio(16),
      color: messageLayout.color as string,
      fontFamily: options.fontFamily,
      textBaseline: "bottom",
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
    },
    onlyMeasure: boolean = false
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

    if (!onlyMeasure) {
      this.ctx.fillText(str, left, top);
    }
    this.ctx.restore();

    return boundingBox;
  }

  private hasReferral(options: DrawOptions): boolean {
    return typeof options.data?.referral !== "undefined";
  }

  private _ratio(num: number) {
    return num * this.painter.ratio;
  }
}
