import React from "react";
import { useAnnouncementScript } from "./announcement.script";
import { AnnouncementUI, type AnnouncementProps } from "./announcement.ui";

export type AnnouncementWidgetProps = Pick<
  AnnouncementProps,
  "style" | "className" | "hideTips"
>;

export const AnnouncementWidget: React.FC<AnnouncementWidgetProps> = (
  props,
) => {
  const { hideTips, ...rest } = props;
  const state = useAnnouncementScript({ hideTips });
  return <AnnouncementUI {...state} {...rest} />;
};
