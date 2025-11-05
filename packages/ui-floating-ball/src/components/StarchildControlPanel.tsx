import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useEventEmitter } from "@orderly.network/hooks";
import { cn, Divider, Tooltip } from "@orderly.network/ui";
import { StarChildInitializer } from "./StarChildInitializer";
import { TelegramBinding } from "./TelegramBinding";
import { TooltipWithShortcut } from "./TooltipWithShortcut";
import {
  SignPostIcon,
  SoundWaveIcon,
  StarchildFlatIcon,
  ChevronCompactRightIcon,
  CloseIcon,
} from "./icons";

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

// My Agent Section Component
interface MyAgentSectionProps {
  tooltip?: string;
  shortcutKeys?: string[];
  badgeCount?: number;
  onClick?: () => void;
}

const MyAgentSection: React.FC<MyAgentSectionProps> = ({
  tooltip = "My agent",
  shortcutKeys,
  badgeCount = 99,
  onClick,
}) => {
  return (
    <Tooltip
      content={<TooltipWithShortcut text={tooltip} keys={shortcutKeys} />}
      side="bottom"
    >
      <button
        onClick={onClick}
        className={cn(
          "oui-group oui-relative oui-shrink-0 oui-w-[18px] oui-h-[18px]",
          "oui-flex oui-items-center oui-justify-center",
          "oui-transition-opacity oui-cursor-pointer",
        )}
        aria-label={tooltip}
      >
        <SignPostIcon
          size={18}
          className="oui-text-base-contrast-36 hover:oui-text-base-contrast oui-transition-colors"
        />
        <NotificationBadge count={badgeCount} />
      </button>
    </Tooltip>
  );
};

// Voice Mode Section Component
interface VoiceModeSectionProps {
  tooltip?: string;
  shortcutKeys?: string[];
  onClick?: () => void;
}

const VoiceModeSection: React.FC<VoiceModeSectionProps> = ({
  tooltip = "Enable voice mode",
  shortcutKeys,
  onClick,
}) => {
  return (
    <Tooltip
      content={<TooltipWithShortcut text={tooltip} keys={shortcutKeys} />}
      side="bottom"
    >
      <button
        onClick={onClick}
        className={cn(
          "oui-shrink-0 oui-w-[18px] oui-h-[18px]",
          "oui-flex oui-items-center oui-justify-center",
          "oui-cursor-pointer",
        )}
        aria-label={tooltip}
      >
        <SoundWaveIcon
          size={18}
          className="oui-text-base-contrast-36 hover:oui-text-base-contrast oui-transition-colors"
        />
      </button>
    </Tooltip>
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
  badgeCount = 99,
  isOpen = false,
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
          {isOpen ? (
            <CloseIcon
              size={18}
              className="oui-w-full oui-h-full oui-object-cover"
            />
          ) : (
            <StarchildFlatIcon
              size={18}
              className="oui-w-full oui-h-full oui-object-cover"
            />
          )}
        </div>
        {showBadge && <NotificationBadge count={badgeCount} />}
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

// Collapse Button Component
interface CollapseButtonProps {
  isCollapsed?: boolean;
  onClick?: () => void;
}

const CollapseButton: React.FC<CollapseButtonProps> = ({
  isCollapsed = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "oui-shrink-0",
        "oui-flex oui-items-center oui-justify-center",
        "oui-cursor-pointer",
      )}
      aria-label={isCollapsed ? "Expand" : "Collapse"}
    >
      <ChevronCompactRightIcon
        size={14}
        className={cn(
          "oui-text-base-contrast-54 hover:oui-text-base-contrast",
          "oui-transition-transform oui-duration-100",
          isCollapsed ? "" : "oui-rotate-180",
        )}
      />
    </button>
  );
};

export interface StarchildControlPanelProps {
  myAgentTooltip?: string;
  myAgentShortcutKeys?: string[];
  voiceModeTooltip?: string;
  voiceModeShortcutKeys?: string[];
  sidePanelTooltip?: string;
  sidePanelShortcutKeys?: string[];
  badgeCount?: number;
  onMyAgentClick?: () => void;
  onVoiceModeClick?: () => void;
  onSidePanelClick?: () => void;
  className?: string;
}

