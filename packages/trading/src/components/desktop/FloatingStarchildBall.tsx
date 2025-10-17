import React from "react";
import { useAccount, useWalletConnector } from "@orderly.network/hooks";
import { AccountStatusEnum, ChainNamespace } from "@orderly.network/types";
import { StarChildInitializer } from "./StarChildInitializer";

const LazyFloatingBall = React.lazy(() =>
  import("@orderly.network/ui-floating-ball").then((mod) => ({
    default: mod.FloatingStarchildBall,
  })),
);

const LazyTelegramBinding = React.lazy(() =>
  import("@orderly.network/ui-floating-ball").then((mod) => ({
    default: mod.TelegramBinding,
  })),
);

export const FloatingStarchildBall: React.FC = () => {
  const { state } = useAccount();
  const { namespace } = useWalletConnector();
  const [hiddenByInitEvent, setHiddenByInitEvent] = React.useState(false);

  const tradingEnabledOnEvm =
    (state.status >= AccountStatusEnum.EnableTrading ||
      state.status === AccountStatusEnum.EnableTradingWithoutConnected) &&
    namespace === ChainNamespace.evm;

  React.useEffect(() => {
    const handler = () => setHiddenByInitEvent(true);
    window.addEventListener("starchild:initialized", handler as EventListener);
    return () =>
      window.removeEventListener(
        "starchild:initialized",
        handler as EventListener,
      );
  }, []);

  React.useEffect(() => {
    const onDestroyed = () => setHiddenByInitEvent(false);
    window.addEventListener(
      "starchild:destroyed",
      onDestroyed as EventListener,
    );
    return () =>
      window.removeEventListener(
        "starchild:destroyed",
        onDestroyed as EventListener,
      );
  }, []);

  if (!tradingEnabledOnEvm) return null;

  return (
    <React.Suspense fallback={null}>
      <StarChildInitializer />
      <LazyFloatingBall
        label="Connect Telegram"
        positionStorageKey="ORDERLY_FLOATING_DIALOG_TELEGRAM"
        visible={!hiddenByInitEvent}
      >
        {({ startDragging, dragging }) => (
          <React.Suspense fallback={null}>
            <LazyTelegramBinding
              startDragging={startDragging}
              dragging={dragging}
              onTelegramConnected={(telegramData: any) => {
                console.log("Telegram connected:", telegramData);
              }}
              onWalletConnected={(walletData: any) => {
                console.log("Wallet connected:", walletData);
              }}
              onBindingComplete={(bindingData: any) => {
                console.log("Accounts bound successfully:", bindingData);
              }}
            />
          </React.Suspense>
        )}
      </LazyFloatingBall>
    </React.Suspense>
  );
};
