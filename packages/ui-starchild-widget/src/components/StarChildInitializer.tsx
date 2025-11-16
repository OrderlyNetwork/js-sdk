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
  useEventEmitter,
} from "@orderly.network/hooks";
import { useLocaleCode } from "@orderly.network/i18n";
import { AccountStatusEnum } from "@orderly.network/types";

export const StarChildInitializer: React.FC = () => {
  const { state } = useAccount();
  const { wallet } = useWalletConnector();
  const { keyStore, starChildConfig } = useOrderlyContext();
  const ee = useEventEmitter();
  const {
    isInitialized,
    init,
    showChat,
    setChatVisible,
    setSearchVisible,
    showMyAgent,
    getVoiceShortcut,
    getChatShortcut,
    getUnreadCount,
    setLocale: setStarChildLocale,
    triggerVoiceRecording,
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
      const hasTelegramBinding = !!cached.telegramUserId;
      const hasOrderlyPrivateKey = !!cached.hasOrderlyPrivateKey;
      const hasVerifiedOrderly = !!cached.hasVerifiedOrderly;

      if (!hasOrderlyPrivateKey || !hasVerifiedOrderly) return;

      const orderlyKeyPair = keyStore?.getOrderlyKey(address);
      if (!orderlyKeyPair) return;
      const orderlyKey = await orderlyKeyPair.getPublicKey();
      const secretKey = orderlyKeyPair.secretKey;

      const aiChatKey = cached.aiChatKey || "";
      const accountId =
        state.accountId ||
        (address ? keyStore?.getAccountId(address) || undefined : undefined);
      const telegramUserId = cached.telegramUserId || undefined;
      const userInfoId = cached.userInfoId || undefined;

      const params = {
        locale: starLocale,
        aiChatKey,
        telegramUserId,
        userInfoId,
        accountId,
        orderlyKey,
        secretKey,
        onChatShow: () => {
          console.log("[starchild] chat shown");
          try {
            setChatVisible(true);
            ee.emit("starchild:chatStateChanged", { isOpen: true });
            if (typeof window !== "undefined") {
              if (window.innerWidth > 1440) {
                showChat("sideChatContainer");
              } else {
                showChat();
              }
            }
          } catch (e) {
            // ignore
          }
        },
        onChatHide: () => {
          console.log("[starchild] chat hidden");
          try {
            setChatVisible(false);
            ee.emit("starchild:chatStateChanged", { isOpen: false });
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
        onMarketSwitch: (symbol: string) => {
          console.log("[starchild] market switched:", symbol);
          try {
            const event = new CustomEvent("starchild:marketSwitched", {
              detail: { symbol },
            });
            window.dispatchEvent(event);
          } catch (e) {
            // ignore
          }
        },
        onVoiceShortcutChange: (voiceShortcut: string) => {
          console.log("语音快捷键已更改:", voiceShortcut);
          try {
            ee.emit("starchild:voiceShortcutChanged", { voiceShortcut });
          } catch (e) {
            // ignore
          }
        },
        onChatShortcutChange: (chatShortcut: string) => {
          console.log("聊天快捷键已更改:", chatShortcut);
          try {
            ee.emit("starchild:chatShortcutChanged", { chatShortcut });
          } catch (e) {
            // ignore
          }
        },
        onUnreadCountChange: (unreadCount: number) => {
          console.log("未读数已更改:", unreadCount);
          try {
            ee.emit("starchild:unreadCountChanged", { unreadCount });
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
      showChat,
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

  // Listen for request to show chat
  React.useEffect(() => {
    const handleRequestShowChat = () => {
      try {
        if (window.innerWidth > 1440) {
          console.log(
            "[StarChildInitializer] Showing chat in sideChatContainer (screen width:",
            window.innerWidth,
            ")",
          );
          showChat("sideChatContainer");
        } else {
          console.log(
            "[StarChildInitializer] Showing chat in modal (screen width:",
            window.innerWidth,
            ")",
          );
          showChat();
        }
      } catch (e) {
        console.error(
          "[StarChildInitializer] Error handling requestShowChat:",
          e,
        );
      }
    };

    window.addEventListener(
      "starchild:requestShowChat",
      handleRequestShowChat as EventListener,
    );

    return () => {
      window.removeEventListener(
        "starchild:requestShowChat",
        handleRequestShowChat as EventListener,
      );
    };
  }, [showChat]);

  // Listen for request to hide chat
  React.useEffect(() => {
    const handleRequestHideChat = () => {
      try {
        console.log("[StarChildInitializer] Hiding chat");
        setChatVisible(false);
      } catch (e) {
        console.error(
          "[StarChildInitializer] Error handling requestHideChat:",
          e,
        );
      }
    };

    window.addEventListener(
      "starchild:requestHideChat",
      handleRequestHideChat as EventListener,
    );

    return () => {
      window.removeEventListener(
        "starchild:requestHideChat",
        handleRequestHideChat as EventListener,
      );
    };
  }, [setChatVisible]);

  // Listen for request to trigger voice recording
  React.useEffect(() => {
    const handleRequestVoiceRecording = () => {
      try {
        console.log("[StarChildInitializer] Triggering voice recording");
        setChatVisible(true);
        // Then show the chat
        if (window.innerWidth > 1440) {
          console.log(
            "[StarChildInitializer] Showing chat in sideChatContainer for voice (screen width:",
            window.innerWidth,
            ")",
          );
          showChat("sideChatContainer");
        } else {
          console.log(
            "[StarChildInitializer] Showing chat in modal for voice (screen width:",
            window.innerWidth,
            ")",
          );
          showChat();
        }
        // Then trigger voice recording
        triggerVoiceRecording();
      } catch (e) {
        console.error(
          "[StarChildInitializer] Error handling requestVoiceRecording:",
          e,
        );
      }
    };

    window.addEventListener(
      "starchild:requestVoiceRecording",
      handleRequestVoiceRecording as EventListener,
    );

    return () => {
      window.removeEventListener(
        "starchild:requestVoiceRecording",
        handleRequestVoiceRecording as EventListener,
      );
    };
  }, [showChat, setChatVisible, triggerVoiceRecording]);

  // Listen for request to show my agent
  React.useEffect(() => {
    const handleRequestShowMyAgent = () => {
      try {
        console.log("[StarChildInitializer] Showing My Agent");
        // First set chat visible
        setChatVisible(true);
        // Then show the chat
        if (window.innerWidth > 1440) {
          console.log(
            "[StarChildInitializer] Showing chat in sideChatContainer for My Agent (screen width:",
            window.innerWidth,
            ")",
          );
          showChat("sideChatContainer");
        } else {
          console.log(
            "[StarChildInitializer] Showing chat in modal for My Agent (screen width:",
            window.innerWidth,
            ")",
          );
          showChat();
        }
        // Then show My Agent panel
        showMyAgent();
      } catch (e) {
        console.error(
          "[StarChildInitializer] Error handling requestShowMyAgent:",
          e,
        );
      }
    };

    window.addEventListener(
      "starchild:requestShowMyAgent",
      handleRequestShowMyAgent as EventListener,
    );

    return () => {
      window.removeEventListener(
        "starchild:requestShowMyAgent",
        handleRequestShowMyAgent as EventListener,
      );
    };
  }, [showChat, setChatVisible, showMyAgent]);

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
      if (hasSideChatContainer && window.innerWidth > 1440) {
        showChat("sideChatContainer");
      } else {
        showChat();
      }
    } catch {
      // ignore
    }
  }, [hasSideChatContainer, isInitialized, showChat]);

  return null;
};
