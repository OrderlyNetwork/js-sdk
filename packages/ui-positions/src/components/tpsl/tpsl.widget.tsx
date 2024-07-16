import { API, AlgoOrderRootType } from "@orderly.network/types";
import { TPSL } from "./tpsl.ui";

type Props = {
  symbol: string;
  /**
   * The maximum quantity that can be set for the TP/SL order
   */
  maxQty: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  position: API.Position;
  order?: API.AlgoOrder;
  canModifyQty?: boolean;
  isEditing?: boolean;
  onTypeChange?: (type: AlgoOrderRootType) => void;
  quoteDp?: number;
};

export const TPSLWidget = (props: Props) => {
  return <TPSL />;
};
