import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import { cn } from "@orderly.network/ui";
import {
  NotificationUI as NotificationUIComponent,
  type AnnouncementSummary,
} from "@orderly.network/ui-notification";
import { windowGuard } from "@orderly.network/utils";
import { mergeAnnouncementDetailQuery } from "../../utils/announcement";
import { useScaffoldContext } from "../scaffold";

export const NotificationUI: FC<{
  dataSource: AnnouncementSummary[];
  onClose: () => void;
  showAnnouncement: boolean;
  cardSession?: number;
  onCurrentChange?: (id?: string | number) => void;
  platformName?: string;
}> = (props) => {
  const { dataSource, showAnnouncement } = props;
  const { routerAdapter } = useScaffoldContext();
  const onCurrentChange = useCallback(
    (id?: string | number) =>
      props.onCurrentChange?.(showAnnouncement ? id : undefined),
    [showAnnouncement, props.onCurrentChange],
  );
  const onItemClick = (url: string) => {
    if (!url) return;
    const href = mergeAnnouncementDetailQuery(
      url,
      dataSource.find((item) => item.url === url)?.is_official,
    );
    props.onClose();
    routerAdapter?.onRouteChange({
      href,
      name: href,
      target: href.startsWith("/") ? "_self" : "_blank",
    });
  };

  const notificationRef = useRef<HTMLDivElement>(null);
  const len = useMemo(() => dataSource?.length ?? 0, [dataSource]);
  useEffect(() => {
    if (!showAnnouncement || !len) props.onCurrentChange?.(undefined);
  }, [showAnnouncement, len, props.onCurrentChange]);
  useEffect(
    () => () => props.onCurrentChange?.(undefined),
    [props.onCurrentChange],
  );

  const onClose = useCallback(() => {
    if (len === 0) {
      return;
    }
    windowGuard(() => {
      if (notificationRef.current) {
        const animationendHandler = () => {
          props.onClose();
          notificationRef.current!.removeEventListener(
            "transitionend",
            animationendHandler,
          );
        };

        notificationRef.current.addEventListener(
          "transitionend",
          animationendHandler,
        );
        requestAnimationFrame(() => {
          notificationRef.current!.style.transform = "translateY(120%)";
        });
      }
    });
  }, [props.onClose, len]);

  useEffect(() => {
    if (len === 0) {
      return;
    }
    if (showAnnouncement) {
      // open the notification`
      windowGuard(() => {
        if (notificationRef.current) {
          requestAnimationFrame(() => {
            notificationRef.current!.style.transform = "translateY(0)";
          });
        }
      });
    }
  }, [showAnnouncement, len]);

  if (len === 0) {
    return null;
  }

  return (
    <div
      ref={notificationRef}
      data-state={showAnnouncement ? "open" : "closed"}
      className={cn(
        "oui-fixed oui-bottom-[calc(env(safe-area-inset-bottom)+8px)] oui-start-2 oui-z-50 oui-w-[calc(100%_-_16px)] oui-translate-y-[120%] oui-rounded-lg oui-border oui-border-line-6 oui-bg-base-8 md:oui-bottom-10 md:oui-end-3 md:oui-start-auto md:oui-w-[420px]",
        "oui-transition-all oui-duration-300 oui-ease-in-out",
        showAnnouncement ? "oui-visible" : "oui-invisible",
      )}
    >
      <NotificationUIComponent
        key={props.cardSession}
        onCurrentChange={onCurrentChange}
        dataSource={dataSource}
        platformName={props.platformName}
        onClose={onClose}
        onItemClick={onItemClick}
      />
    </div>
  );
};
