import { FC, useCallback, useContext, useState } from "react";
import { AnnouncementArticlesContext } from "../articles/context";
import { AnnouncementContent } from "../components/announcementCenter/announcementCenter.ui";
import { useAnnouncement } from "../hooks/useAnnouncement";
import { useAnnouncementCenterScript } from "./announcementCenter.script";
import { AnnouncementPageUI } from "./announcementCenter.ui";

type AnnouncementCenterWidgetProps = {
  announcementId?: string;
  onRouteChange: (url: string) => void;
};

/** Preserve the public announcement list for integrations without an article source. */
const LegacyAnnouncementCenterWidget: FC<AnnouncementCenterWidgetProps> = (
  props,
) => {
  const { tips } = useAnnouncement();
  const [current, setCurrent] = useState<string | number | null>(null);
  return (
    <div className="oui-m-1 oui-rounded-xl oui-bg-base-9 oui-p-2">
      <AnnouncementContent
        dataSource={tips}
        current={current}
        onExpandToggle={setCurrent}
        onItemClick={props.onRouteChange}
        showDivider
      />
    </div>
  );
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
  const articles = useContext(AnnouncementArticlesContext);
  if (!articles && !props.announcementId) {
    return <LegacyAnnouncementCenterWidget {...props} />;
  }
  return <ArticleAnnouncementCenterWidget {...props} />;
};
