import { FC, useEffect, useRef, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Button,
  InjectableEmptyDataState,
  ScrollArea,
  Text,
} from "@orderly.network/ui";
import { cn } from "@orderly.network/ui";
import type { AnnouncementSummary } from "../../types";
import { isSystemMaintenance } from "../../utils/bellAnnouncements";
import { AnnouncementListSkeleton } from "../announcementListSkeleton";
import { AnnouncementSourceBadge } from "../announcementSourceBadge";
import { AnnouncementItem } from "./announcementItem";

export const AnnouncementContent: FC<{
  /** Additional classes applied to the list or empty-state root. */
  className?: string;
  dataSource: AnnouncementSummary[];
  current: string | number | null;
  onExpandToggle: (id: string | number | null) => void;
  onItemClick: (url: string) => void;
  showDivider?: boolean;
  platformName?: string;
  showSourceBadge?: boolean;
}> = (props) => {
  const { dataSource, current, onExpandToggle, onItemClick } = props;
  const { t } = useTranslation();

  if (!Array.isArray(dataSource) || dataSource.length === 0) {
    return (
      <div
        className={cn(
          "oui-notification-announcementCenter-empty oui-flex oui-h-[160px] oui-items-center oui-justify-center",
          props.className,
        )}
      >
        <InjectableEmptyDataState title={t("notification.empty")} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "oui-notification-announcementCenter-list oui-flex oui-flex-col oui-space-y-1",
        props.className,
        props.showDivider &&
          "[&>*:not(:first-child)]:oui-border-t [&>*:not(:first-child)]:oui-border-line-12  [&>*:not(:first-child)]:oui-pt-1",
      )}
    >
      {dataSource.map((item) =>
        item.title ? (
          <button
            type="button"
            key={item.announcement_id}
            onClick={() => item.url && onItemClick(item.url)}
            className="oui-notification-announcementCenter-item-btn oui-announcement-summary oui-flex oui-w-full oui-flex-col oui-gap-1 oui-rounded-md oui-px-2 oui-py-3 oui-text-start hover:oui-bg-base-6 focus-visible:oui-outline focus-visible:oui-outline-2 focus-visible:oui-outline-primary"
          >
            {props.showSourceBadge !== false && (
              <AnnouncementSourceBadge
                isOfficial={item.is_official}
                platformName={props.platformName}
                className="oui-self-start"
              />
            )}
            <Text
              className="oui-notification-announcementCenter-item-title"
              size="xs"
              weight="semibold"
              intensity={80}
            >
              {item.title}
            </Text>
            <Text.formatted
              className="oui-notification-announcementCenter-item-time"
              size="2xs"
              intensity={36}
              rule="date"
              formatString="yyyy-MM-dd HH:mm:ss"
            >
              {item.published_time ?? item.updated_time ?? 0}
            </Text.formatted>
          </button>
        ) : (
          <AnnouncementItem
            url={item.url}
            onItemClick={onItemClick}
            key={item.announcement_id}
            message={item.message}
            updatedTime={item.updated_time ?? 0}
            startTime={item.startTime}
            endTime={item.endTime}
            expanded={current === item.announcement_id}
            type={item.type}
            showDivider={props.showDivider}
            isOfficial={item.is_official}
            platformName={props.platformName}
            showSourceBadge={props.showSourceBadge}
            onExpandToggle={() => {
              if (current === item.announcement_id) {
                onExpandToggle(null);
              } else {
                onExpandToggle(item.announcement_id);
              }
            }}
          />
        ),
      )}
    </div>
  );
};

/**
 * Bell summary presentation with optional loading/error states and View all action.
 * The host supplies data, handles navigation and acknowledges unread separately.
 * @returns A summary list; loading/error states keep maintenance visible and hide ordinary rows.
 */
