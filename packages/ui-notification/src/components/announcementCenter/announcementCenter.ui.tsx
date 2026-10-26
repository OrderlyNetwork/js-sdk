import { FC, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Button,
  InjectableEmptyDataState,
  ScrollArea,
  Text,
} from "@orderly.network/ui";
import { cn } from "@orderly.network/ui";
import type { AnnouncementSummary } from "../../types";
import { AnnouncementSourceBadge } from "../announcementSourceBadge";
import { AnnouncementItem } from "./announcementItem";

export const AnnouncementContent: FC<{
  dataSource: AnnouncementSummary[];
  current: string | number | null;
  onExpandToggle: (id: string | number | null) => void;
  onItemClick: (url: string) => void;
  showDivider?: boolean;
  platformName?: string;
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
            <AnnouncementSourceBadge
              isOfficial={item.is_official}
              platformName={props.platformName}
              className="oui-self-start"
            />
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
}> = (props) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<string | number | null>(null);

  return (
    <>
      <div className="oui-px-5 oui-pt-4">
        <Text intensity={80} weight="bold">
          {t("notification.title")}
        </Text>
      </div>

      <ScrollArea className="oui-flex oui-h-[300px] oui-flex-col oui-space-y-1 oui-p-3">
        {props.status === "loading" ? (
          <div
            role="status"
            aria-label={t("notification.loading")}
            className="oui-space-y-4 oui-p-2"
          >
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="oui-h-10 oui-animate-pulse oui-rounded oui-bg-base-6"
              />
            ))}
          </div>
        ) : props.status === "error" ? (
          <div role="alert" className="oui-space-y-4 oui-p-2">
            <Text size="xs" intensity={54}>
              {t("notification.loadFailed")}
            </Text>
            <Button
              variant="contained"
              color="primary"
              size="sm"
              onClick={props.retry}
            >
              {t("notification.retry")}
            </Button>
          </div>
        ) : (
          <AnnouncementContent
            dataSource={props.dataSource}
            current={expanded}
            onExpandToggle={setExpanded}
            onItemClick={props.onItemClick}
            platformName={props.platformName}
          />
        )}
      </ScrollArea>
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
