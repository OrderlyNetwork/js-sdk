import { FC, ReactNode } from "react";
import { onStorybookRounteChange } from "../../hooks/useStorybookNav";
import { OrderlyAppRootProvider } from "./orderlyAppProvider";
import { OrderlyLocaleProvider } from "./orderlyLocaleProvider";
import { RouteProvider } from "./rounteProvider";
import { ToolbarThemeSync } from "./toolbarThemeSync";
import { WalletConnectorProvider } from "./walletConnectorProvider";

export const OrderlyProvider: FC<{
  children: ReactNode;
  /** Storybook toolbar theme id; applied state-first via ToolbarThemeSync. */
  toolbarThemeId?: string;
}> = (props) => {
  return (
    <RouteProvider onRouteChange={onStorybookRounteChange}>
      <OrderlyLocaleProvider>
        <WalletConnectorProvider>
          <OrderlyAppRootProvider>
            {props.children}
            <ToolbarThemeSync themeId={props.toolbarThemeId} />
          </OrderlyAppRootProvider>
        </WalletConnectorProvider>
      </OrderlyLocaleProvider>
    </RouteProvider>
  );
};
