import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { OrderlyAppProvider } from "../../../components/orderlyProvider/orderlyAppProvider";
import { RouteProvider } from "../../../components/orderlyProvider/rounteProvider";
import { WalletConnectorProvider } from "../../../components/orderlyProvider/walletConnectorProvider";
import { useEnvFormUrl } from "../../hooks/useEnvFormUrl";
import { useNav } from "../../hooks/useNav";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useTheme } from "../../hooks/useTheme";
import { LocaleProvider } from "./localeProvider";

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
};

export const OrderlyProvider: React.FC = () => {
  const { onRouteChange } = useNav();
  usePageTitle();
  useTheme();
  const { networkId, brokerId, brokerName, env, usePrivy } = useEnvFormUrl();

  return (
    <RouteProvider onRouteChange={onRouteChange}>
      <LocaleProvider>
        <WalletConnectorProvider usePrivy={usePrivy}>
          <OrderlyAppProvider
            networkId={networkId}
            brokerId={brokerId}
            brokerName={brokerName}
            env={env}
          >
            <ScrollToTop />
            {/* because the portfolio layout is used in route layout, we need to render the outlet */}
            <Outlet />
          </OrderlyAppProvider>
        </WalletConnectorProvider>
      </LocaleProvider>
    </RouteProvider>
  );
};
