import type { Order } from './charting_library';

export type {
    IBrokerConnectionAdapterHost,
    IChartingLibraryWidget,
    IExecutionLineAdapter,
    InstrumentInfo,
    PlaceOrderResult,
    PlacedOrder,
    PreOrder,
    LibrarySymbolInfo,
    QuotesCallback,
    ResolutionString,
    SubscribeBarsCallback,
    QuoteData,
    IOrderLineAdapter,
    TradeContext,
    TradingTerminalWidgetOptions,
    IBrokerTerminal,
    IBrokerWithoutRealtime,
    LanguageCode,
    DatafeedConfiguration,
    ErrorCallback,
    HistoryCallback,
    OnReadyCallback,
    ResolveCallback,
    SearchSymbolResultItem,
    SearchSymbolsCallback,
    SymbolResolveExtension,
    Bar,
    HistoryMetadata,
    PeriodParams,
    VisiblePlotsSet,
    OrderType as ChartOrderType,
} from './charting_library';

export type ChartOrder = Order & {
    rootAlgoId?: number;
    parentAlgoId?: number;
    areBothPTPAndPSLActivated?: boolean;
};

export enum OrderType {
    Limit = 1,
    Market = 2,
    Stop = 3,
    StopLimit = 4,
    OCO = 5,
    TrailingStop = 6,
    PostOnly = 7,
    Ask = 8,
    Bid = 9,
    POSITION_TP = 10,
    POSITION_SL = 11,
    BRACKET_TP = 12,
    BRACKET_SL = 13,
    BRACKET = 14,
    AC = 15,
}

export enum Side {
    Buy = 1,
    Sell = -1,
}

export enum OrderStatus {
    Canceled = 1,
    Filled = 2,
    Inactive = 3,
    Placing = 4,
    Rejected = 5,
    Working = 6,
}

export enum ParentType {
    Order = 1,
    Position = 2,
}

export enum StopType {
    StopLoss = 0,
    TrailingStop = 1,
}

export enum ChartMode {
    BASIC = 0,
    ADVANCED = 1,
    UNLIMITED = 2,
    MOBILE = 3,
}

export enum PositionSide {
    LONG = 'LONG',
    SHORT = 'SHORT',
    BOTH = 'BOTH',
}


export type ChartPosition = {
    symbol: string;
    open: number;
    balance: number;
    closablePosition: number;
    unrealPnl: number;
    interest: number;
    unrealPnlDecimal: number;
    basePriceDecimal: number;
    positionSide?: PositionSide;
};

export enum SideType {
    BUY = 'BUY',
    SELL = 'SELL',
}

