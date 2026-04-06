import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { LocaleCode, removeLangPrefix } from "@orderly.network/i18n";
import { OrderlyAppRootProvider } from "../../../components/orderlyProvider/orderlyAppProvider";
import { OrderlyLocaleProvider } from "../../../components/orderlyProvider/orderlyLocaleProvider";
import { RouteProvider } from "../../../components/orderlyProvider/rounteProvider";
import { WalletConnectorProvider } from "../../../components/orderlyProvider/walletConnectorProvider";
import { useIsRwaRoute } from "../../../orderlyConfig/hooks/useIsRwaRoute";
import { useEnvFormUrl } from "../../hooks/useEnvFormUrl";
import { useNav } from "../../hooks/useNav";
import { usePageTitle } from "../../hooks/usePageTitle";

const onLanguageChanged = async (lang: LocaleCode) => {
  const path = removeLangPrefix(window.location.pathname);
  window.history.replaceState({}, "", `/${lang}${path}`);
};

export const OrderlyProvider: React.FC = () => {
  const { onRouteChange } = useNav();
  usePageTitle();
  const { networkId, brokerId, brokerName, env, usePrivy } = useEnvFormUrl();
  const isRwaRoute = useIsRwaRoute();

  return (
    <RouteProvider onRouteChange={onRouteChange}>
      <OrderlyLocaleProvider onLanguageChanged={onLanguageChanged}>
        <WalletConnectorProvider usePrivy={usePrivy} networkId={networkId}>
          <OrderlyAppRootProvider
            networkId={networkId}
            brokerId={brokerId}
            brokerName={brokerName}
            env={env}
            isRwaRoute={isRwaRoute}
          >
            <ScrollToTop />
            {/* because the portfolio layout is used in route layout, we need to render the outlet */}
            <Outlet />
          </OrderlyAppRootProvider>
        </WalletConnectorProvider>
      </OrderlyLocaleProvider>
    </RouteProvider>
  );
};

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
};
