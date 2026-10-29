import { FC, useEffect, useMemo, useState } from "react";
import { i18n, useTranslation } from "@orderly.network/i18n";
import { AnnouncementType } from "@orderly.network/types";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Divider,
  Flex,
  Text,
} from "@orderly.network/ui";
import type { AnnouncementSummary } from "../../types";
import { resolveCardId } from "../../utils/cardSelection";
import {
  AnnouncementIcon,
  BattleIcon,
  FundIcon,
  SecurityIcon,
} from "../announcementCenter/icons";
import { AnnouncementSourceBadge } from "../announcementSourceBadge";
import {
  CampaignContentCard,
  CommunityVoteContentCard,
  DelistingContentCard,
  ListingContentCard,
  MaintenanceContentCard,
} from "./contentCard";

export interface NotificationProps {
  // Define your notification props here
  className?: string;
  // children?: React.ReactNode;
  dataSource: AnnouncementSummary[];
  onClose?: () => void;
  onCurrentChange?: (id?: string | number) => void;
  platformName?: string;
}

export interface NotificationItemProps {
  id: string;
  type?: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  onClose?: () => void;
}

export interface NotificationListProps {
  notifications: NotificationItemProps[];
  onRemove?: (id: string) => void;
}

/**
 * Literal `i18n.t` values keep the keys visible to static extraction, and the
 * `Record<union, string>` return type turns a missing entry into a compile
 * error. Rebuilt per call so `i18n.t` always reads the current language.
 */
const categoryLabels = (): Record<
  NonNullable<AnnouncementSummary["category"]>,
  string
> => ({
  campaign: i18n.t("notification.category.campaign"),
  listing: i18n.t("notification.category.listing"),
  delisting: i18n.t("notification.category.delisting"),
  update: i18n.t("notification.category.update"),
  legal: i18n.t("notification.category.legal"),
  others: i18n.t("notification.category.others"),
});

const NotificationHeader: FC<{
  // type: AnnouncementType;
  dataSource: AnnouncementSummary[];
  current: number;
  expanded?: boolean;
  onExpandToggle?: () => void;
  // onClose?: () => void;
}> = (props) => {
  const { t } = useTranslation();
  const { expanded } = props;
  const { type, category } = props.dataSource[props.current];

  const title = useMemo(() => {
    switch (type) {
      case AnnouncementType.Campaign:
        return (
          <Text
            size="sm"
            className="oui-bg-clip-text oui-text-transparent oui-gradient-brand"
          >
            {t("notification.campaign")}
          </Text>
        );
      case AnnouncementType.Delisting:
        return <Text size="sm">{t("notification.delistingTitle")}</Text>;
      case AnnouncementType.Listing:
        return (
          <Text size="sm" color="buy">
            {t("notification.listing")}
          </Text>
        );
      case AnnouncementType.Maintenance:
        return (
          <Text size="sm" color="warning">
            {t("notification.maintenanceTitle")}
          </Text>
        );
      case AnnouncementType.Vote:
        return (
          <Text size="sm" color="inherit">
            {t("notification.vote")}
          </Text>
        );
      default:
        return (
          <Text size="sm" color="inherit">
            {t("notification.generalTitle")}
          </Text>
        );
    }
  }, [type, t]);
  const icon = useMemo(() => {
    switch (type) {
      case AnnouncementType.Campaign:
        return <BattleIcon color="white" />;

      case AnnouncementType.Listing:
        return <FundIcon color="success" />;
      case AnnouncementType.Maintenance:
        return <SecurityIcon color="warning" />;
      case AnnouncementType.Delisting:
      default:
        return <AnnouncementIcon color="white" />;
    }
  }, [type]);
  return (
    <Flex itemAlign="center" justify="between" className="oui-px-4 oui-py-3">
      <div className="orderly-notification-header oui-flex oui-min-w-0 oui-flex-wrap oui-items-center oui-gap-2">
        {!category && icon}
        {category ? (
          <Text size="sm" color="primary">
            {categoryLabels()[category]}
          </Text>
        ) : (
          title
        )}
      </div>
      <button
        type="button"
        aria-label={t(
          expanded ? "notification.collapse" : "notification.expand",
        )}
        onClick={props.onExpandToggle}
        className="oui-transition-transform oui-duration-300"
        style={{
          transform: !expanded ? "rotate(180deg)" : "rotate(0deg)",
        }}
      >
        <ChevronDownIcon size={18} color="white" />
      </button>
    </Flex>
  );
};

const NotificationFooter: FC<{
  total: number;
  current: number;
  onCloseAll: () => void;
  onPrev: () => void;
  onNext: () => void;
}> = (props) => {
  const { total, current, onCloseAll, onPrev, onNext } = props;
  const { t } = useTranslation();
  return (
    <Flex
      className="orderly-notification-footer oui-px-4 oui-py-2"
      itemAlign="center"
      justify="between"
    >
      <Flex gap={2}>
        <button
          type="button"
          aria-label={t("notification.previous")}
          disabled={current - 1 < 0}
          onClick={onPrev}
          className="oui-flex oui-size-[18px] oui-items-center oui-justify-center oui-rounded-full oui-bg-base-6 hover:oui-bg-base-5 disabled:oui-opacity-50"
        >
          <ChevronLeftIcon size={14} color="white" />
        </button>
        <Text intensity={54} size="sm">
          {current + 1}/{total}
        </Text>
        <button
          type="button"
          aria-label={t("notification.next")}
          disabled={current + 1 >= total}
          onClick={onNext}
          className="oui-flex oui-size-[18px] oui-items-center oui-justify-center oui-rounded-full oui-bg-base-6 hover:oui-bg-base-5 disabled:oui-opacity-50"
        >
          <ChevronRightIcon size={14} color="white" />
        </button>
      </Flex>
      <button onClick={onCloseAll}>
        <Text size="xs" color="primary">
          {t("notification.closeAll", { total })}
        </Text>
      </button>
    </Flex>
  );
};

