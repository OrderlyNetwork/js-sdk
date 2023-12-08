import {AggregatedData} from "@/block/positions/overview";
import { API } from "@orderly.network/types";

export interface PositionsViewProps {
    dataSource: any[] | null;
    aggregated: AggregatedData;
    // actions
    onLimitClose?: (position: any) => void;
    onMarketClose?: (position: any) => void;
    onShowAllSymbolChange?: (isAll: boolean) => void;
    showAllSymbol?: boolean;
    onMarketCloseAll?: () => void;
    loadMore?: () => void;
    isLoading?: boolean;
    onSymbolChange?: (symbol: API.Symbol) => void;
}
