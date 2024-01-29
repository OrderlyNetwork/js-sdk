import { IChartingLibraryWidget,  IOrderLineAdapter} from '../charting_library';
import useBroker from '../hooks/useBroker';
import {ChartPosition} from '../type';
import {CHART_GREEN, CHART_RED, PNL_BORDER_GREEN, PNL_BORDER_RED, CHART_BG, TEXT_COLOR2, TEXT_COLOR, FONT} from '../color';
import { Decimal, int2hex } from "@orderly.network/utils";


export class PositionLineService{
    private instance: IChartingLibraryWidget;
    private positionLines: Record<number, IOrderLineAdapter>;
    private currentSymbol: string;
    private broker: ReturnType<typeof useBroker>;
    private lastPositions: ChartPosition[] | null;

    constructor(instance: IChartingLibraryWidget, broker: ReturnType<typeof useBroker>) {
        this.instance = instance;
        this.currentSymbol = '';
        this.broker = broker;
        this.positionLines = {};
        this.lastPositions = null;


    }


    renderPositions(positions: ChartPosition[] | null) {
        if (positions === null || positions.length === 0) {
            this.removePositions();
            return;
        }

        if (this.lastPositions?.length !== positions.length) {
            this.removePositions();
        }

        if (positions[0].symbol !== this.currentSymbol) {
            this.removePositions();
            this.currentSymbol = positions[0].symbol;
        }

        positions.forEach((position, idx) => this.drawPositionLine(position, idx));
        this.lastPositions = positions;
    }

    getBasePositionLine() {
        return this.instance
            .activeChart()
            .createOrderLine()
            .setCancelTooltip('Close Position')
            .setQuantityBackgroundColor(CHART_BG)
            .setCancelButtonBackgroundColor(CHART_BG)
            .setBodyTextColor(TEXT_COLOR)
            .setQuantityTextColor(TEXT_COLOR2)
            // .setBodyFont(FONT)
            .setQuantityFont(FONT)
            .setLineLength(50)
            .setLineStyle(1);
    }

    static getPositionQuantity(balance: number) {
        return new Decimal(balance).todp(4, Decimal.ROUND_DOWN).toString();
    }

    static getPositionPnL(unrealPnl: number, decimal: number) {
        return `PnL ${new Decimal(unrealPnl).todp(decimal, Decimal.ROUND_FLOOR)}`;
    }

    removePositions() {
        Object.keys(this.positionLines).forEach(lineId => {
            this.positionLines[Number(lineId)].remove();
            delete this.positionLines[Number(lineId)];
        });
    }

    drawPositionLine(position: ChartPosition, idx: number) {
        const isPositiveUnrealPnl = position.unrealPnl >= 0;
        const isPositiveBalance = position.balance >= 0;

        const pnlColor = isPositiveUnrealPnl ? CHART_GREEN : CHART_RED;
        const borderColor = isPositiveUnrealPnl ? PNL_BORDER_GREEN : PNL_BORDER_RED;
        const sideColor = isPositiveBalance ? CHART_GREEN : CHART_RED;
        const price = new Decimal(position.open).todp(position.basePriceDecimal, Decimal.ROUND_DOWN).toNumber();

        this.positionLines[idx] = this.positionLines[idx] ?? this.getBasePositionLine();
        this.positionLines[idx]
            .setQuantity(PositionLineService.getPositionQuantity(position.balance))
            .setPrice(price)
            .setCancelButtonIconColor(sideColor)
            .setCancelButtonBorderColor(sideColor)
            .setBodyBackgroundColor(pnlColor)
            .setBodyBorderColor(borderColor)
            .setLineColor(sideColor)
            .setQuantityBorderColor(sideColor)
            .setText(PositionLineService.getPositionPnL(position.unrealPnl, position.unrealPnlDecimal))
            .onMove(() => {
            })
            .onCancel(null, () => {
            });
    }
}