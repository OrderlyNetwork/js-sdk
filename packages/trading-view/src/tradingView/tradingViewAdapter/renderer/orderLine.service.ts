import { IChartingLibraryWidget, IOrderLineAdapter } from "../charting_library";
import useBroker from "../hooks/useBroker";
import { Decimal } from "@orderly.network/utils";
import { SideType, AlgoType, OrderCombinationType, OrderType, OrderInterface, ChartPosition } from "../type";
import { TpslCalService } from "./tpslCal.service";
import {getTpslTag, isActivatedPositionTpsl, isActivatedQuantityTpsl, isPositionTpsl, isTpslOrder } from "./tpsl.util";
import {CHART_QTY_DECIMAL, getOrderId } from "./order.util";

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
    const changed = this.tpslCalService.recalculatePnl(positions, this.pendingOrders);

    this.pendingOrders.filter((order) => changed.includes(getOrderId(order)!)).forEach((order) => this.renderPendingOrder(order));
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
        .setBodyBackgroundColor(colorConfig.chartBG)
      .setCancelButtonBackgroundColor(colorConfig.chartBG)
      .setLineStyle(1)
      .setBodyFont(colorConfig.font)
      .setQuantityFont(colorConfig.font)
        ;
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
    const tpslTypeText = getTpslTag(pendingOrder, this.tpslCalService.getQuantityTpslNoMap());

    if (tpslTypeText) {
      return this.getTPSLTextWithTpsl(tpslTypeText, pendingOrder);
    }

    return null;
  }

  getOrderQuantity(pendingOrder: OrderInterface){
    if (isActivatedPositionTpsl(pendingOrder) || isPositionTpsl(pendingOrder)) {
      return '100%';
    }
    if (isActivatedQuantityTpsl(pendingOrder)) {
      return new Decimal(pendingOrder.quantity).minus(pendingOrder.executed ?? 0).toString();
    }
    new Decimal(pendingOrder.quantity)
        .toString();
  }

  drawOrderLine(orderId: number, pendingOrder: any) {
    // const text = OrderLineService.getText(pendingOrder);
    const text = isTpslOrder(pendingOrder) ? this.getTPSLText(pendingOrder) : OrderLineService.getText(pendingOrder);
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
      .setCancelButtonIconColor(color)
      .setCancelButtonBorderColor(color)
      .setBodyTextColor(textColor)
      .setBodyBorderColor(color)
      .setQuantityBorderColor(color)
      // .setBodyBackgroundColor(color)
      .setLineColor(color)
      .setLineLength(lineLength)
      .setQuantity(quantity ?? '')
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
