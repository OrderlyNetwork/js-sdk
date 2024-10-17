import { Text, Flex, Divider, Badge } from "@orderly.network/ui";

import { TPSLSheetState } from "./tp_sl_sheet.script";
import { PositionInfo } from "./positionInfo";
import { TPSLWidget, TPSLWidgetProps } from "@orderly.network/ui-tpsl";
import { AlgoOrderRootType } from "@orderly.network/types";

export const TPSLSheetUI = (props: TPSLWidgetProps & TPSLSheetState) => {
  const { position, symbolInfo } = props;

  return (
    <>
      <PositionInfo position={position} symbolInfo={symbolInfo} />

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
