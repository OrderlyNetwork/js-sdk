import { useAnnouncementScript } from "./announcement.script";
import { Announcement, AnnouncementProps } from "./announcement.ui";

export type AnnouncementWidgetProps = Pick<
  AnnouncementProps,
  "style" | "className" | "hideTips"
>;

export const AnnouncementWidget = (props: AnnouncementWidgetProps) => {
  const { hideTips, ...rest } = props;
  const state = useAnnouncementScript({ hideTips });
  return <Announcement {...state} {...rest} />;
};
