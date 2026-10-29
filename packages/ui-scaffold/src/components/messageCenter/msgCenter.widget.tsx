import { useConfig } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { useScaffoldContext } from "../scaffold/scaffoldContext";
import { MessageCenter } from "./msgCenter.ui";

export const MessageCenterWidget = () => {
  const platformName = useConfig<string | undefined>("brokerName");
  const { announcementState } = useScaffoldContext();
  const { widgetConfigs } = useAppContext();

  return (
    <MessageCenter
      messages={announcementState.tips}
      platformName={platformName}
      showSourceBadge={!(widgetConfigs?.announcement?.excludeOfficial ?? true)}
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
