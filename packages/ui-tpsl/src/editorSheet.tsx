import { useMemo } from "react";
import { useLocalStorage, useMarkPrice } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { AlgoOrderRootType, API, PositionType } from "@orderly.network/types";
import {
  Flex,
  modal,
  useModal,
  Text,
  Box,
  Badge,
  Divider,
  toast,
} from "@orderly.network/ui";
import { PositionTPSLConfirm } from "./tpsl.ui";
import { TPSLWidget, TPSLWidgetProps } from "./tpsl.widget";

type TPSLSheetProps = {
  order?: API.AlgoOrder;
  // label: string;
  // baseDP?: number;
  // quoteDP?: number;
  symbolInfo: API.SymbolExt;
  isEditing?: boolean;
};

export const PositionTPSLSheet = (props: TPSLWidgetProps & TPSLSheetProps) => {
  const { position, order, symbolInfo, isEditing } = props;
  const { resolve, hide, updateArgs } = useModal();

  const isPositionTPSL = isEditing
    ? order?.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
    : undefined;

  return (
    <>
      <TPSLWidget
        {...props}
        positionType={
          props.positionType ??
          (isPositionTPSL ? PositionType.FULL : PositionType.PARTIAL)
        }
        onCancel={() => {
          hide();
        }}
      />
    </>
  );
};
