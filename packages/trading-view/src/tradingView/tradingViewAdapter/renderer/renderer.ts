import { IChartingLibraryWidget, IBrokerConnectionAdapterHost} from '../charting_library';
import {ChartPosition} from '../type';
import {PositionLineService} from './positionLine.service';
import useBroker from '../hooks/useBroker';
import {OrderLineService} from './orderLine.service';

export class Renderer{
    private instance: IChartingLibraryWidget;
    private positionLineService: PositionLineService;
    private orderLineService: OrderLineService;
    constructor(instance: IChartingLibraryWidget, host: IBrokerConnectionAdapterHost, broker: ReturnType<typeof useBroker>) {
        this.instance = instance;
        this.positionLineService = new PositionLineService(instance, broker);
        this.orderLineService = new OrderLineService(instance, broker);
        this.preventDefaultRenderHack(host);
        this.forceSilentOrdersPlacement(host);
    }

    async renderPositions(positions: ChartPosition[] | null) {
        await this.chartReady();
        await this.onDataLoaded();
        this.positionLineService.renderPositions(positions);
    }

    async renderPendingOrders(pendingOrders:any) {
        await this.chartReady();
        this.orderLineService.renderPendingOrders(pendingOrders);

    }

    remove() {
        this.positionLineService.removePositions();
    }

    onDataLoaded(): Promise<void> {
        if (this.instance.activeChart().symbolExt()) {
            return Promise.resolve();
        }

        return new Promise((resolve) =>
            // eslint-disable-next-line no-promise-executor-return
            this.instance
                .activeChart()
                .onDataLoaded()
                .subscribe(
                    null,
                    () => {
                        resolve();
                    },
                    true,
                ),
        );
    }


    chartReady(): Promise<void> {
        return new Promise((resolve) =>
            // eslint-disable-next-line no-promise-executor-return
            this.instance.onChartReady(() => {
                try {
                    this.instance.activeChart().dataReady(() => resolve());
                } catch (err: any) {
                    if (err!.toString().includes('tradingViewApi')) {
                        // hot reload error will be silent
                    } else {
                        console.log('-- chartReady error', err);
                        // throw err;
                    }
                }
            }),
        );
    }

    // We implement our own render logic and skip TradingView's default render
    preventDefaultRenderHack(host: IBrokerConnectionAdapterHost) {
        (host as any).setBrokerConnectionAdapter = function (adapter: any) {
            const delegate = {
                subscribe: () => {},
                unsubscribe: () => {},
                unsubscribeAll: () => {},
            };

            Object.defineProperty(adapter, '_ordersCache', {
                get: function () {
                    return {
                        start: () => {},
                        stop: () => {},
                        update: () => {},
                        partialUpdate: () => {},
                        fullUpdate: () => {},
                        getObjects: async () => [],
                        updateDelegate: delegate,
                        partialUpdateDelegate: delegate,
                    };
                },
                set: () => {},
            });
            adapter._waitForOrderModification = async () => true;
            this._adapter = adapter;
        };
    }

    forceSilentOrdersPlacement = (host: any) => {
        this.instance.onChartReady(() => {
            // Apply default teamplate makes the silentOrdersPlacement disabled, need to set it back
            host.silentOrdersPlacement().subscribe((val: any) => {
                if (!val) {
                    host.silentOrdersPlacement().setValue(true);
                    if (this.instance) {
                        (this.instance as any)._iFrame.contentDocument.querySelector('.wrapper-3X2QgaDd').className =
                            'wrapper-3X2QgaDd highButtons-3X2QgaDd';
                    }

                    // The block can only be executed while "Apply default teamplate".
                    // We don't wnat to show btn buy defualt, so close it.
                    host.sellBuyButtonsVisibility()?.setValue(false);
                }
            });
        });
    };
}