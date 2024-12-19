import {
  IChartingLibraryWidget,
  IBrokerConnectionAdapterHost,
} from "../charting_library";
import { ChartPosition } from "../type";
import { PositionLineService } from "./positionLine.service";
import useBroker from "../hooks/useBroker";
import { OrderLineService } from "./orderLine.service";
import { ExecutionService } from "./execution.service";

export class Renderer {
  private instance: IChartingLibraryWidget;
  private positionLineService: PositionLineService;
  private orderLineService: OrderLineService;
  private executionService: ExecutionService;

  constructor(
    instance: IChartingLibraryWidget,
    host: IBrokerConnectionAdapterHost,
    broker: ReturnType<typeof useBroker>
  ) {
    this.instance = instance;
    this.positionLineService = new PositionLineService(instance, broker);
    this.orderLineService = new OrderLineService(instance, broker);
    this.executionService = new ExecutionService(instance,broker);
  }

  async renderPositions(positions: ChartPosition[] | null) {
    await this.chartReady();
    await this.onDataLoaded();
    this.positionLineService.renderPositions(positions);
    this.orderLineService.updatePositions(positions);
  }

  async renderPendingOrders(pendingOrders: any) {
    await this.chartReady();
    this.orderLineService.renderPendingOrders(pendingOrders);
  }

  async renderFilledOrders(filledOrders:any, basePriceDecimal: number) {
    await this.chartReady();
    await this.onDataLoaded();

    this.executionService.renderExecutions(filledOrders, basePriceDecimal);
  }


  remove() {
    this.orderLineService.removeAll();
    this.positionLineService.removePositions();
    this.executionService.destroy();

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
          true
        )
    );
  }

  chartReady(): Promise<void> {
    return new Promise((resolve) =>
      // eslint-disable-next-line no-promise-executor-return
      this.instance.onChartReady(() => {
        try {
          this.instance.activeChart().dataReady(() => resolve());
        } catch (err: any) {
          if (err!.toString().includes("tradingViewApi")) {
            // hot reload error will be silent
          } else {
            console.log("-- chartReady error", err);
            // throw err;
          }
        }
      })
    );
  }
}
