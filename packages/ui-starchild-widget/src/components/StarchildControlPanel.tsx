import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useStarChildWidget } from "starchild-widget";
import { useEventEmitter, useWalletConnector } from "@orderly.network/hooks";
import { ChainNamespace } from "@orderly.network/types";
import { cn, Tooltip } from "@orderly.network/ui";
import { StarChildInitializer } from "./StarChildInitializer";
import { TelegramBinding } from "./TelegramBinding";
import { TooltipWithShortcut } from "./TooltipWithShortcut";

const STARCHILD_ROBOT_SRC =
  "https://storage.googleapis.com/oss.orderly.network/static/starchild/starchildRobot.png";

// Badge Component
interface NotificationBadgeProps {
  count?: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count = 0 }) => {
  return (
    <div
      className={cn(
        "oui-absolute oui-left-[10px] -oui-top-[6px]",
        "oui-bg-primary-darken oui-rounded-full",
        "oui-flex oui-items-center oui-justify-center",
        "oui-min-w-[14px] oui-h-[14px]",
        "oui-px-0.5",
        "oui-text-[10px] oui-leading-[10px] oui-font-normal",
        "oui-text-white",
      )}
    >
      {count > 99 ? "99" : count}
    </div>
  );
};

// Side Panel Toggle Section Component
interface SidePanelToggleSectionProps {
  tooltip?: string;
  shortcutKeys?: string[];
  onClick?: () => void;
  showBadge?: boolean;
  showText?: boolean;
  badgeCount?: number;
  isOpen?: boolean;
}

const SidePanelToggleSection: React.FC<SidePanelToggleSectionProps> = ({
  tooltip = "Toggle Starchild side panel",
  shortcutKeys,
  onClick,
  showBadge = false,
  showText = true,
  badgeCount = 0,
}) => {
  return (
    <Tooltip
      content={<TooltipWithShortcut text={tooltip} keys={shortcutKeys} />}
      side="bottom"
    >
      <button
        onClick={onClick}
        className={cn(
          "oui-shrink-0 oui-flex oui-items-center oui-gap-1",
          "oui-cursor-pointer",
          "oui-relative",
        )}
        aria-label={tooltip}
      >
        <div
          className={cn(
            "oui-w-[18px] oui-h-[18px] oui-shrink-0 oui-rounded",
            "oui-overflow-hidden",
            "oui-flex oui-items-center oui-justify-center",
          )}
        >
          <img
            src={STARCHILD_ROBOT_SRC}
            alt="Starchild"
            width={18}
            height={18}
            className="oui-w-full oui-h-full oui-object-cover"
          />
        </div>
        {showBadge && badgeCount > 0 && (
          <NotificationBadge count={badgeCount} />
        )}
        {showText && (
          <span
            className={cn(
              "oui-text-2xs oui-leading-[18px] oui-font-medium",
              "oui-text-base-contrast-36 hover:oui-text-base-contrast oui-tracking-[0.36px]",
              "oui-whitespace-nowrap",
            )}
          >
            Starchild
          </span>
        )}
      </button>
    </Tooltip>
  );
};

export interface StarchildControlPanelProps {
  sidePanelTooltip?: string;
  className?: string;
}

