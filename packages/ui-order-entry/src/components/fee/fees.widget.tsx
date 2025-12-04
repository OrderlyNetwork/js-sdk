import React from "react";
import { pick } from "ramda";
import { useFeeState, useRwaSymbolsInfoStore } from "@veltodefi/hooks";
import { EffectiveFeesWidget } from "./effectiveFee";
import { RegularFeesWidget } from "./regularFee";

const isEffective = (val?: unknown) =>
  typeof val !== "undefined" && val !== null;

export const FeesWidget: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { refereeRebate, ...others } = useFeeState();
  const info = useRwaSymbolsInfoStore();
  const isRwa = info?.[symbol] !== undefined;
  const isEffectiveFee = isEffective(refereeRebate);
  return isEffectiveFee ? (
    <EffectiveFeesWidget
      taker={isRwa ? others.rwaEffectiveTakerFee : others.effectiveTakerFee}
      maker={isRwa ? others.rwaEffectiveMakerFee : others.effectiveMakerFee}
    />
  ) : (
    <RegularFeesWidget
      taker={isRwa ? others.rwaTakerFee : others.takerFee}
      maker={isRwa ? others.rwaMakerFee : others.makerFee}
    />
  );
};
