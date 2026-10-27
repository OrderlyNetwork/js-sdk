import { useParams } from "react-router";
import { AnnouncementCenterPage } from "@orderly.network/ui-notification";

export const AnnouncementWidget = () => {
  // AnnouncementCenterPage reads is_official from the URL (default: false).
  const { slug } = useParams();
  return <AnnouncementCenterPage slug={slug} />;
};
