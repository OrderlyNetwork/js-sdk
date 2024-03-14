import { IChartingLibraryWidget, IOrderLineAdapter } from "../charting_library";
import useBroker from "../hooks/useBroker";
import { Decimal } from "@orderly.network/utils";
import { SideType, AlgoType, OrderCombinationType, OrderType } from "../type";

export class OrderLineService {
  private instance: IChartingLibraryWidget;
  private pendingOrderLineMap: Map<number, IOrderLineAdapter>;
  private pendingOrders: any[];
  private broker: ReturnType<typeof useBroker>;

  constructor(
    instance: IChartingLibraryWidget,
    broker: ReturnType<typeof useBroker>
  ) {
    this.instance = instance;
    this.pendingOrderLineMap = new Map();
    this.pendingOrders = [];
    this.broker = broker;
  }

  renderPendingOrders(newPendingOrders: any[]) {
    if (newPendingOrders) {
      this.pendingOrders = newPendingOrders;
    }
    this.cleanOldPendingOrders(this.pendingOrders);
    this.pendingOrders.forEach((order) => this.renderPendingOrder(order));
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
      newPendingOrders.map((order) => OrderLineService.getOrderId(order))
    );

    this.pendingOrderLineMap.forEach(
      (_, orderId) =>
        !newOrderIdSet.has(orderId) && this.removePendingOrder(orderId)
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
      .setCancelTooltip("Cancel Order")
      .setQuantityTextColor(colorConfig.qtyTextColor)
      .setQuantityBackgroundColor(colorConfig.chartBG)
      .setCancelButtonBackgroundColor(colorConfig.chartBG)
      .setLineStyle(1)
      .setBodyFont(colorConfig.font)
      .setQuantityFont(colorConfig.font);
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
      return "Stop";
    }
    return "Limit";
  }

  static getOrderPrice(pendingOrder: any) {
    return pendingOrder.trigger_price || pendingOrder.price;
  }

  static getOrderId = (order: any) => {
    if (order === null || order === undefined) {
      return undefined;
    }
    return order.algo_order_id || order.order_id;
  };

  drawOrderLine(orderId: number, pendingOrder: any) {
    const text = OrderLineService.getText(pendingOrder);

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
    const quantity = new Decimal(pendingOrder.quantity)
      .minus(pendingOrder.executed ?? 0)
      .toString();
    const textColor = colorConfig.textColor;

    orderLine
      .setText(text)
      .setCancelButtonIconColor(color)
      .setCancelButtonBorderColor(color)
      .setBodyTextColor(textColor)
      .setBodyBorderColor(borderColor)
      .setQuantityBorderColor(color)
      .setBodyBackgroundColor(color)
      .setLineColor(color)
      .setLineLength(lineLength)
      .setQuantity(quantity)
      .setPrice(price)
      .onCancel(null, () => this.broker.cancelOrder(pendingOrder));

    this.applyEditOnMove(orderLine, pendingOrder);

    return orderLine;
  }

  static getOrderEditKey(pendingOrder: any) {
    const orderCombinationType = this.getCombinationType(pendingOrder);

    if (orderCombinationType === OrderCombinationType.LIMIT) {
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
}
