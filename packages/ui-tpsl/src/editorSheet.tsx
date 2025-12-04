import { AlgoOrderRootType, API, PositionType } from "@veltodefi/types";
import { useModal } from "@veltodefi/ui";
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
