export const EXCHANGE = 'Orderly';
export const withoutExchangePrefix = (symbol: string) => (symbol.includes(':') ? symbol.split(':')[1] : symbol);

export const withExchangePrefix = (symbol: string) => (symbol.startsWith(`${EXCHANGE}:`) ? symbol : `${EXCHANGE}:${symbol}`);
