import { FC, useCallback } from "react";
import { AnnouncementProvider } from "../articles/provider";
import { useAnnouncementCenterScript } from "./announcementCenter.script";
import { AnnouncementPageUI } from "./announcementCenter.ui";

type AnnouncementCenterWidgetProps = {
  announcementId?: string;
  onRouteChange: (url: string) => void;
};

const ArticleAnnouncementCenterWidget: FC<AnnouncementCenterWidgetProps> = (
  props,
) => {
  const onRouteChange = useCallback(
    (url: string) => {
      if (!url) return;
      props.onRouteChange(url);
    },
    [props.onRouteChange],
  );
  const state = useAnnouncementCenterScript({
    announcementId: props.announcementId,
    onRouteChange,
  });
  return <AnnouncementPageUI {...state} />;
};

export const AnnouncementCenterWidget: FC<AnnouncementCenterWidgetProps> = (
  props,
) => {
  return (
    <AnnouncementProvider>
      <ArticleAnnouncementCenterWidget {...props} />
    </AnnouncementProvider>
  );
};
