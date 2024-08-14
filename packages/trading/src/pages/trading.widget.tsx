import { TradingPageProps } from "../types/types";
import { Trading } from "./trading.ui";
import { useAppContext } from "@orderly.network/react-app";

export const TradingWidget = (props: TradingPageProps) => {
  const {wrongNetwork} = useAppContext();
  return <Trading {...props} wrongNetwork={wrongNetwork} />;
};
