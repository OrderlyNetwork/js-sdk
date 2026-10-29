import { FC } from "react";
import { useAppContext } from "@orderly.network/react-app";
import type { RouterAdapter } from "@orderly.network/types";
import { AnnouncementCenterWidget } from "./announcementCenter.widget";

export const AnnouncementCenterPage: FC<{
  /** Overrides OrderlyAppProvider navigation; uses the global callback when omitted. */
  routerAdapter?: RouterAdapter;
  /** Backend-generated slug; takes precedence over id when non-empty. */
  slug?: string;
  /** Announcement ID for explicit ID lookup. */
  id?: string;
  /** Overrides the URL's is_official parameter; defaults to false when absent. */
  isOfficial?: boolean;
}> = (props) => {
  const { onRouteChange: globalOnRouteChange } = useAppContext();
  const onRouteChange =
    props.routerAdapter?.onRouteChange ?? globalOnRouteChange;
  return (
    <AnnouncementCenterWidget
      slug={props.slug}
      id={props.id}
      isOfficial={props.isOfficial}
      onRouteChange={(url: string) => {
        if (!url) return;
        const isExternal = /^https?:\/\//i.test(url);
        onRouteChange?.({
          href: url,
          name: url,
          scope: "announcement",
          ...(isExternal ? { target: "_blank" as const } : {}),
        });
      }}
    />
  );
};
