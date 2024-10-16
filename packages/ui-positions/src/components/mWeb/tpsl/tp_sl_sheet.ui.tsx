import { Text, Flex, Divider, Box, Badge } from "@orderly.network/ui";
import {
  TPSLWidget,
  type TPSLWidgetProps,
} from "../../shared/tpsl/tpsl.widget";
import { TPSLSheetState } from "./tp_sl_sheet.script";
import { PositionInfo } from "./positionInfo";

export const TPSLSheetUI = (props: TPSLWidgetProps & TPSLSheetState) => {
  // console.log("TPSLSheetUI", props);
  const { position, symbolInfo } = props;
  return (
    <>
      <Flex justify={"between"} pb={3} itemAlign={"center"}>
        <Text.formatted rule="symbol" className="oui-text-xs" showIcon>
          {position.symbol}
        </Text.formatted>
        <Flex gapX={1}>
          <Badge size="xs" color="neutral">
            TP/SL
          </Badge>
          <Badge size="xs" color="buy">
            Buy
          </Badge>
        </Flex>
      </Flex>
      <Divider intensity={8} />
      <PositionInfo position={position} symbolInfo={symbolInfo} />

      {/* {!props.canModifyQty && <Divider className="oui-mb-3" />} */}
      <TPSLWidget {...props} />
    </>
  );
};
