import { FC } from "react";
import { Box, Flex, Text } from "@orderly.network/ui";
import { TradingV2State } from "./tradingV2.script";
import { DataListWidget } from "../components/dataList";

export const TradingV2: FC<TradingV2State> = (props) => {
  return (
    <Flex direction={"column"} >
      <Box p={3} width={"100%"}>
        <Box className="oui-bg-base-9 oui-rounded-2xl oui-p-3">
          <DataListWidget {...props.dataList} />
        </Box>
      </Box>
    </Flex>
  );
};