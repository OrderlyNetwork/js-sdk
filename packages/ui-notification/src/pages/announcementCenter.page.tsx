import { FC } from "react";
import { RouterAdapter } from "@orderly.network/types";
import { AnnouncementCenterWidget } from "./announcementCenter.widget";

export const AnnouncementCenterPage: FC<{
  routerAdapter?: RouterAdapter;
  announcementId?: string;
}> = (props) => {
  return (
    <AnnouncementCenterWidget
      announcementId={props.announcementId}
      onRouteChange={(url: string) => {
        if (!url) return;
        const isExternal = /^https?:\/\//i.test(url);
        props.routerAdapter?.onRouteChange({
          href: url,
          name: url,
          ...(isExternal ? { target: "_blank" as const } : {}),
        });
      }}
    />
  );
};
