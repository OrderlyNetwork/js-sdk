import { useParams } from "react-router";
import { AnnouncementCenterPage } from "@orderly.network/ui-notification";
import { useNav } from "../../hooks/useNav";

export const AnnouncementWidget = () => {
  // Numeric route segments retain legacy ID lookup at the routing boundary.
  // AnnouncementCenterPage reads is_official from the URL (default: false).
  const { slug } = useParams();
  const isId = !!slug && /^\d+$/.test(slug);
  const { onRouteChange } = useNav();
  return (
    <AnnouncementCenterPage
      slug={isId ? undefined : slug}
      id={isId ? slug : undefined}
      routerAdapter={{ onRouteChange }}
    />
  );
};
