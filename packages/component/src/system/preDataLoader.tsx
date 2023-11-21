import { useContext } from "react";
import { OrderlyContext, usePreLoadData } from "@orderly.network/hooks";

interface Props {
  onComplete?: () => void;
}

export const PreDataLoader = () => {
  // @ts-ignore
  const { onAppTestChange } = useContext(OrderlyContext);
  // @ts-ignore
  usePreLoadData(onAppTestChange);
  return null;
};
