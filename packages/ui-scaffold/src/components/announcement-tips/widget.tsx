import { useAnnouncementTipsScript } from "./script";
import { AnnouncementTipsUI } from "./ui";

export const AnnouncementTipsWidget = () => {
  const props = useAnnouncementTipsScript();
  return <AnnouncementTipsUI {...props} />;
};