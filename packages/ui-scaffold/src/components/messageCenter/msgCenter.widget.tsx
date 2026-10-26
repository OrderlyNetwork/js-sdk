import { useConfig } from "@orderly.network/hooks";
import { useScaffoldContext } from "../scaffold/scaffoldContext";
import { MessageCenter } from "./msgCenter.ui";

export const MessageCenterWidget = () => {
  const platformName = useConfig<string | undefined>("brokerName");
  const { announcementState } = useScaffoldContext();

  return (
    <MessageCenter
      messages={announcementState.tips}
      platformName={platformName}
      maintenanceDialogInfo={announcementState.maintenanceDialogInfo}
      showAnnouncement={announcementState.showAnnouncement}
      closeTips={announcementState.closeTips}
      hasUnread={announcementState.hasUnread}
      onOpen={announcementState.openMessageCenter}
      status={announcementState.status}
      retry={announcementState.retry}
    />
  );
};
