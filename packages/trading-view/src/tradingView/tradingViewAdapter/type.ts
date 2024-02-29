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

export enum AlgoType {
    TAKE_PROFIT = 'TAKE_PROFIT',
    STOP_LOSS = 'STOP_LOSS',
    OCO = 'OCO',
    TRAILING_STOP = 'TRAILING_STOP',
    BRACKET = 'BRACKET',
    STOP_BRACKET = 'STOP_BRACKET',
    STOP = 'STOP', // create only
    POSITIONAL_TP_SL = 'POSITIONAL_TP_SL', // create only
    TP_SL = 'TP_SL', // create only
    BRACKET_TP_SL = 'BRACKET_TP_SL',
    STOP_BRACKET_TP_SL = 'STOP_BRACKET_TP_SL',
}

export enum OrderType {
    LIMIT = 'LIMIT',
    MARKET = 'MARKET',
    IOC = 'IOC',
    POST_ONLY = 'POST_ONLY',
    FOK = 'FOK',
    LIQUIDATE = 'LIQUIDATE', // backend create only
    ASK = 'ASK',
    BID = 'BID',
    CLOSE_POSITION = 'CLOSE_POSITION', // create childOrders only
    AC = 'AC',
    ADL_CLOSE = 'ADL_CLOSE',
    BLP_ASSIGNEE = 'BLP_ASSIGNEE',
}

export enum OrderCombinationType {
    LIMIT = 'LIMIT',
    MARKET = 'MARKET',
    STOP_LIMIT = 'STOP_LIMIT',
    STOP_MARKET = 'STOP_MARKET',
    OCO = 'OCO',
    OCO_LIMIT = 'OCO_LIMIT',
    OCO_MARKET = 'OCO_MARKET',
    ASK = 'ASK',
    BID = 'BID',
    POST_ONLY = 'POST_ONLY',
    IOC = 'IOC',
    FOK = 'FOK',
    LIQUIDATE = 'LIQUIDATE',
    SETTLEMENT = 'SETTLEMENT',
    TRAILING_STOP = 'TRAILING_STOP',
    POSITIONAL_TP_SL = 'POSITIONAL_TP_SL',
    TP_SL = 'TP_SL',
    BRACKET_LIMIT = 'BRACKET_LIMIT',
    BRACKET_MARKET = 'BRACKET_MARKET',
    STOP_BRACKET_LIMIT = 'STOP_BRACKET_LIMIT',
    STOP_BRACKET_MARKET = 'STOP_BRACKET_MARKET',
    AC = 'AC',
    ADL_CLOSE = 'ADL_CLOSE',
    BLP_ASSIGNEE = 'BLP_ASSIGNEE',
}
