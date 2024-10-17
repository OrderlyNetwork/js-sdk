import { useMarkPrice } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { Badge, Box, Divider, Flex, Text, useModal } from "@orderly.network/ui";
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
  const modal = useModal();
  const isPositionTPSL = useMemo(() => {
    return modal.args?.title === "Position TP/SL";
  }, [modal.args?.title]);
  return (
    <>
      <Flex justify={"between"} pb={3} itemAlign={"center"}>
        <Text.formatted rule="symbol" className="oui-text-xs" showIcon>
          {position.symbol}
        </Text.formatted>
        <Flex gapX={1}>
          {isPositionTPSL && <Badge size="xs">Position</Badge>}
          <Badge size="xs" color="neutral">
            TP/SL
          </Badge>
          {position.position_qty > 0 ? (
            <Badge size="xs" color="buy">
              Buy
            </Badge>
          ) : (
            <Badge size="xs" color="sell">
              Sell
            </Badge>
          )}
        </Flex>
      </Flex>
      <Divider intensity={8} />
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
    </>
  );
};
