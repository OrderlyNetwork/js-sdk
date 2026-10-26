import { useConfig } from "@orderly.network/hooks";
import { useScaffoldContext } from "../scaffold/scaffoldContext";
import { NotificationUI } from "./notification.ui";

export const NotificationWidget = () => {
  const platformName = useConfig<string | undefined>("brokerName");
  const { announcementState } = useScaffoldContext();
  return (
    <NotificationUI
      platformName={platformName}
      dataSource={announcementState.cardTips ?? announcementState.tips}
      onClose={announcementState.closeTips}
      showAnnouncement={announcementState.showAnnouncement}
      cardSession={announcementState.cardSession}
      onCurrentChange={announcementState.onCurrentChange}
    />
  );
};
