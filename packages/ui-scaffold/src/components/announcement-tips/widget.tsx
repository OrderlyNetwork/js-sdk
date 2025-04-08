import { useAnnouncementTipsScript } from "./script";
import { AnnouncementTipsUI, AnnouncementTipsUIProps } from "./ui";

export type AnnouncementTipsWidgetProps = Pick<
  AnnouncementTipsUIProps,
  "style" | "className" | "hideTips"
>;

export const AnnouncementTipsWidget = (props: AnnouncementTipsWidgetProps) => {
  const state = useAnnouncementTipsScript();
  return <AnnouncementTipsUI {...state} {...props} />;
};