export const StarchildControlPanel: React.FC<StarchildControlPanelProps> = ({
  myAgentTooltip = "My agent",
  myAgentShortcutKeys,
  voiceModeTooltip = "Enable voice mode",
  voiceModeShortcutKeys = ["⌘", "Shift", "W"],
  sidePanelTooltip = "Toggle Starchild side panel",
  sidePanelShortcutKeys = ["⌘", "Shift", "E"],
  badgeCount = 99,
  onMyAgentClick,
  onVoiceModeClick,
  onSidePanelClick,
  className,
}) => {
  const ee = useEventEmitter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isTgDialogOpen, setIsTgDialogOpen] = useState(false);
  const [isTgBound, setIsTgBound] = useState(false);

  // Listen for side panel toggle events to sync state
  React.useEffect(() => {
    const handleToggle = (data: { isOpen: boolean }) => {
      setIsSidePanelOpen(data.isOpen);
    };
    ee.on("sideChatPanel:toggle", handleToggle);
    return () => {
      ee.off("sideChatPanel:toggle", handleToggle);
    };
  }, [ee]);

  // Listen for starchild:chatClosed event to sync state
  React.useEffect(() => {
    const handleChatClosed = () => {
      setIsSidePanelOpen(false);
      ee.emit("sideChatPanel:toggle", { isOpen: false });
    };
    window.addEventListener(
      "starchild:chatClosed",
      handleChatClosed as EventListener,
    );
    return () => {
      window.removeEventListener(
        "starchild:chatClosed",
        handleChatClosed as EventListener,
      );
    };
  }, [ee]);

  // Listen for starchild:accountInfoReady event to track TG binding status
  React.useEffect(() => {
    // Check localStorage for existing binding status
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
            const isVerified = json?.data?.hasVerifiedOrderly;
            setIsTgBound(!!isVerified);
            return !!isVerified;
          }
        }
      } catch (e) {
        console.error("Error checking TG binding status:", e);
      }
      return false;
    };

    // Initial check
    checkBindingStatus();

    const handleAccountInfoReady = () => {
      setIsTgBound(true);
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
  }, []);

  const handleMyAgentClick = () => {
    console.log("My Agent button clicked");
    if (!isTgBound) {
      setIsTgDialogOpen(true);
      return;
    }
    onMyAgentClick?.();
  };

  const handleVoiceModeClick = () => {
    console.log("Voice Mode button clicked");
    if (!isTgBound) {
      setIsTgDialogOpen(true);
      return;
    }
    onVoiceModeClick?.();
  };

  const handleSidePanelClick = () => {
    console.log("Side Panel button clicked");
    if (!isTgBound) {
      setIsTgDialogOpen(true);
      return;
    }
    const newState = !isSidePanelOpen;
    setIsSidePanelOpen(newState);
    ee.emit("sideChatPanel:toggle", { isOpen: newState });
    onSidePanelClick?.();
  };

  const handleCollapse = () => {
    setIsCollapsed((prev) => !prev);
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
                setIsTgBound(true);
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
          "oui-relative oui-z-0 oui-p-px oui-transition-all",
          "before:oui-absolute before:oui-inset-0 before:oui-z-[-1] before:oui-rounded-md before:oui-content-['']",
          "after:oui-absolute after:oui-inset-px after:oui-z-[-1] after:oui-box-border after:oui-rounded-md after:oui-content-['']",
          "oui-starchild-gradient-border",
          className,
        )}
      >
        {/* Background layer between border and content */}
        <div
          className={cn(
            "oui-flex oui-items-center",
            "oui-rounded-md",
            "oui-bg-base-5",
          )}
        >
          {/* Inner container with three sections */}
          <div
            className={cn(
              "oui-flex oui-items-center oui-gap-2 oui-rounded-md oui-relative",
              "oui-bg-base-8 oui-p-[7px]",
              "oui-transition-all oui-duration-100 oui-ease-in-out",
              "oui-overflow-hidden",
            )}
            style={{
              maxWidth: isCollapsed ? "32px" : "166px",
            }}
          >
            {isCollapsed ? (
              <SidePanelToggleSection
                tooltip={sidePanelTooltip}
                shortcutKeys={sidePanelShortcutKeys}
                onClick={handleSidePanelClick}
                showBadge={!isSidePanelOpen}
                showText={false}
                badgeCount={badgeCount}
                isOpen={isSidePanelOpen}
              />
            ) : (
              <MyAgentSection
                tooltip={myAgentTooltip}
                shortcutKeys={myAgentShortcutKeys}
                badgeCount={badgeCount}
                onClick={handleMyAgentClick}
              />
            )}
            <Divider
              direction="vertical"
              intensity={8}
              className="oui-h-4 oui-shrink-0"
            />
            <VoiceModeSection
              tooltip={voiceModeTooltip}
              shortcutKeys={voiceModeShortcutKeys}
              onClick={handleVoiceModeClick}
            />
            <Divider
              direction="vertical"
              intensity={8}
              className="oui-h-4 oui-shrink-0"
            />
            <SidePanelToggleSection
              tooltip={sidePanelTooltip}
              shortcutKeys={sidePanelShortcutKeys}
              onClick={handleSidePanelClick}
              showBadge={false}
              showText={true}
              isOpen={isSidePanelOpen}
            />
          </div>

          {/* Chevron Collapse Button */}
          <CollapseButton isCollapsed={isCollapsed} onClick={handleCollapse} />
        </div>
      </div>
    </>
  );
};

StarchildControlPanel.displayName = "StarchildControlPanel";
