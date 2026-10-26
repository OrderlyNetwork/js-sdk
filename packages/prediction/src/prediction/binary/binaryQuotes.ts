import { Decimal } from "@orderly.network/utils";
import { complementPrice } from "./binaryOrderRules";

export const getBinaryQuotes = (bestBid?: number, bestAsk?: number) => {
  const valid = (price?: number) =>
    price != null && Number.isFinite(price) && price > 0 && price < 1
      ? price
      : undefined;
  const bid = valid(bestBid);
  const ask = valid(bestAsk);
  const complement = (price?: number) =>
    price == null ? undefined : complementPrice(price);
  return {
    executablePrices: {
      buy: { up: ask, down: complement(bid) },
      sell: { up: bid, down: complement(ask) },
    },
    upChance:
      bid != null && ask != null
        ? new Decimal(bid).add(ask).div(2).mul(100).toNumber()
        : undefined,
  };
};
