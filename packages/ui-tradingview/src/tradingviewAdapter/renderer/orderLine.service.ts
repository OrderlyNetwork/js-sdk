import { i18n } from "@kodiak-finance/orderly-i18n";
import { Decimal, commify, getTrailingStopPrice } from "@kodiak-finance/orderly-utils";
import { IChartingLibraryWidget, IOrderLineAdapter } from "../charting_library";
import useBroker from "../hooks/useBroker";
import {
  SideType,
  AlgoType,
  OrderCombinationType,
  OrderType,
  OrderInterface,
  ChartPosition,
  ChartMode,
} from "../type";
import { CHART_QTY_DECIMAL, getOrderId } from "./order.util";
import {
  getTpslTag,
  isActivatedPositionTpsl,
  isActivatedQuantityTpsl,
  isPositionTpsl,
  isTpslOrder,
} from "./tpsl.util";
import { TpslCalService } from "./tpslCal.service";

export class OrderLineService {
  private instance: IChartingLibraryWidget;
  private pendingOrderLineMap: Map<number, IOrderLineAdapter>;
  private pendingOrders: any[];
  private broker: ReturnType<typeof useBroker>;
  private tpslCalService: TpslCalService;

  constructor(
    instance: IChartingLibraryWidget,
    broker: ReturnType<typeof useBroker>,
  ) {
    this.instance = instance;
    this.pendingOrderLineMap = new Map();
    this.pendingOrders = [];
    this.broker = broker;
    this.tpslCalService = new TpslCalService();
  }

  renderPendingOrders(newPendingOrders: any[]) {
    if (newPendingOrders) {
      this.pendingOrders = newPendingOrders;
    }
    this.cleanOldPendingOrders(this.pendingOrders);
    this.tpslCalService.prepareTpslPnlMap(this.pendingOrders);
    this.tpslCalService.prepareQuantityTpslNoMap(this.pendingOrders);
    this.pendingOrders.forEach((order) => this.renderPendingOrder(order));
  }

  updatePositions(positions: ChartPosition[] | null) {
    const changed = this.tpslCalService.recalculatePnl(
      positions,
      this.pendingOrders,
    );

    this.pendingOrders
      .filter((order) => changed.includes(getOrderId(order)!))
      .forEach((order) => this.renderPendingOrder(order));
  }

  renderPendingOrder(order: any) {
    const orderId = OrderLineService.getOrderId(order);
    if (!orderId) {
      return;
    }
    const orderLine = this.drawOrderLine(orderId, order);

    if (orderLine) {
      this.pendingOrderLineMap.set(orderId, orderLine);
    }
  }

  cleanOldPendingOrders(newPendingOrders: any[]) {
    const newOrderIdSet = new Set(
      newPendingOrders.map((order) => OrderLineService.getOrderId(order)),
    );

    this.pendingOrderLineMap.forEach(
      (_, orderId) =>
        !newOrderIdSet.has(orderId) && this.removePendingOrder(orderId),
    );
  }

  removePendingOrder(orderId: number | undefined) {
    if (orderId === undefined) {
      return;
    }

    const orderLine = this.pendingOrderLineMap.get(orderId);

    if (orderLine) {
      this.pendingOrderLineMap.delete(orderId);
      orderLine.remove();
    }
  }
  getBaseOrderLine() {
    const colorConfig = this.broker.colorConfig;
    return this.instance
      .activeChart()
      .createOrderLine()
      .setCancelTooltip(i18n.t("orders.cancelOrder"))
      .setQuantityTextColor(colorConfig.qtyTextColor!)
      .setQuantityBackgroundColor(colorConfig.chartBG!)
      .setBodyBackgroundColor(colorConfig.chartBG!)
      .setCancelButtonBackgroundColor(colorConfig.chartBG!)
      .setLineStyle(1)
      .setBodyFont(colorConfig.font!)
      .setQuantityFont(colorConfig.font!);
  }

  static getCombinationType(order: any): OrderCombinationType {
    const { algo_type: algoType, type } = order;

    if (
      (algoType === AlgoType.STOP_LOSS ||
        algoType === AlgoType.TAKE_PROFIT ||
        algoType === AlgoType.STOP) &&
      type === OrderType.LIMIT
    ) {
      return OrderCombinationType.STOP_LIMIT;
    }
    if (
      (algoType === AlgoType.STOP_LOSS ||
        algoType === AlgoType.TAKE_PROFIT ||
        algoType === AlgoType.STOP) &&
      type === OrderType.MARKET
    ) {
      return OrderCombinationType.STOP_MARKET;
    }
    if (algoType === AlgoType.BRACKET) {
      if (type === OrderType.LIMIT) {
        return OrderCombinationType.BRACKET_LIMIT;
      }
      if (type === OrderType.MARKET) {
        return OrderCombinationType.BRACKET_MARKET;
      }
    }

    if (algoType === AlgoType.TRAILING_STOP) {
      return OrderCombinationType.TRAILING_STOP;
    }

    return OrderCombinationType.LIMIT;
  }

  static getText(pendingOrder: any) {
    const orderCombinationType =
      OrderLineService.getCombinationType(pendingOrder);
    if (
      orderCombinationType === OrderCombinationType.STOP_LIMIT ||
      orderCombinationType === OrderCombinationType.STOP_MARKET ||
      orderCombinationType === OrderCombinationType.STOP_BRACKET_LIMIT ||
      orderCombinationType === OrderCombinationType.STOP_BRACKET_MARKET
    ) {
      if (pendingOrder.type === OrderType.LIMIT) {
        return `${i18n.t("orderEntry.orderType.stopLimit")} ${commify(
          pendingOrder.price,
        )}`;
      }
      return i18n.t("orderEntry.orderType.stopMarket");
    }
    if (orderCombinationType === OrderCombinationType.TRAILING_STOP) {
      return i18n.t("orderEntry.trailing");
    }
    return i18n.t("orderEntry.orderType.limit");
  }

