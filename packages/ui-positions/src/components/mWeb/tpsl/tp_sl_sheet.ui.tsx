import { Text, Flex, Divider, Badge } from "@orderly.network/ui";

import { TPSLSheetState } from "./tp_sl_sheet.script";
import { PositionInfo } from "./positionInfo";
import { TPSLWidget, TPSLWidgetProps } from "@orderly.network/ui-tpsl";
import { AlgoOrderRootType } from "@orderly.network/types";

export const TPSLSheetUI = (props: TPSLWidgetProps & TPSLSheetState) => {
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
      <PositionInfo position={position} symbolInfo={symbolInfo} />

      {/* {!props.canModifyQty && <Divider className="oui-mb-3" />} */}
      <TPSLWidget
        {...props}
        onTPSLTypeChange={(type) => {
          props.updateSheetTitle(
            type === AlgoOrderRootType.TP_SL ? "TP/SL" : "Position TP/SL"
          );
        }}
      />
    </>
  );
};
