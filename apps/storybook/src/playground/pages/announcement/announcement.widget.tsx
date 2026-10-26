import { useParams } from "react-router";
import { AnnouncementCenterPage } from "@orderly.network/ui-notification";
import { useNav } from "../../hooks/useNav";

export const AnnouncementWidget = () => {
  const { announcementId } = useParams();
  const { onRouteChange } = useNav();
  return (
    <AnnouncementCenterPage
      announcementId={announcementId}
      routerAdapter={{ onRouteChange }}
    />
  );
};
