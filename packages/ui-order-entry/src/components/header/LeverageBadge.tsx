import { useMemo } from "react";
import {
  useLeverageBySymbol,
  useSymbolLeverages,
} from "@orderly.network/hooks";
import { OrderSide } from "@orderly.network/types";
import { cn, Flex, modal, Text, useScreen } from "@orderly.network/ui";
import {
  SymbolLeverageDialogId,
  SymbolLeverageSheetId,
} from "@orderly.network/ui-leverage";
import { Decimal } from "@orderly.network/utils";
import { useCanTrade } from "../../hooks/useCanTrade";

type LeverageBadgeProps = {
  symbol: string;
  side: OrderSide;
};

export const LeverageBadge = (props: LeverageBadgeProps) => {
  const { symbol, side } = props;
  const { isMobile } = useScreen();
  const symbolLeverage = useLeverageBySymbol(symbol);
  const { maxSymbolLeverage } = useSymbolLeverages(symbol);
  const canTrade = useCanTrade();

  const leverage = useMemo(() => {
    return symbolLeverage || maxSymbolLeverage;
  }, [canTrade, symbolLeverage, maxSymbolLeverage]);

  const showModal = () => {
    const modalId = isMobile ? SymbolLeverageSheetId : SymbolLeverageDialogId;
    modal.show(modalId, {
      symbol,
      side,
      curLeverage: leverage,
    });
  };

  return (
    <Flex
      justify="center"
      itemAlign="center"
      gapX={1}
      width="100%"
      className={cn(
        "oui-h-8",
        "oui-rounded oui-border oui-border-line oui-bg-base-6",
        "oui-text-xs oui-font-semibold oui-text-base-contrast-54",
      )}
      onClick={showModal}
    >
      <Text>Cross</Text>

      <Text.numeral dp={0} rm={Decimal.ROUND_DOWN} unit="X">
        {leverage}
      </Text.numeral>
    </Flex>
  );
};
