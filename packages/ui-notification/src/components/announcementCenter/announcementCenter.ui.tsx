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
      <div className="oui-flex oui-h-[160px] oui-items-center oui-justify-center">
        <InjectableEmptyDataState title={t("notification.empty")} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "oui-flex oui-flex-col oui-space-y-1",
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
            className="oui-announcement-summary oui-flex oui-w-full oui-flex-col oui-gap-1 oui-rounded-md oui-px-2 oui-py-3 oui-text-start hover:oui-bg-base-6 focus-visible:oui-outline focus-visible:oui-outline-2 focus-visible:oui-outline-primary"
          >
            {props.showSourceBadge !== false && (
              <AnnouncementSourceBadge
                isOfficial={item.is_official}
                platformName={props.platformName}
                className="oui-self-start"
              />
            )}
            <Text size="xs" weight="semibold" intensity={80}>
              {item.title}
            </Text>
            <Text.formatted
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

export const AnnouncementCenterUI: FC<{
  dataSource: AnnouncementSummary[];
  onItemClick: (url: string) => void;
  onViewAll?: () => void;
  status?: "loading" | "ready" | "error";
  retry?: () => void;
  platformName?: string;
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
    <>
      <div className="oui-px-5 oui-pt-4">
        <Text intensity={80} weight="bold">
          {t("notification.title")}
        </Text>
      </div>

      <div ref={contentRef} className="oui-relative">
        <ContentArea
          {...(ContentArea === ScrollArea ? { type: "auto" as const } : {})}
          className="oui-flex oui-h-[300px] oui-flex-col oui-p-3 [&>[data-orientation=vertical]>div]:oui-bg-base-contrast-20 [&>[data-orientation=vertical]>div:hover]:oui-bg-base-contrast-30"
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
              className="oui-min-w-0"
            >
              <AnnouncementListSkeleton compact />
            </div>
          ) : props.status === "error" ? (
            <div
              role="alert"
              className="oui-announcement-error oui-flex oui-flex-1 oui-flex-col oui-items-center oui-justify-center oui-gap-4 oui-px-5 oui-py-6 oui-text-center"
            >
              <Text
                as="p"
                size="xs"
                intensity={54}
                className="oui-max-w-[240px] oui-break-words oui-whitespace-normal oui-leading-5"
              >
                {t("notification.loadFailed")}
              </Text>
              <Button
                variant="contained"
                color="primary"
                size="sm"
                className="oui-shrink-0 oui-px-4"
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
        <div className="oui-flex oui-justify-center oui-px-3 oui-pb-3">
          <Button
            variant="text"
            size="sm"
            className="oui-text-primary-light"
            onClick={props.onViewAll}
          >
            {t("notification.viewAll")}
          </Button>
        </div>
      )}
    </>
  );
};
