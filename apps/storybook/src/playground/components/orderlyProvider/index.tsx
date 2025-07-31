import { Outlet } from "react-router";
import { OrderlyAppProvider } from "../../../components/orderlyProvider/orderlyAppProvider";
import { RouteProvider } from "../../../components/orderlyProvider/rounteProvider";
import { WalletConnectorProvider } from "../../../components/orderlyProvider/walletConnectorProvider";
import { useNav } from "../../hooks/useNav";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useTheme } from "../../hooks/useTheme";
import { LocaleProvider } from "./localeProvider";

export const OrderlyProvider = () => {
  const { onRouteChange } = useNav();
  usePageTitle();
  useTheme();

  return (
    <RouteProvider onRouteChange={onRouteChange}>
      <LocaleProvider>
        <WalletConnectorProvider>
          <OrderlyAppProvider>
            {/* because the portfolio layout is used in route layout, we need to render the outlet */}
            <Outlet />
          </OrderlyAppProvider>
        </WalletConnectorProvider>
      </LocaleProvider>
    </RouteProvider>
  );
};
