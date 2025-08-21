/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import React, { useRef } from "react";
import { useSymbolsInfo, utils } from "@orderly.network/hooks";
import { i18n, useTranslation } from "@orderly.network/i18n";
import { useOrderEntryFormErrorMsg } from "@orderly.network/react-app";
import {
  Box,
  cn,
  convertValueToPercentage,
  Flex,
  Input,
  inputFormatter,
  modal,
  Slider,
  Text,
} from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import type {
  CrossHairMovedEventParams,
  EntityId,
  IChartingLibraryWidget,
  ILineDataSourceApi,
  IOrderLineAdapter,
} from "../charting_library";
import useBroker from "../hooks/useBroker";
import type { ChartPosition } from "../type";

enum MouseInteractiveMode {
  NONE,
  START_TP_SL,
  TP_SL_DRAGGING,
  // END_TP_SL,
}

const maskLayerStore = new WeakMap<
  IChartingLibraryWidget,
  { maskLayer: HTMLDivElement }
>();

export class TPSLService {
  private instance: IChartingLibraryWidget;
  private broker: ReturnType<typeof useBroker>;
  private lastPositions: ChartPosition[] | null;

  private interactiveMode: MouseInteractiveMode = MouseInteractiveMode.NONE;

  private timer: ReturnType<typeof setTimeout> | null = null;

  private currentPosition: ChartPosition | null = null;
  private tpslOrderLine: IOrderLineAdapter | null = null;
  private tpslPnLVerticalLineEntityId: EntityId | null = null;
  private tpslVerticalLineTime: number | null = null;
  private tpslStartCircleEntityId: EntityId | null = null;
  private tpslEndCircleEntityId: EntityId | null = null;
  private threshold: number = 10;
  private lastArgs: CrossHairMovedEventParams | null = null;

  constructor(
    instance: IChartingLibraryWidget,
    broker: ReturnType<typeof useBroker>,
    // onUpdate
  ) {
    this.instance = instance;
    this.broker = broker;
    this.lastPositions = null;
    // this.positionLineService = positionLineService;
    this.timer = null;
    this.currentPosition = null;

    this.bindEvent();
  }

  private bindEvent() {
    // console.log("******* TPSL bindEvent *******", this.container);
    // this.chart.setScrollEnabled(false);

    // this.instance.subscribe()

    this.chart.crossHairMoved().subscribe(null, (args) => {
      this.lastArgs = args;
      if (this.interactiveMode === MouseInteractiveMode.TP_SL_DRAGGING) {
        return;
      }
      const position = this.getIntersectantPosition(args);
      // console.log('xxx postion', position);

      //   console.log(position);
      if (
        this.currentPosition &&
        position &&
        this.currentPosition.symbol === position.symbol
      ) {
        // console.log("no change");
        return;
      }
      if (this.currentPosition && !position) {
        // console.log("remove current position", position);
        // this.timer = setTimeout(() => {
        this.removeTPSLTriggerButton();
        this.currentPosition = null;
        // }, 1000);
        return;
      }

      if (position) {
        this.currentPosition = position;

        this.createTPSLTriggerButton(args);

        // console.log("-->>>set current position", this.currentPosition);
      }

      //   this.lastCrossHairTime = args.time;

      // this.hitTest();
    });
  }

  private showTPSLDialog(params: { price: number }) {
    const pnl = new Decimal(params.price)
      .minus(this.currentPosition!.open)
      .mul(this.currentPosition?.balance ?? 0);
    modal
      .show("TPSLSimpleDialogId", {
        title: pnl.gt(0)
          ? i18n.t("tpsl.TPOrderConfirm")
          : i18n.t("tpsl.SLOrderConfirm"),
        triggerPrice: params.price,
        type: pnl.gt(0) ? "tp" : "sl",
        symbol: this.currentPosition!.symbol,
        onComplete: () => {
          this.clearTPSLElements();
          this.chart.setScrollEnabled(true);
          this.chart.setZoomEnabled(true);
          this.interactiveMode = MouseInteractiveMode.NONE;
        },
        showAdvancedTPSLDialog: (options: { qty: number }) => {
          this.showAdvancedTPSLDialog({
            type: pnl.gt(0) ? "tp" : "sl",
            triggerPrice: params.price,
            qty: options.qty,
          });
        },
      })
      .then(
        () => {
          console.log("completate");
        },
        (err) => {
          console.log(err);
        },
      )
      .finally(() => {
        this.clearTPSLElements();
        this.chart.setScrollEnabled(true);
        this.chart.setZoomEnabled(true);
        this.interactiveMode = MouseInteractiveMode.NONE;
      });
  }