  static getOrderPrice(pendingOrder: any) {
    if (pendingOrder.algo_type === AlgoType.TRAILING_STOP) {
      return getTrailingStopPrice(pendingOrder);
    }

    return pendingOrder.trigger_price || pendingOrder.price;
  }

  static getOrderId = (order: any) => {
    if (order === null || order === undefined) {
      return undefined;
    }
    return order.algo_order_id || order.order_id;
  };

  getTPSLTextWithTpsl(text: string, pendingOrder: OrderInterface) {
    const orderId = getOrderId(pendingOrder);
    if (!orderId) {
      return text;
    }

    // first hiden pnl
    // const unrealPnl = this.tpslCalService.getTpslPnlMap().get(orderId);
    // if (unrealPnl) {
    //   return `${text} | PnL ${unrealPnl}`;
    // }

    return text;
  }

  getTPSLText(pendingOrder: any) {
    const tpslTypeText = getTpslTag(
      pendingOrder,
      this.tpslCalService.getQuantityTpslNoMap(),
    );

    if (tpslTypeText) {
      return this.getTPSLTextWithTpsl(tpslTypeText, pendingOrder);
    }

    return null;
  }

  getOrderQuantity(pendingOrder: OrderInterface) {
    if (pendingOrder.algo_order_id) {
      if (
        isActivatedPositionTpsl(pendingOrder) ||
        isPositionTpsl(pendingOrder)
      ) {
        return "100%";
      }
      if (isActivatedQuantityTpsl(pendingOrder)) {
        const qty = new Decimal(pendingOrder.quantity).minus(
          pendingOrder.executed ?? 0,
        );
        const per = qty
          .div(new Decimal(pendingOrder.position_qty!))
          .mul(100)
          .todp(2)
          .toNumber();
        return `${Math.min(Math.abs(per), 100).toString()}%`;
      }
    }
    return commify(new Decimal(pendingOrder.quantity).toString());
  }

  drawOrderLine(orderId: number, pendingOrder: any) {
    // const text = OrderLineService.getText(pendingOrder);
    const text = isTpslOrder(pendingOrder)
      ? this.getTPSLText(pendingOrder)
      : OrderLineService.getText(pendingOrder);
    if (text === null) {
      return null;
    }

    const colorConfig = this.broker.colorConfig;
    const orderLine =
      this.pendingOrderLineMap.get(orderId) ?? this.getBaseOrderLine();
    const color =
      pendingOrder.side === SideType.BUY
        ? colorConfig.upColor
        : colorConfig.downColor;
    const borderColor =
      pendingOrder.side === SideType.BUY
        ? colorConfig.pnlUpColor
        : colorConfig.pnlDownColor;
    const price = OrderLineService.getOrderPrice(pendingOrder);
    const lineLength = 100;
    const quantity = this.getOrderQuantity(pendingOrder);
    const textColor = colorConfig.textColor;

    orderLine
      .setText(text)
      .setCancelButtonIconColor(colorConfig.closeIcon!)
      .setCancelButtonBorderColor(color!)
      .setBodyTextColor(textColor!)
      .setBodyBorderColor(color!)
      .setQuantityBorderColor(color!)
      .setQuantityTextColor(color!)
      // .setBodyBackgroundColor(color)
      .setLineColor(color!)
      .setLineLength(lineLength)
      .setQuantity(quantity ?? "")
      .setPrice(price);

    if (this.broker.mode !== ChartMode.MOBILE) {
      orderLine.onCancel(null, () => this.broker.cancelOrder(pendingOrder));
      this.applyEditOnMove(orderLine, pendingOrder);
    } else {
      orderLine.setEditable(false).setCancellable(false);
    }
    // orderLine.onCancel(null, () => this.broker.cancelOrder(pendingOrder));
    // this.applyEditOnMove(orderLine, pendingOrder);

    return orderLine;
  }

  static getOrderEditKey(pendingOrder: any) {
    const orderCombinationType = this.getCombinationType(pendingOrder);

    if (
      [OrderCombinationType.LIMIT, OrderCombinationType.BRACKET_LIMIT].includes(
        orderCombinationType,
      )
    ) {
      return "price";
    }

    if (
      orderCombinationType === OrderCombinationType.STOP_LIMIT ||
      orderCombinationType === OrderCombinationType.STOP_MARKET ||
      pendingOrder.rootAlgoOrderAlgoType === AlgoType.POSITIONAL_TP_SL ||
      pendingOrder.rootAlgoOrderAlgoType === AlgoType.TP_SL ||
      pendingOrder.rootAlgoOrderAlgoType === AlgoType.BRACKET ||
      pendingOrder.rootAlgoOrderAlgoType === AlgoType.STOP_BRACKET
    ) {
      return "trigger_price";
    }
  }

  applyEditOnMove(orderLine: IOrderLineAdapter, pendingOrder: any) {
    const editKey = OrderLineService.getOrderEditKey(pendingOrder);
    if (!editKey) {
      return;
    }
    orderLine.onMove(() => {
      this.broker
        .editOrder(pendingOrder, {
          type: editKey,
          value: `${orderLine.getPrice()}`,
        })
        .then((res: any) => {
          if (!res.success) {
            this.renderPendingOrder(pendingOrder); // go back to the original price
          }
        })
        .catch(() => this.renderPendingOrder(pendingOrder));
    });
  }

  removeAll() {
    this.pendingOrderLineMap.forEach((orderLine) => orderLine.remove());
    this.pendingOrderLineMap.clear();
    this.pendingOrders = [];
    this.tpslCalService.clear();
  }
}
