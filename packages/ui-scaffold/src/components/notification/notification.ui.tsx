import { FC, useCallback, useEffect, useRef } from "react";
import { API } from "@orderly.network/types";
import { cn } from "@orderly.network/ui";
import { NotificationUI as NotificationUIComponent } from "@orderly.network/ui-notification";
import { windowGuard } from "@orderly.network/utils";
import { useScaffoldContext } from "../scaffold";

export const NotificationUI: FC<{
  dataSource: API.AnnouncementRow[];
  onClose: () => void;
  showAnnouncement: boolean;
}> = (props) => {
  const { dataSource, showAnnouncement } = props;
  const { routerAdapter } = useScaffoldContext();
  const onItemClick = (url: string) => {
    if (!url) return;
    routerAdapter?.onRouteChange({
      href: url,
      name: url,
      target: "_blank",
    });
  };

  const notificationRef = useRef<HTMLDivElement>(null);

  const onClose = useCallback(() => {
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
  }, [props.onClose]);

  useEffect(() => {
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
  }, [showAnnouncement]);

  return (
    <div
      ref={notificationRef}
      data-state={showAnnouncement ? "open" : "closed"}
      className={cn(
        "oui-fixed oui-bottom-[calc(env(safe-area-inset-bottom)+8px)] oui-left-2 oui-z-50 oui-w-[calc(100%_-_16px)] oui-translate-y-[120%] oui-rounded-lg oui-border oui-border-line-6 oui-bg-base-8 md:oui-bottom-10 md:oui-left-auto md:oui-right-3 md:oui-w-[420px]",
        "oui-transition-all oui-duration-300 oui-ease-in-out",
        showAnnouncement ? "oui-visible" : "oui-invisible",
      )}
    >
      <NotificationUIComponent
        dataSource={dataSource}
        onClose={onClose}
        onItemClick={onItemClick}
      />
    </div>
  );
};
