import { FC, useId, useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { AnnouncementType } from "@orderly.network/types";
import { Flex, Text, ChevronDownIcon, cn } from "@orderly.network/ui";
import { formatMaintenanceTime } from "../../utils/maintenanceTime";
import { AnnouncementSourceBadge } from "../announcementSourceBadge";
import {
  AnnouncementIcon,
  ArrowRightShortIcon,
  CampaignIcon,
  FundIcon,
  SecurityIcon,
} from "./icons";

function getAnnouncementIcon(type: AnnouncementType | undefined | null) {
  switch (type) {
    case AnnouncementType.Campaign:
      return CampaignIcon;

    case AnnouncementType.Listing:
      return FundIcon;
    case AnnouncementType.Maintenance:
      return SecurityIcon;
    case AnnouncementType.Delisting:
    default:
      return AnnouncementIcon;
  }
}

/**
 * Controlled expandable row for legacy messages and maintenance reminders.
 * The host owns expanded state and link handling. Maintenance uses the UTC start/end window.
 * @returns A message row with optional campaign/vote action and source badge.
 */
export const AnnouncementItem: FC<{
  /** Controlled expansion state; changed through onExpandToggle. */
  expanded: boolean;
  /** Campaign/vote action destination; absent/empty hides the action. */
  url?: string | null;
  /** Handles campaign/vote URL clicks without toggling expansion. */
  onItemClick: (url: string) => void;
  /** Requests that the host toggle expanded; omitted means no expansion action. */
  onExpandToggle?: () => void;
  /** Legacy type determining title and icon; null/undefined uses general presentation. */
  type: AnnouncementType | undefined | null;
  /** Localized message body. */
  message: string;
  /** Display timestamp in milliseconds for non-maintenance rows. */
  updatedTime: number;
  /** Maintenance start timestamp in milliseconds. */
  startTime?: number;
  /** Maintenance end timestamp in milliseconds. */
  endTime?: number;
  /** Additional row classes. */
  className?: string;
  /**
   * Use divided-list styling.
   * @default false
   */
  showDivider?: boolean;
  /** Known source identity; undefined hides the badge. */
  isOfficial?: boolean;
  /** Platform label; absent/blank uses the translated fallback. */
  platformName?: string;
  /**
   * Display the badge when identity is known.
   * @default true
   */
  showSourceBadge?: boolean;
}> = (props) => {
  const { t } = useTranslation();
  const contentId = useId();

  const title = useMemo(() => {
    switch (props.type) {
      case AnnouncementType.Campaign:
        return t("notification.campaign");
      case AnnouncementType.Delisting:
        return t("notification.delisting");
      case AnnouncementType.Listing:
        return t("notification.listing");
      case AnnouncementType.Maintenance:
        return t("notification.maintenance");
      case AnnouncementType.Vote:
        return t("notification.vote");
      default:
        return t("notification.general");
    }
  }, [props.type, t]);

  const updateTime = useMemo(() => {
    if (props.type === AnnouncementType.Maintenance) {
      const maintenanceTime = formatMaintenanceTime(
        props.startTime,
        props.endTime,
      );
      if (!maintenanceTime) {
        return null;
      }

      return (
        <Text size="2xs" intensity={36} className="oui-whitespace-normal">
          <span dir="ltr">{maintenanceTime}</span>
        </Text>
      );
    }
    return (
      <Text.formatted
        size="2xs"
        intensity={36}
        rule="date"
        formatString="yyyy-MM-dd HH:mm:ss"
      >
        {props.updatedTime}
      </Text.formatted>
    );
  }, [props.updatedTime, props.type, props.startTime, props.endTime]);

  if (props.type === AnnouncementType.Maintenance) {
    return (
      <div
        className={cn(
          "oui-announcement-maintenance oui-min-w-0 oui-rounded-md oui-text-base-contrast-80 oui-transition-colors hover:oui-bg-base-6",
          props.expanded && "oui-bg-base-6",
          props.className,
        )}
      >
        <button
          type="button"
          aria-expanded={props.expanded}
          aria-controls={contentId}
          onClick={props.onExpandToggle}
          className="oui-flex oui-w-full oui-items-center oui-gap-2 oui-rounded-md oui-px-2 oui-py-3 oui-text-start focus-visible:oui-outline focus-visible:oui-outline-2 focus-visible:oui-outline-primary"
        >
          <span className="oui-flex oui-min-w-0 oui-flex-1 oui-flex-col oui-items-start oui-gap-1 oui-break-words [overflow-wrap:anywhere]">
            {props.showSourceBadge !== false && (
              <AnnouncementSourceBadge
                isOfficial={props.isOfficial}
                platformName={props.platformName}
                className="oui-self-start"
              />
            )}
            <span className="oui-flex oui-max-w-full oui-items-center oui-gap-1">
              <Text
                size="xs"
                intensity={80}
                weight="semibold"
                className="oui-min-w-0"
              >
                {title}
              </Text>
              <SecurityIcon
                size={14}
                color="inherit"
                className="oui-shrink-0 oui-text-base-contrast-54"
                aria-hidden="true"
              />
            </span>
            {updateTime}
          </span>
          <ChevronDownIcon
            size={18}
            color="inherit"
            opacity={1}
            aria-hidden="true"
            className={cn(
              "oui-shrink-0 oui-text-base-contrast-54 oui-transition-transform oui-duration-300 oui-ease-in-out motion-reduce:oui-transition-none",
              props.expanded && "oui-rotate-180",
            )}
          />
        </button>
        <div
          id={contentId}
          aria-hidden={!props.expanded}
          className="oui-grid oui-transition-[grid-template-rows] oui-duration-300 oui-ease-in-out motion-reduce:oui-transition-none"
          style={{ gridTemplateRows: props.expanded ? "1fr" : "0fr" }}
        >
          <div className="oui-min-h-0 oui-min-w-0 oui-overflow-hidden">
            <Text
              as="div"
              size="2xs"
              intensity={80}
              className="oui-select-text oui-whitespace-pre-wrap oui-break-words oui-px-2 oui-pb-3 oui-leading-5 [overflow-wrap:anywhere]"
            >
              {props.message}
            </Text>
          </div>
        </div>
      </div>
    );
  }

  const Icon = getAnnouncementIcon(props.type);

  const action =
    (props.type === AnnouncementType.Campaign ||
      props.type === AnnouncementType.Vote) &&
    typeof props.url === "string" &&
    props.url !== "" &&
    typeof props.onItemClick === "function" ? (
      <Flex
        gap={1}
        itemAlign="center"
        className="oui-cursor-pointer"
        onClick={(event) => {
          event.stopPropagation();
          props.onItemClick(props.url!);
        }}
      >
        <Text
          size="xs"
          color="buy"
          className="oui-bg-clip-text oui-text-transparent oui-gradient-brand"
        >
          {t("notification.joinNow")}
        </Text>
        <ArrowRightShortIcon size={18} />
      </Flex>
    ) : null;

  return (
    <Flex
      gap={2}
      itemAlign="start"
      className={cn(
        "oui-px-2 oui-py-[6px] oui-text-base-contrast-80",
        !props.showDivider && "oui-rounded-md hover:oui-bg-base-6",
        !props.showDivider && props.expanded && "oui-bg-base-6",
        props.className,
      )}
      onClick={() => {
        props.onExpandToggle?.();
      }}
    >
      <Icon color="white" className="oui-mt-3 oui-shrink-0" />

      <Flex direction="column" itemAlign="start" grow>
        <div className="oui-flex oui-flex-col oui-items-start oui-gap-1">
          {props.showSourceBadge !== false && (
            <AnnouncementSourceBadge
              isOfficial={props.isOfficial}
              platformName={props.platformName}
              className="oui-self-start"
            />
          )}
          <Text size="xs" intensity={80} weight="bold">
            {title}
          </Text>
        </div>
        {updateTime}
        {/* Expandable content with animation */}
        <div
          className="oui-grid oui-transition-all oui-duration-300 oui-ease-in-out"
          style={{
            gridTemplateRows: props.expanded ? "1fr" : "0fr",
          }}
        >
          <div className="oui-flex oui-flex-col oui-gap-2 oui-overflow-hidden">
            <Text size="2xs" intensity={80} as="div" className="oui-pt-2">
              {props.message}
            </Text>
            {action}
          </div>
        </div>
      </Flex>
      <div className="oui-pt-3">
        {/* Chevron icon with rotation animation */}
        <ChevronDownIcon
          color="white"
          size={18}
          className={`oui-transition-transform oui-duration-300 oui-ease-in-out ${
            props.expanded ? "oui-rotate-180" : "oui-rotate-0"
          }`}
        />
      </div>
    </Flex>
  );
};
