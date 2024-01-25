import { Decimal } from "@orderly.network/utils";
import { useSymbolsInfo } from "./useSymbolsInfo";
import { useMarkPricesStream } from "./useMarkPricesStream";
import { useEffect, useMemo, useState } from "react";

export type PriceRange = {
    min: number,
    max: number,
};


/**
 * will be callback can input max/min price range info
 * 
 * @example useSymbolPriceRange("PERP_ETH_USDC");
 */
export const useSymbolPriceRange = (symbol: string): PriceRange | undefined => {
    const config = useSymbolsInfo();
    const priceRange = config?.[symbol]("price_range");
    const { data: prices } = useMarkPricesStream();
    const markPrice = prices?.[symbol];

    /// max mark_price_i * (1+price_range)
    /// min mark_price_i * (1-price_range)

    const range = useMemo(() => {
        if (config === undefined || markPrice === undefined) {
            return undefined;
        }

        if (priceRange === undefined || Number.isNaN(markPrice)) {
            return undefined;
        }

        return {
            max: new Decimal(markPrice).mul((1 + priceRange)).toNumber(),
            min: new Decimal(markPrice).mul((1 - priceRange)).toNumber(),
        };
    }, [symbol, priceRange, markPrice]);

    return range;
}