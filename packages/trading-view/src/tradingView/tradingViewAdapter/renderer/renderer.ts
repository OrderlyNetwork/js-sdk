import { IChartingLibraryWidget, IBrokerConnectionAdapterHost} from '../charting_library';
import {ChartPosition} from '../type';
import {PositionLineService} from './positionLine.service';
import useBroker from '../hooks/useBroker';

export class Renderer{
    private instance: IChartingLibraryWidget;
    private positionLineService: PositionLineService;
    constructor(instance: IChartingLibraryWidget, host: IBrokerConnectionAdapterHost, broker: ReturnType<typeof useBroker>) {
        this.instance = instance;
        this.positionLineService = new PositionLineService(instance, broker);
    }

    async renderPositions(positions: ChartPosition[] | null) {
        await this.chartReady();

        this.positionLineService.renderPositions(positions);
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
                        throw err;
                    }
                }
            }),
        );
    }
}