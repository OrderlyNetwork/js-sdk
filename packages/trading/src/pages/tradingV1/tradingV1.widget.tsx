import { TradingPageV1Props } from "../../types/types";
import { Trading } from "./tradingV1.ui";
import { useAppContext } from "@orderly.network/react-app";

export const TradingWidget = (props: TradingPageV1Props) => {
  const { wrongNetwork } = useAppContext();
  return <Trading {...props} wrongNetwork={wrongNetwork} />;
};
