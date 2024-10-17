import { useMarkPrice } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { Box, Flex, Text, useModal } from "@orderly.network/ui";
import { useEffect, useMemo, useState } from "react";

export const TPSLSheetTitle = () => {
  const modal = useModal();

  const title = useMemo<string>(() => {
    return (modal.args?.title || "TP/SL") as string;
  }, [modal.args?.title]);

  return <span>{title}</span>;
};

export const PositionInfo = (props: {
  position: API.Position;
  symbolInfo: API.SymbolExt;
}) => {
  const { position, symbolInfo } = props;
  const { data: markPrice } = useMarkPrice(position.symbol);
  return (
    <Box py={3}>
      <Flex justify={"between"}>
        <Text size="sm" intensity={54}>
          Avg. open
        </Text>
        <Text.numeral
          className="oui-text-xs"
          unit={symbolInfo.quote}
          dp={symbolInfo.quote_dp}
          unitClassName="oui-ml-1 oui-text-base-contrast-36"
        >
          {position.average_open_price}
        </Text.numeral>
      </Flex>
      <Flex justify={"between"}>
        <Text size="sm" intensity={54}>
          Mark price
        </Text>
        <Text.numeral
          className="oui-text-xs"
          unit={symbolInfo.quote}
          dp={symbolInfo.quote_dp}
          unitClassName="oui-ml-1 oui-text-base-contrast-36"
        >
          {markPrice}
        </Text.numeral>
      </Flex>
    </Box>
  );
};