const NotificationContent: FC<{
  dataSource: (AnnouncementSummary & {
    startTime?: number;
    endTime?: number;
  })[];
  current: number;
  onItemClick: (url: string) => void;
}> = (props) => {
  const elements = useMemo(() => {
    return props.dataSource.map((message) => {
      if (message.title && message.url) {
        return (
          <button
            key={message.announcement_id}
            type="button"
            onClick={() => props.onItemClick(message.url!)}
            className="oui-announcement-notification-content oui-flex oui-w-full oui-flex-col oui-gap-3 oui-rounded-md oui-text-start focus-visible:oui-outline focus-visible:oui-outline-2 focus-visible:oui-outline-primary"
          >
            <Text size="base" weight="semibold" intensity={98}>
              {message.title}
            </Text>
            <Text.formatted
              size="2xs"
              intensity={36}
              rule="date"
              formatString="yyyy-MM-dd HH:mm:ss"
            >
              {message.published_time ?? message.updated_time ?? 0}
            </Text.formatted>
            {message.message && (
              <Text
                size="xs"
                weight="regular"
                intensity={80}
                className="oui-line-clamp-3"
              >
                {message.message}
              </Text>
            )}
          </button>
        );
      }
      const { type } = message;
      switch (type) {
        case AnnouncementType.Campaign:
          return (
            <CampaignContentCard
              message={message.message}
              coverImage={message.coverImage ?? ""}
              updateTime={message.updated_time ?? 0}
              url={message.url ?? ""}
              onItemClick={props.onItemClick}
            />
          );
        case AnnouncementType.Maintenance:
          return (
            <MaintenanceContentCard
              message={message.message}
              startTime={message.startTime}
              endTime={message.endTime}
            />
          );
        case AnnouncementType.Delisting:
          return (
            <DelistingContentCard
              message={message.message}
              updateTime={message.updated_time ?? 0}
            />
          );
        case AnnouncementType.Vote:
          return (
            <CommunityVoteContentCard
              message={message.message}
              url={message.url ?? ""}
              onItemClick={props.onItemClick}
            />
          );
        default:
          return (
            <ListingContentCard
              message={message.message}
              updateTime={message.updated_time ?? 0}
            />
          );
      }
    });
  }, [props.dataSource, props.onItemClick]);
  return <>{elements[props.current]}</>;
};

export const NotificationUI: FC<
  NotificationProps & {
    maintenanceMessage?: string;
    onItemClick: (url: string) => void;
  }
> = (props) => {
  const [expanded, setExpanded] = useState(true);

  const ids = useMemo(
    () => props.dataSource.map((item) => item.announcement_id),
    [props.dataSource],
  );
  const [selection, setSelection] = useState<{
    ids: (string | number)[];
    id?: string | number;
  }>({ ids, id: ids[0] });
  const currentId = resolveCardId(selection.id, selection.ids, ids);
  if (selection.ids !== ids) setSelection({ ids, id: currentId });
  const current = Math.max(0, ids.indexOf(currentId!));
  useEffect(() => {
    props.onCurrentChange?.(currentId);
  }, [currentId, props.onCurrentChange]);
  const len = useMemo(() => props.dataSource?.length ?? 0, [props.dataSource]);

  if (len === 0) {
    return null;
  }

  return (
    <div className="orderly-notification oui-w-full ">
      <NotificationHeader
        dataSource={props.dataSource ?? []}
        current={current}
        expanded={expanded}
        onExpandToggle={() => {
          setExpanded(!expanded);
        }}
      />
      <Divider className="oui-mx-4" />
      <div
        className="oui-grid oui-transition-all oui-duration-300 oui-ease-in-out"
        style={{
          gridTemplateRows: expanded ? "1fr" : "0fr",
        }}
      >
        {/* Inner div needs overflow-hidden and min-height-0 for grid animation to work */}
        <div className="oui-min-h-0 oui-overflow-hidden ">
          <div className="oui-px-4 oui-py-3">
            <AnnouncementSourceBadge
              isOfficial={props.dataSource[current].is_official}
              platformName={props.platformName}
              className="oui-mb-3"
            />
            <NotificationContent
              dataSource={props.dataSource ?? []}
              current={current}
              onItemClick={props.onItemClick}
            />
          </div>
        </div>
      </div>

      <NotificationFooter
        total={len}
        current={current}
        onCloseAll={props.onClose ?? (() => {})}
        onPrev={() => {
          if (current - 1 < 0) {
            return;
          }
          setSelection({ ids, id: ids[current - 1] });
        }}
        onNext={() => {
          if (current + 1 >= len) {
            return;
          }
          setSelection({ ids, id: ids[current + 1] });
        }}
      />
    </div>
  );
};
