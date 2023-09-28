import { useContext } from "react";
import { OrderlyContext, usePreLoadData } from "@orderly.network/hooks";

interface Props {
  onComplete?: () => void;
}

export const PreDataLoader = () => {
  const { onAppTestChange } = useContext(OrderlyContext);

  usePreLoadData(onAppTestChange);
  return null;
};
