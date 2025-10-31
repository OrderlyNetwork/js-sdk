import React, { useState } from "react";
import { cn, Divider, Tooltip } from "@orderly.network/ui";
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
  badgeCount?: number;
  onClick?: () => void;
}

const MyAgentSection: React.FC<MyAgentSectionProps> = ({
  tooltip = "My agent",
  badgeCount = 99,
  onClick,
}) => {
  return (
    <Tooltip content={tooltip} side="bottom">
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
  onClick?: () => void;
}

const VoiceModeSection: React.FC<VoiceModeSectionProps> = ({
  tooltip = "Enable voice mode",
  onClick,
}) => {
  return (
    <Tooltip content={tooltip} side="bottom">
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
  onClick?: () => void;
  showBadge?: boolean;
  showText?: boolean;
  badgeCount?: number;
  isOpen?: boolean;
}

const SidePanelToggleSection: React.FC<SidePanelToggleSectionProps> = ({
  tooltip = "Toggle Starchild side panel",
  onClick,
  showBadge = false,
  showText = true,
  badgeCount = 99,
  isOpen = false,
}) => {
  return (
    <Tooltip content={tooltip} side="bottom">
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
            "oui-bg-[#f84600] oui-overflow-hidden",
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
  voiceModeTooltip?: string;
  sidePanelTooltip?: string;
  badgeCount?: number;
  onMyAgentClick?: () => void;
  onVoiceModeClick?: () => void;
  onSidePanelClick?: () => void;
  className?: string;
}

export const StarchildControlPanel: React.FC<StarchildControlPanelProps> = ({
  myAgentTooltip = "My agent",
  voiceModeTooltip = "Enable voice mode",
  sidePanelTooltip = "Toggle Starchild side panel",
  badgeCount = 99,
  onMyAgentClick,
  onVoiceModeClick,
  onSidePanelClick,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const handleMyAgentClick = () => {
    console.log("My Agent button clicked");
    onMyAgentClick?.();
  };

  const handleVoiceModeClick = () => {
    console.log("Voice Mode button clicked");
    onVoiceModeClick?.();
  };

  const handleSidePanelClick = () => {
    console.log("Side Panel button clicked");
    setIsSidePanelOpen((prev) => !prev);
    onSidePanelClick?.();
  };

  const handleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
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
              onClick={handleSidePanelClick}
              showBadge={!isSidePanelOpen}
              showText={false}
              badgeCount={badgeCount}
              isOpen={isSidePanelOpen}
            />
          ) : (
            <MyAgentSection
              tooltip={myAgentTooltip}
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
            onClick={handleVoiceModeClick}
          />
          <Divider
            direction="vertical"
            intensity={8}
            className="oui-h-4 oui-shrink-0"
          />
          <SidePanelToggleSection
            tooltip={sidePanelTooltip}
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
  );
};

StarchildControlPanel.displayName = "StarchildControlPanel";
