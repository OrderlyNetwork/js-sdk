import React from "react";
import {
  useStarChildWidget,
  Locale as StarLocale,
  destroy,
} from "starchild-widget";
import {
  useAccount,
  useOrderlyContext,
  useWalletConnector,
} from "@orderly.network/hooks";
import { useLocaleCode } from "@orderly.network/i18n";
import { AccountStatusEnum } from "@orderly.network/types";

export const StarChildInitializer: React.FC = () => {
  const { state } = useAccount();
  const { wallet } = useWalletConnector();
  const { keyStore, starChildConfig } = useOrderlyContext();
  const {
    isInitialized,
    init,
    showChatModal,
    setSearchVisible,
    setLocale: setStarChildLocale,
  } = useStarChildWidget();
  const localeCode = useLocaleCode();
  const locale = React.useMemo(
    () => (localeCode?.startsWith("zh") ? "zh" : "en"),
    [localeCode],
  );
  const starLocale = React.useMemo<StarLocale>(
    () => (locale === "zh" ? StarLocale.ZH_CN : StarLocale.EN_US),
    [locale],
  );
  const [hasSideChatContainer, setHasSideChatContainer] =
    React.useState<boolean>(
      !!(
        typeof document !== "undefined" &&
        document.getElementById("sideChatContainer")
      ),
    );

  const getCachedAccountInfo = (address: string): any | null => {
    try {
      const raw = localStorage.getItem(
        "oui.telegramBinding.accountInfo." + address,
      );
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.data ?? null;
    } catch {
      return null;
    }
  };

  const lastInitializedAddressRef = React.useRef<string | null>(null);

  const attemptInit = React.useCallback(
    async (force?: boolean) => {
      // Respect enable flag: do not initialize when disabled
      if (!starChildConfig?.enable) return;
      const address = wallet?.accounts?.[0]?.address;
      if (!address) return;
      if (state.status < AccountStatusEnum.EnableTrading) return;
      if (isInitialized && !force) return;

      const cached = getCachedAccountInfo(address) || {};
      const hasBindOrderly = !!cached.hasBindOrderly;
      const hasOrderlyPrivateKey = !!cached.hasOrderlyPrivateKey;
      if (!hasBindOrderly || !hasOrderlyPrivateKey) return;

      const orderlyKeyPair = keyStore?.getOrderlyKey(address);
      if (!orderlyKeyPair) return;
      const orderlyKey = await orderlyKeyPair.getPublicKey();
      const secretKey = orderlyKeyPair.secretKey;

      const aiChatKey = cached.aiChatKey || "";
      const accountId =
        state.accountId ||
        (address ? keyStore?.getAccountId(address) || undefined : undefined);
      const telegramUserId = cached.telegramUserId || undefined;

      const params = {
        locale: starLocale,
        aiChatKey,
        telegramUserId,
        accountId,
        orderlyKey,
        secretKey,
        onChatModalDockToEdge: (side: "left" | "right") => {
          console.log("[starchild] dock to edge:", side);
          try {
            const event = new CustomEvent("starchild:chatDocked", {
              detail: { side },
            });
            window.dispatchEvent(event);
            showChatModal("sideChatContainer");
          } catch (e) {
            // ignore
          }
        },
        onChatModalDetachFromEdge: () => {
          console.log("[starchild] detach from edge");
          try {
            const event = new CustomEvent("starchild:chatDetached");
            window.dispatchEvent(event);
          } catch (e) {
            // ignore
          }
        },
        onChatModalClose: () => {
          console.log("[starchild] chat closed");
          try {
            const event = new CustomEvent("starchild:chatClosed");
            window.dispatchEvent(event);
          } catch (e) {
            // ignore
          }
        },
        onSearchOpen: () => {
          console.log("[starchild] search opened");
          try {
            const event = new CustomEvent("starchild:searchOpened");
            window.dispatchEvent(event);
          } catch (e) {
            // ignore
          }
        },
        onSearchClose: () => {
          console.log("[starchild] search closed");
          try {
            const event = new CustomEvent("starchild:searchClosed");
            window.dispatchEvent(event);
          } catch (e) {
            // ignore
          }
        },
      } as any;

      try {
        await init(params);
        lastInitializedAddressRef.current = address;
        try {
          const evt = new CustomEvent("starchild:initialized");
          window.dispatchEvent(evt);
        } catch {}
      } catch (e) {
        console.error("Starchild widget init failed:", e);
      }
    },
    [
      wallet?.accounts?.[0]?.address,
      state.status,
      isInitialized,
      keyStore,
      state.accountId,
      init,
      showChatModal,
      starLocale,
      starChildConfig?.enable,
    ],
  );

  React.useEffect(() => {
    attemptInit();
  }, [attemptInit]);

  // Sync starchild locale with page locale
  React.useEffect(() => {
    if (!isInitialized) return;
    try {
      setStarChildLocale?.(starLocale);
    } catch {
      // ignore
    }
  }, [isInitialized, starLocale, setStarChildLocale]);

  // Re-attempt initialization when account info becomes ready in-session
  React.useEffect(() => {
    const handler = () => {
      try {
        const cur = wallet?.accounts?.[0]?.address || null;
        const force = cur && cur !== lastInitializedAddressRef.current;
        attemptInit(!!force);
      } catch {}
    };
    window.addEventListener(
      "starchild:accountInfoReady",
      handler as EventListener,
    );
    return () =>
      window.removeEventListener(
        "starchild:accountInfoReady",
        handler as EventListener,
      );
  }, [attemptInit]);

  // Reinitialize on wallet address change if widget already initialized for a different address
  React.useEffect(() => {
    const reinitOnWalletChange = async () => {
      if (!starChildConfig?.enable) return;
      const address = wallet?.accounts?.[0]?.address || null;
      if (!address) return;
      if (state.status < AccountStatusEnum.EnableTrading) return;
      if (
        lastInitializedAddressRef.current &&
        lastInitializedAddressRef.current !== address
      ) {
        try {
          await destroy();
          try {
            // Explicitly reset global and notify listeners
            (window as any)["__starchild_initialized__"] = false;
            const evt = new CustomEvent("starchild:destroyed");
            window.dispatchEvent(evt);
          } catch {}
          // Reset last-initialized address so a new address can fully re-auth/init
          lastInitializedAddressRef.current = null;
        } catch {}
      }
    };
    reinitOnWalletChange();
  }, [
    wallet?.accounts?.[0]?.address,
    state.status,
    attemptInit,
    starChildConfig?.enable,
  ]);

  // Listen for search open requests from UI and toggle widget search visibility
  React.useEffect(() => {
    const openSearch = () => {
      try {
        setSearchVisible(true);
      } catch {
        // ignore
      }
    };
    window.addEventListener(
      "starchild:openSearch",
      openSearch as EventListener,
    );
    return () => {
      window.removeEventListener(
        "starchild:openSearch",
        openSearch as EventListener,
      );
    };
  }, [setSearchVisible]);

  // Observe DOM to track sideChatContainer mounting/unmounting and reactively place modal
  React.useEffect(() => {
    const updatePresence = () => {
      const exists = !!document.getElementById("sideChatContainer");
      setHasSideChatContainer((prev) => (prev !== exists ? exists : prev));
    };

    updatePresence();

    const observer = new MutationObserver(() => {
      updatePresence();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // When container presence changes, move/show chat accordingly
  React.useEffect(() => {
    if (!isInitialized) return;
    console.log("hasSideChatContainer", hasSideChatContainer);
    try {
      if (hasSideChatContainer) {
        showChatModal("sideChatContainer");
      } else {
        showChatModal();
      }
    } catch {
      // ignore
    }
  }, [hasSideChatContainer, isInitialized, showChatModal]);

  return null;
};
