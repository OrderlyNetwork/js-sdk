import { FC } from "react";
import { RouterAdapter } from "@orderly.network/types";
import { AnnouncementCenterWidget } from "./announcementCenter.widget";

export const AnnouncementCenterPage: FC<{
  routerAdapter?: RouterAdapter;
  /** Backend-generated slug; takes precedence over id when non-empty. */
  slug?: string;
  /** Announcement ID for explicit ID lookup. */
  id?: string;
  /** Overrides the URL's is_official parameter; defaults to false when absent. */
  isOfficial?: boolean;
}> = (props) => {
  return (
    <AnnouncementCenterWidget
      slug={props.slug}
      id={props.id}
      isOfficial={props.isOfficial}
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
