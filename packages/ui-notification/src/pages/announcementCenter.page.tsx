import { FC } from "react";
import { useAppContext } from "@orderly.network/react-app";
import type { RouterAdapter } from "@orderly.network/types";
import { AnnouncementCenterWidget } from "./announcementCenter.widget";

/**
 * Connected announcement list/detail page with automatic provider support.
 * Page routerAdapter.onRouteChange takes priority over the global app callback.
 * Navigation emits RouteOption with scope "announcement"; HTTP(S) external links
 * also set target "_blank". Without either callback, navigation does nothing.
 * @returns The list when no locator is supplied, otherwise the selected article view.
 */
export const AnnouncementCenterPage: FC<{
  /** Page navigation override. Priority: this adapter, then OrderlyAppProvider.onRouteChange. */
  routerAdapter?: RouterAdapter;
  /** Backend slug for detail lookup; a non-empty value takes precedence over id. Omit both locators for the list. */
  slug?: string;
  /** Explicit programmatic ID lookup when slug is absent. */
  id?: string;
  /** Overrides URL is_official for slug lookup; absence uses the URL, then false. Does not enable excluded official posts. */
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
