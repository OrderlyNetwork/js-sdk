import { IChartingLibraryWidget,  IOrderLineAdapter} from '../charting_library';
import useBroker from '../hooks/useBroker';
import { Decimal} from "@orderly.network/utils";
import { SideType } from "../type";

export class OrderLineService{
    private instance: IChartingLibraryWidget;
    private pendingOrderLineMap: Map<number, IOrderLineAdapter>;
    private pendingOrders: any[];
    private broker: ReturnType<typeof useBroker>;

    constructor(instance: IChartingLibraryWidget, broker: ReturnType<typeof useBroker>) {
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
        this.pendingOrders.forEach(order => this.renderPendingOrder(order))

    }

    renderPendingOrder(order: any) {
        if (!order  || !order.order_id) {
            return;
        }
        const orderLine = this.drawOrderLine(order.order_id, order);

        if (orderLine) {
            this.pendingOrderLineMap.set(order.order_id, orderLine);
        }


    }

    cleanOldPendingOrders(newPendingOrders:any[]) {
        const newOrderIdSet = new Set(newPendingOrders.map(_ => _.order_id));

        this.pendingOrderLineMap.forEach((_, orderId) => !newOrderIdSet.has(orderId) && this.removePendingOrder(orderId));
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
            .setCancelTooltip('Cancel Order')
            .setQuantityTextColor(colorConfig.qtyTextColor)
            .setQuantityBackgroundColor(colorConfig.chartBG)
            .setCancelButtonBackgroundColor(colorConfig.chartBG)
            .setLineStyle(1)
            .setBodyFont(colorConfig.font)
            .setQuantityFont(colorConfig.font);
    }

    static getText(pendingOrder:any) {
        return 'Limit';
    }

    drawOrderLine(orderId: number, pendingOrder:any) {
        const text = OrderLineService.getText(pendingOrder);

        if (text === null) {
            return null;
        }

        const colorConfig = this.broker.colorConfig;
        const orderLine = this.pendingOrderLineMap.get(orderId) ?? this.getBaseOrderLine();
        const color = pendingOrder.side === SideType.BUY ? colorConfig.upColor:colorConfig.downColor;
        const borderColor = pendingOrder.side === SideType.BUY ?colorConfig.pnlUpColor:colorConfig.pnlDownColor;
        const price = pendingOrder.price;
        const lineLength = 100;
        const quantity = new Decimal(pendingOrder.quantity).minus(pendingOrder.executed ?? 0).toString();
        const textColor =colorConfig.textColor;

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

    applyEditOnMove(orderLine: IOrderLineAdapter, pendingOrder: any) {
            orderLine.onMove(() => {
                this.broker
                    .editOrder(pendingOrder, { type:'price', value: `${orderLine.getPrice()}` })
                    .then((res: any) => {
                        if (!res.success) {
                            this.renderPendingOrder(pendingOrder); // go back to the original price
                        }
                    })
                    .catch(() => this.renderPendingOrder(pendingOrder));
            });
    }

}