  private showAdvancedTPSLDialog({
    type,
    triggerPrice,
    qty,
  }: {
    type: "tp" | "sl";
    triggerPrice: number;
    qty: number;
  }) {
    console.log("showAdvancedTPSLDialog", type, triggerPrice);
    modal
      .show("TPSLDialogId", {
        withTriggerPrice: true,
        type,
        triggerPrice,
        symbol: this.currentPosition?.symbol,
        qty,
        onComplete: () => {
          this.clearTPSLElements();
          this.chart.setScrollEnabled(true);
          this.chart.setZoomEnabled(true);
          this.interactiveMode = MouseInteractiveMode.NONE;
        },
      })
      .then(
        () => {
          console.log("completate");
        },
        (err) => {
          console.log("show advanced tpsl dialog error", err);
        },
      )
      .finally(() => {
        this.clearTPSLElements();
        this.chart.setScrollEnabled(true);
        this.chart.setZoomEnabled(true);
        this.interactiveMode = MouseInteractiveMode.NONE;
      });
  }

  updatePositions(positions: ChartPosition[] | null) {
    this.lastPositions = positions;
    this.threshold = this.generateThreshold();
  }

  private generateThreshold() {
    // return new Decimal(position.open).mul(0.01).abs().toNumber();
    // const priceRange = this.chart.get
    const priceScale = this.chart.getPanes()[0].getRightPriceScales()[0];
    const priceRange = priceScale.getVisiblePriceRange();

    // console.log(priceRange);
    if (priceRange) {
      const priceWidth = priceRange.to - priceRange.from;
      const threshold = priceWidth * 0.02;
      // console.log(threshold);
      return threshold;
    }

    return 10;
  }

  private drawTPSL(params: { price: number }) {
    const { price } = params;
    const pnl = new Decimal(price)
      .minus(this.currentPosition!.open)
      .mul(this.currentPosition?.balance ?? 0);

    const { tpslOrderLine, verticalLine } = this.ensureTPSLElements({
      price,
      pnl,
    });
    const direction = pnl.gt(0) ? i18n.t("tpsl.tp") : i18n.t("tpsl.sl");

    const color = pnl.gt(0)
      ? this.broker.colorConfig.upColor
      : this.broker.colorConfig.downColor;
    console.log("xxx drage tpsl", tpslOrderLine);
    tpslOrderLine
      ?.setText(`${direction} ${pnl.toDecimalPlaces(2).toNumber()}`)
      .setBodyTextColor(color!)
      .setBodyBorderColor(color!)
      .setLineColor(color!);

    if (this.tpslVerticalLineTime) {
      verticalLine?.setPoints([
        { price: this.currentPosition?.open, time: this.tpslVerticalLineTime },
        { time: this.tpslVerticalLineTime, price: price },
      ]);
    }
  }

  private ensureTPSLElements(params: { price: number; pnl: Decimal }) {
    const tpslOrderLine = this.tpslOrderLine;
    let verticalLine;
    let tpslStartCircle;
    let tpslEndCircle;
    // if (this.tpslPnLLabelEntityId) {
    //   tpslPnLLabel = this.chart.getShapeById(this.tpslPnLLabelEntityId);
    // }
    if (!tpslOrderLine) {
      this.tpslOrderLine = this.createTPSLOrderLine();
    }

    if (this.tpslPnLVerticalLineEntityId) {
      verticalLine = this.chart.getShapeById(this.tpslPnLVerticalLineEntityId);
    }
    if (!verticalLine) {
      if (!this.currentPosition || !this.tpslVerticalLineTime) {
        return {};
      }
      this.tpslPnLVerticalLineEntityId = this.chart.createMultipointShape(
        [
          {
            price: this.currentPosition.open,
            time: this.tpslVerticalLineTime,
          },
          { time: this.tpslVerticalLineTime, price: params.price },
        ],
        {
          // shape: "trend_line",
          shape: "arrow",
          lock: true,
          disableSave: true,
          disableSelection: true,
          disableUndo: true,
          zOrder: "top",
          overrides: {
            linecolor: "rgba(255,255,255, 0.2)",
            linewidth: 1,
          },
        },
      );
    }
    verticalLine?.setProperties({
      linecolor: params.pnl.gt(0)
        ? this.broker.colorConfig.upColor
        : this.broker.colorConfig.downColor,
      linewidth: 1,
    });

    return {
      tpslOrderLine,
      verticalLine,
    };
  }

