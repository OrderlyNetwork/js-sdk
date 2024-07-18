import { API, AlgoOrderRootType } from "@orderly.network/types";
import { TPSL } from "./tpsl.ui";
import { TPSLBuilderOptions, useTPSLBuilder } from "./useTPSL.script";

type Props = {
  // symbol: string;
  // /**
  //  * The maximum quantity that can be set for the TP/SL order
  //  */
  // maxQty: number;
  // // onSuccess?: () => void;
  // // onCancel?: () => void;
  // position: API.Position;
  // order?: API.AlgoOrder;
  // canModifyQty?: boolean;
  // isEditing?: boolean;
  // onTypeChange?: (type: AlgoOrderRootType) => void;
  // quoteDp?: number;
} & TPSLBuilderOptions;

export const TPSLWidget = (props: Props) => {
  const state = useTPSLBuilder(props);
  return <TPSL {...state} />;
};
