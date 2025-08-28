import { Outlet } from "react-router";
import { OrderlyAppProvider } from "../../../components/orderlyProvider/orderlyAppProvider";
import { RouteProvider } from "../../../components/orderlyProvider/rounteProvider";
import { WalletConnectorProvider } from "../../../components/orderlyProvider/walletConnectorProvider";
import { useEnvFormUrl } from "../../hooks/useEnvFormUrl";
import { useNav } from "../../hooks/useNav";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useTheme } from "../../hooks/useTheme";
import { LocaleProvider } from "./localeProvider";

export const OrderlyProvider = () => {
  const { onRouteChange } = useNav();
  usePageTitle();
  useTheme();
  const {
    networkId,
    brokerId,
    brokerName,
    env,
    usePrivy,
    amplitudeId = "4463418c103f3a66c6d863357f951e25",
  } = useEnvFormUrl();

  return (
    <RouteProvider onRouteChange={onRouteChange}>
      <LocaleProvider>
        <WalletConnectorProvider usePrivy={usePrivy}>
          <OrderlyAppProvider
            networkId={networkId}
            brokerId={brokerId}
            brokerName={brokerName}
            env={env}
            amplitudeId={amplitudeId}
          >
            {/* because the portfolio layout is used in route layout, we need to render the outlet */}
            <Outlet />
          </OrderlyAppProvider>
        </WalletConnectorProvider>
      </LocaleProvider>
    </RouteProvider>
  );
};
