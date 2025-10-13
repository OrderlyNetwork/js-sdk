import { useMemo } from "react";
import { useLocalStorage, useMarkPrice } from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { AlgoOrderRootType, API, PositionType } from "@kodiak-finance/orderly-types";
import {
  Flex,
  modal,
  useModal,
  Text,
  Box,
  Badge,
  Divider,
  toast,
} from "@kodiak-finance/orderly-ui";
import { TPSLWidget, TPSLWidgetProps } from "./positionTPSL";

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
