import { useMemo } from "react";
import {
  useAppStore,
  useCollateral,
  useMarkPrice,
  usePositions,
} from "@orderly.network/hooks";
import { account, positions as positionsLib } from "@orderly.network/perp";
import { MarginMode } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";

const usePositionMargin = (
  symbol: string,
  isAdd: boolean,
  isolatedMargin: number,
  /**
   * finalMargin = if isAdd ? isolatedMargin + margin_add : isolatedMargin - margin_reduction
   */
  finalMargin: number,
) => {
  const { freeCollateral, usdcHolding } = useCollateral({
    dp: 2,
  });

  const positions = usePositions();

  const total_cross_unsettled_pnl = useMemo(() => {
    return positions
      ?.filter((item) => (item.margin_mode ?? "CROSS") === "CROSS")
      .reduce((acc, item) => acc.add(item.unsettled_pnl), new Decimal(0));
  }, [positions]);

  // sum_unitary_funding >> fundingRates.sybmol.sum_unitary_funding

  const fundingRates = useAppStore((state) => state.fundingRates);
  const symbolsInfo = useAppStore((state) => state.symbolsInfo);
  const accountInfo = useAppStore((state) => state.accountInfo);
  const { data: markPrice } = useMarkPrice(symbol);
  const totalUnsettlementPnl = useMemo(() => {
    if (!positions?.length) {
      return null;
    }

    return positions.reduce((acc, item) => {
      // Align with calculator's unsettlementPnL_total aggregation.
      const itemAny = item as unknown as Record<string, number | undefined>;
      const positionUnsettlementPnl =
        itemAny["unsettlement_pnl"] ?? item.unsettled_pnl ?? 0;
      return acc.add(positionUnsettlementPnl);
    }, new Decimal(0));
  }, [positions]);

  const currentPosition = useMemo(() => {
    return positions?.find(
      (item) =>
        item.symbol === symbol && item.margin_mode === MarginMode.ISOLATED,
    );
  }, [positions]);

  const notional = useMemo(() => {
    if (!currentPosition) return null;
    return new Decimal(currentPosition.notional);
  }, [currentPosition]);

  const unSettledPnl = useMemo(() => {
    if (!currentPosition || !notional || !fundingRates) return null;
    const fundingRate = fundingRates[currentPosition.symbol];
    // mark_price * position_qty - cost_position - position_qty * (sum_unitary_funding - last_sum_unitary_funding )
    // notional = mark_price * position_qty
    return notional
      .sub(new Decimal(currentPosition.cost_position))
      .sub(
        new Decimal(currentPosition.position_qty).mul(
          new Decimal(fundingRate.sum_unitary_funding ?? 0).sub(
            new Decimal(currentPosition.last_sum_unitary_funding),
          ),
        ),
      );
  }, [notional, currentPosition, fundingRates]);

  const imr = useMemo(() => {
    if (!currentPosition || !symbolsInfo?.[symbol] || !notional) {
      return null;
    }
    const currentSymbolInfo = symbolsInfo[symbol];
    const maxLeverage = Math.max(currentPosition.leverage ?? 1, 1);
    const IMR_Factor =
      accountInfo?.imr_factor?.[symbol] ?? currentSymbolInfo.imr_factor ?? 0;

    return new Decimal(
      account.IMR({
        maxLeverage,
        baseIMR: currentSymbolInfo.base_imr ?? 0,
        IMR_Factor,
        positionNotional: notional.toNumber(),
        ordersNotional: 0,
      }),
    );
  }, [currentPosition, symbolsInfo, symbol, notional, accountInfo]);

  //   console.log(
  //     "positions",
  //     positions?.length,
  //     "notional",
  //     notional?.toNumber(),
  //     "imr",
  //     imr?.toNumber(),
  //     "usdcHolding",
  //     usdcHolding,
  //     "freeCollateral",
  //     freeCollateral,
  //     "total_cross_unsettled_pnl",
  //     total_cross_unsettled_pnl?.toNumber(),
  //   );
  const maxAmount = useMemo(() => {
    if (isAdd) {
      if (!total_cross_unsettled_pnl) return null;
      return account.maxAdd({
        USDCHolding: usdcHolding,
        freeCollateral: freeCollateral,
        totalCrossUnsettledPnL: total_cross_unsettled_pnl.toNumber(),
      });
    }
    if (
      !imr ||
      !notional ||
      isolatedMargin === undefined ||
      isolatedMargin === null ||
      !currentPosition
    ) {
      return null;
    }
    const positionNotional = notional;
    const imrValue = imr;
    const unsettledPnlValue = unSettledPnl ?? new Decimal(0);

    return account.maxReduce({
      isolatedPositionMargin: isolatedMargin,
      positionNotional: positionNotional.toNumber(),
      imr: imrValue.toNumber(),
      positionUnsettledPnL: unsettledPnlValue.toNumber(),
    });
  }, [
    total_cross_unsettled_pnl,
    usdcHolding,
    isAdd,
    freeCollateral,
    unSettledPnl,
    isolatedMargin,
  ]);

  // Calculate liquidation price after margin adjustment
  // Note: This calculation may need review based on liquidation price formula
  // total_collateral_value = isolated margin + unsettled PNL + margin_add
  // after margin adjustment: finalMargin = adjusted position margin, so total = finalMargin + unsettled_PNL (add/reduce margin both)
  const liquidationPrice = useMemo(() => {
    if (
      !totalUnsettlementPnl ||
      !currentPosition ||
      !symbolsInfo?.[symbol] ||
      !accountInfo?.imr_factor
    ) {
      return null;
    }

    const currentSymbolInfo = symbolsInfo[symbol];
    const currentPositionNotional = notional?.toNumber() ?? 0;
    const currentPositionIMRFactor =
      accountInfo.imr_factor[symbol] ?? currentSymbolInfo.imr_factor ?? 0;
    const currentPositionMMR = positionsLib.MMR({
      baseMMR: currentSymbolInfo.base_mmr ?? 0,
      baseIMR: currentSymbolInfo.base_imr ?? 0,
      IMRFactor: currentPositionIMRFactor,
      positionNotional: currentPositionNotional,
      IMR_factor_power: 4 / 5,
    });

    const otherPositions =
      positions
        ?.filter((item) => item.symbol !== symbol)
        .map((item) => {
          const itemSymbolInfo = symbolsInfo[item.symbol];
          const itemIMRFactor =
            accountInfo.imr_factor[item.symbol] ??
            itemSymbolInfo?.imr_factor ??
            0;
          const itemNotional =
            item.notional ??
            new Decimal(item.position_qty)
              .mul(item.mark_price)
              .abs()
              .toNumber();
          const itemMMR =
            item.mmr ??
            positionsLib.MMR({
              baseMMR: itemSymbolInfo?.base_mmr ?? 0,
              baseIMR: itemSymbolInfo?.base_imr ?? 0,
              IMRFactor: itemIMRFactor,
              positionNotional: itemNotional,
              IMR_factor_power: 4 / 5,
            });

          return {
            symbol: item.symbol,
            position_qty: item.position_qty,
            mark_price: item.mark_price,
            mmr: itemMMR,
          };
        }) ?? [];

    const totalCollateral = new Decimal(finalMargin)
      .add(currentPosition.unsettled_pnl ?? 0)
      .toNumber();
    const liqPrice = positionsLib.liqPrice({
      markPrice,
      symbol,
      totalCollateral,
      positionQty: currentPosition.position_qty,
      positions: otherPositions,
      MMR: currentPositionMMR,
      baseMMR: currentSymbolInfo.base_mmr ?? 0,
      baseIMR: currentSymbolInfo.base_imr ?? 0,
      IMRFactor: currentPositionIMRFactor,
      costPosition: currentPosition.cost_position ?? 0,
    });
    return liqPrice;
  }, [
    totalUnsettlementPnl,
    currentPosition,
    symbolsInfo,
    symbol,
    accountInfo,
    notional,
    positions,
    finalMargin,
    markPrice,
  ]);

  const total_collateral_value = useMemo(() => {
    if (!unSettledPnl) return null;
    // Add: finalMargin = isolatedMargin + margin_add
    // Reduce: finalMargin = isolatedMargin - margin_reduction
    // so total_collateral_value = finalMargin + unsettled_pnl
    return new Decimal(finalMargin).add(unSettledPnl).toNumber();
  }, [unSettledPnl, finalMargin]);

  const effectiveLeverage = useMemo(() => {
    if (!notional || !total_collateral_value) return null;
    return notional.div(total_collateral_value).toNumber();
  }, [notional, total_collateral_value]);

  // console.log(
  //   "effectiveLeverage",
  //   effectiveLeverage,
  //   "notional=",
  //   notional?.toNumber(),
  //   "total_collateral_value=",
  //   total_collateral_value,
  //   "isolatedMargin=",
  //   isolatedMargin,
  //   "finalMargin=",
  //   finalMargin,
  //   "unSettledPnl=",
  //   unSettledPnl?.toNumber(),
  // );

  return {
    maxAmount,
    liquidationPrice,
    effectiveLeverage,
  };
};

export default usePositionMargin;