export const AnnouncementCenterUI: FC<{
  /** Additional classes applied to the bell panel root. */
  className?: string;
  /** Localized bell summaries and optional maintenance reminders. */
  dataSource: AnnouncementSummary[];
  /** Handles a destination URL; this UI does not perform navigation. */
  onItemClick: (url: string) => void;
  /** Handles View all; omitting it hides that action. */
  onViewAll?: () => void;
  /** Optional read state; omitted state displays the supplied rows. */
  status?: "loading" | "ready" | "error";
  /** Handles the error-state retry button. */
  retry?: () => void;
  /** Platform source label; absent/blank uses the translated fallback. */
  platformName?: string;
  /**
   * Display source badges when identity is known.
   * @default true
   */
  showSourceBadge?: boolean;
}> = (props) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<string | number | null>(null);
  const unavailable = props.status === "error" || props.status === "loading";
  const dataSource = unavailable
    ? props.dataSource.filter(isSystemMaintenance)
    : props.dataSource;
  const ContentArea =
    unavailable && dataSource.length === 0 ? "div" : ScrollArea;
  const contentRef = useRef<HTMLDivElement>(null);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    const viewport = contentRef.current?.querySelector<HTMLElement>(
      "[data-radix-scroll-area-viewport]",
    );
    if (!viewport) {
      setCanScrollDown(false);
      return;
    }

    const updateScrollHint = () => {
      setCanScrollDown(
        viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop > 1,
      );
    };
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateScrollHint)
        : undefined;

    viewport.addEventListener("scroll", updateScrollHint, { passive: true });
    observer?.observe(viewport);
    if (viewport.firstElementChild) {
      observer?.observe(viewport.firstElementChild);
    }
    updateScrollHint();

    return () => {
      viewport.removeEventListener("scroll", updateScrollHint);
      observer?.disconnect();
    };
  }, [ContentArea]);

  return (
    <div className={cn("oui-notification-announcementCenter", props.className)}>
      <div className="oui-notification-announcementCenter-header oui-px-5 oui-pt-4">
        <Text
          className="oui-notification-announcementCenter-title"
          intensity={80}
          weight="bold"
        >
          {t("notification.title")}
        </Text>
      </div>

      <div
        ref={contentRef}
        className="oui-notification-announcementCenter-content oui-relative"
      >
        <ContentArea
          {...(ContentArea === ScrollArea ? { type: "auto" as const } : {})}
          className="oui-notification-announcementCenter-scroll-area oui-flex oui-h-[300px] oui-flex-col oui-p-3 [&>[data-orientation=vertical]>div]:oui-bg-base-contrast-20 [&>[data-orientation=vertical]>div:hover]:oui-bg-base-contrast-30"
        >
          {(dataSource.length > 0 || !unavailable) && (
            <AnnouncementContent
              dataSource={dataSource}
              current={expanded}
              onExpandToggle={setExpanded}
              onItemClick={props.onItemClick}
              platformName={props.platformName}
              showSourceBadge={props.showSourceBadge}
            />
          )}
          {props.status === "loading" ? (
            <div
              role="status"
              aria-label={t("notification.loading")}
              className="oui-notification-announcementCenter-loading oui-min-w-0"
            >
              <AnnouncementListSkeleton compact />
            </div>
          ) : props.status === "error" ? (
            <div
              role="alert"
              className="oui-notification-announcementCenter-error oui-announcement-error oui-flex oui-flex-1 oui-flex-col oui-items-center oui-justify-center oui-gap-4 oui-px-5 oui-py-6 oui-text-center"
            >
              <Text
                as="p"
                size="xs"
                intensity={54}
                className="oui-notification-announcementCenter-error-message oui-max-w-[240px] oui-break-words oui-whitespace-normal oui-leading-5"
              >
                {t("notification.loadFailed")}
              </Text>
              <Button
                variant="contained"
                color="primary"
                size="sm"
                className="oui-notification-announcementCenter-retry-btn oui-shrink-0 oui-px-4"
                onClick={props.retry}
              >
                {t("notification.retry")}
              </Button>
            </div>
          ) : null}
        </ContentArea>
        {canScrollDown && (
          <div
            aria-hidden="true"
            className="oui-announcement-scroll-hint oui-pointer-events-none oui-absolute oui-inset-x-3 oui-bottom-3 oui-h-8 oui-bg-gradient-to-t oui-from-base-8 oui-to-transparent"
          />
        )}
      </div>
      {props.onViewAll && (
        <div className="oui-notification-announcementCenter-footer oui-flex oui-justify-center oui-px-3 oui-pb-3">
          <Button
            variant="text"
            size="sm"
            className="oui-notification-announcementCenter-view-all-btn oui-text-primary-light"
            onClick={props.onViewAll}
          >
            {t("notification.viewAll")}
          </Button>
        </div>
      )}
    </div>
  );
};