export const StarchildControlPanel: React.FC<StarchildControlPanelProps> = ({
  sidePanelTooltip = "Toggle Starchild side panel",
  className,
}) => {
  const ee = useEventEmitter();
  const { namespace } = useWalletConnector();
  const { getChatShortcut, getUnreadCount, setChatVisible, setSearchVisible } =
    useStarChildWidget();
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isTgDialogOpen, setIsTgDialogOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [badgeCount, setBadgeCount] = useState(getUnreadCount());
  const [chatShortcut, setChatShortcut] = useState(getChatShortcut());
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1920,
  );

  React.useEffect(() => {
    return () => {
      try {
        setChatVisible?.(false);
        setSearchVisible?.(false);
        ee.emit("sideChatPanel:toggle", { isOpen: false });
      } catch {
        // ignore
      }
    };
  }, [ee, setChatVisible, setSearchVisible]);

  // Listen to single source of truth: widget state changes
  React.useEffect(() => {
    const handleChatStateChanged = (data: { isOpen: boolean }) => {
      setIsSidePanelOpen(data.isOpen);
      ee.emit("sideChatPanel:toggle", { isOpen: data.isOpen });
    };
    ee.on("starchild:chatStateChanged", handleChatStateChanged);
    return () => {
      ee.off("starchild:chatStateChanged", handleChatStateChanged);
    };
  }, [ee]);

  React.useEffect(() => {
    const checkBindingStatus = () => {
      try {
        const keys = Object.keys(localStorage);
        const accountInfoKey = keys.find((key) =>
          key.startsWith("oui.telegramBinding.accountInfo."),
        );
        if (accountInfoKey) {
          const data = localStorage.getItem(accountInfoKey);
          if (data) {
            const json = JSON.parse(data);
            const isSolana = namespace === ChainNamespace.solana;
            const verified = isSolana
              ? !!json?.data?.hasVerifiedSolanaOrderly ||
                !!json?.data?.hasVerifiedOrderly
              : !!json?.data?.hasVerifiedOrderly;
            setIsVerified(verified);
            return verified;
          }
        }
      } catch (e) {
        console.error("Error checking verification status:", e);
      }
      return false;
    };
    checkBindingStatus();

    const handleAccountInfoReady = () => {
      setIsVerified(true);
    };

    window.addEventListener(
      "starchild:accountInfoReady",
      handleAccountInfoReady as EventListener,
    );

    return () => {
      window.removeEventListener(
        "starchild:accountInfoReady",
        handleAccountInfoReady as EventListener,
      );
    };
  }, [namespace]);

  // Listen for widget configuration changes via EventEmitter
  React.useEffect(() => {
    const handleChatShortcutChanged = (data: { chatShortcut: string }) => {
      setChatShortcut(data.chatShortcut);
    };
    ee.on("starchild:chatShortcutChanged", handleChatShortcutChanged);
    return () => {
      ee.off("starchild:chatShortcutChanged", handleChatShortcutChanged);
    };
  }, [ee]);

  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    // Set initial width
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSidePanelClick = () => {
    if (!isVerified) {
      setIsTgDialogOpen(true);
      return;
    }
    const newState = !isSidePanelOpen;
    setIsSidePanelOpen(newState);
    ee.emit("sideChatPanel:toggle", { isOpen: newState });

    try {
      if (newState) {
        const event = new CustomEvent("starchild:requestShowChat", {
          detail: { isOpen: true },
        });
        window.dispatchEvent(event);
      } else {
        const dispatchHide = () => {
          const event = new CustomEvent("starchild:requestHideChat", {
            detail: { isOpen: false },
          });
          window.dispatchEvent(event);
        };

        if (window.innerWidth > 1440) {
          setTimeout(dispatchHide, 200);
        } else {
          dispatchHide();
        }
      }
    } catch (e) {
      console.error("Error dispatching chat event:", e);
    }
  };

  const handleTgDialogClose = () => {
    setIsTgDialogOpen(false);
  };

  return (
    <>
      <StarChildInitializer />
      <Dialog.Root open={isTgDialogOpen} onOpenChange={setIsTgDialogOpen}>
        <Dialog.Portal>
          <Dialog.Content
            className="oui-fixed oui-z-[101] oui-bg-base-9"
            style={{
              bottom: "38px",
              right: "12px",
              pointerEvents: "auto",
            }}
          >
            <TelegramBinding
              onTelegramConnected={(telegramData: any) => {
                console.log("Telegram connected:", telegramData);
              }}
              onWalletConnected={(walletData: any) => {
                console.log("Wallet connected:", walletData);
              }}
              onBindingComplete={(bindingData: any) => {
                console.log("Accounts bound successfully:", bindingData);
                setIsVerified(true);
                setIsTgDialogOpen(false);
              }}
              onClose={handleTgDialogClose}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <div
        className={cn(
          "oui-flex oui-items-center oui-rounded-md",
          "oui-relative oui-z-0 oui-transition-all",
          "oui-p-px",
          !isSidePanelOpen &&
            "before:oui-absolute before:oui-inset-0 before:oui-z-[-1] before:oui-rounded-md before:oui-content-['']",
          !isSidePanelOpen &&
            "after:oui-absolute after:oui-inset-px after:oui-z-[-1] after:oui-box-border after:oui-rounded-md after:oui-content-['']",
          !isSidePanelOpen && "oui-starchild-gradient-border",
          className,
        )}
      >
        <div
          className={cn(
            "oui-flex oui-items-center",
            "oui-bg-base-8 oui-rounded-md oui-p-1.5",
          )}
        >
          <SidePanelToggleSection
            tooltip={sidePanelTooltip}
            shortcutKeys={["⌘", "Shift", chatShortcut]}
            onClick={handleSidePanelClick}
            showBadge={true}
            badgeCount={badgeCount}
            showText={windowWidth >= 1280}
            isOpen={isSidePanelOpen}
          />
        </div>
      </div>
    </>
  );
};

StarchildControlPanel.displayName = "StarchildControlPanel";
