import { AlgoOrderRootType, API, PositionType } from "@orderly.network/types";
import { useModal } from "@orderly.network/ui";
import { TPSLWidget, TPSLWidgetProps } from "./positionTPSL";

type TPSLSheetProps = {
  order?: API.AlgoOrder;
  symbolInfo: API.SymbolExt;
  isEditing?: boolean;
};

export const PositionTPSLSheet = (props: TPSLWidgetProps & TPSLSheetProps) => {
  const { order, isEditing } = props;
  const { hide } = useModal();

  const isPositionTPSL = isEditing
    ? order?.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
    : undefined;

  return (
    <TPSLWidget
      {...props}
      positionType={
        props.positionType ??
        (isPositionTPSL ? PositionType.FULL : PositionType.PARTIAL)
      }
      onCancel={hide}
    />
  );
};