  private createTPSLTriggerButton(params: CrossHairMovedEventParams) {
    if (!this.tpslOrderLine) {
      this.tpslOrderLine = this.createTPSLOrderLine();
    }
    this.tpslOrderLine.onMove(() => {
      const price = this.tpslOrderLine?.getPrice();
      this.showTPSLDialog({ price: price ?? 0 });
    });
    this.tpslOrderLine.onMoving(() => {
      console.log("xxx on moving", this.tpslOrderLine);
      const price = this.tpslOrderLine?.getPrice();
      this.interactiveMode = MouseInteractiveMode.TP_SL_DRAGGING;
      this.verticalLineTime();
      this.drawTPSL({ price: price ?? 0 });
    });
  }

  private createTPSLOrderLine() {
    return (
      this.chart
        .createOrderLine()
        // .setEditable(false)
        .setCancellable(false)
        .setExtendLeft(true)
        .setTooltip(i18n.t("tpsl.dragToSet"))
        .setPrice(this.currentPosition!.open)
        .setLineLength(-200, "pixel")
        .setText(i18n.t("tpsl.advanced.title"))
        .setQuantity("")
        .setBodyTextColor(this.broker.colorConfig.textColor!)
        .setBodyBackgroundColor(this.broker.colorConfig.chartBG!)
        .setBodyBorderColor(this.broker.colorConfig.pnlZoreColor!)
        .setQuantityBackgroundColor(this.broker.colorConfig.chartBG!)
        .setQuantityBorderColor(this.broker.colorConfig.pnlZoreColor!)
        .setQuantityTextColor(this.broker.colorConfig.qtyTextColor!)
        .setBodyFont(this.broker.colorConfig.font!)
        .setQuantityFont(this.broker.colorConfig.font!)
        .setLineStyle(1)
      // .setLineColor("rgba(255,255,255,0)")
    );
  }

  private verticalLineTime() {
    const range = this.chart.getVisibleRange();

    // const timeScaler = this.chart.getTimeScale();
    // // console.log(timeScaler.width());
    // const width = timeScaler.width();
    // console.log(width);

    // const time = timeScaler.coordinateToTime(width - 100);
    this.tpslVerticalLineTime = this.getTimeAtPercentage(
      range.from,
      range.to,
      90,
    );
  }

  private removeTPSLTriggerButton() {
    if (this.tpslOrderLine) {
      this.tpslOrderLine.remove();
      this.tpslOrderLine = null;
    }
  }

  private clearTPSLElements() {
    // check area

    if (this.tpslOrderLine) {
      this.tpslOrderLine.remove();
      this.tpslOrderLine = null;
    }

    if (this.tpslPnLVerticalLineEntityId) {
      this.chart.removeEntity(this.tpslPnLVerticalLineEntityId);
      this.tpslPnLVerticalLineEntityId = null;
    }
    // this.tpslVerticalLineTime = null;
  }

  private getIntersectantPosition(params: CrossHairMovedEventParams) {
    if (!Array.isArray(this.lastPositions) || this.lastPositions.length === 0) {
      return null;
    }

    // this.lastPositions.forEach((position) => {
    // console.log(position);
    // });
    const { price, time } = params;
    let intersectantPosition: ChartPosition | null = null;

    // console.log('params', params);
    // console.log('xxx lastPositions', this.lastPositions, this.threshold, price);
    for (const position of this.lastPositions) {
      if (position) {
        if (Math.abs(position.open - price) < this.threshold) {
          intersectantPosition = position;
          break;
        }
      }
    }

    return intersectantPosition;
  }

  private get chart() {
    return this.instance.activeChart();
  }

  private getTimeAtPercentage(
    startTime: number,
    endTime: number,
    percentage: number,
  ) {
    // --- 1. Input Validation (Very Important) ---
    if (
      typeof startTime !== "number" ||
      typeof endTime !== "number" ||
      typeof percentage !== "number"
    ) {
      console.error(
        "Input Error: startTime, endTime, and percentage must all be numbers.",
      );
      return null;
    }
    if (percentage < 0 || percentage > 100) {
      console.error(
        `Input Error: Percentage (${percentage}) must be between 0 and 100.`,
      );
      return null;
    }
    if (startTime > endTime) {
      console.error(
        `Input Error: Start time (${startTime}) cannot be later than end time (${endTime}).`,
      );
      return null;
    }

    // --- 2. Core Algorithm ---
    // Calculate total duration
    const duration = endTime - startTime;

    // Convert percentage to decimal (e.g., 50 -> 0.5)
    const factor = percentage / 100.0;

    // Calculate offset
    const offset = duration * factor;

    // Calculate final time
    const targetTime = startTime + offset;

    // --- 3. Return Result ---
    // Timestamps are usually integers, round to nearest integer
    return Math.round(targetTime);
  }
}
