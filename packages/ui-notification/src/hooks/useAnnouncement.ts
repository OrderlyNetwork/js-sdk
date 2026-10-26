import { useContext, useEffect } from "react";
import { useAppContext } from "@orderly.network/react-app";
import { AnnouncementArticlesContext } from "../articles/context";
import { toSummary } from "../articles/model";
import type { AnnouncementSourceOptions } from "../articles/types";
import { useLiveAnnouncements } from "../articles/useLiveAnnouncements";
import { useAnnouncementCardState } from "./useAnnouncementCardState";
import { useMaintenanceAnnouncement } from "./useMaintenanceAnnouncement";

export type AnnouncementOptions = AnnouncementSourceOptions & {
  hideTips?: boolean;
};
export type AnnouncementReturn = ReturnType<typeof useAnnouncement>;

/** Reads the shared source, or creates an automatic source for standalone hooks. */
export function useAnnouncement(options?: AnnouncementOptions) {
  const context = useContext(AnnouncementArticlesContext);
  const automatic = useLiveAnnouncements(options, !context);
  const maintenance = useMaintenanceAnnouncement();
  const source =
    context?.scaffoldState ??
    (context
      ? { ...automatic.scaffoldState!, tips: context.articles.map(toSummary) }
      : automatic.scaffoldState!);
  const state = useAnnouncementCardState(source, maintenance);
  const { setShowAnnouncement } = useAppContext();
  const showAnnouncement = !options?.hideTips && state.showAnnouncement;
  useEffect(
    () => setShowAnnouncement(showAnnouncement),
    [showAnnouncement, setShowAnnouncement],
  );
  return {
    ...state,
    maintenanceTips: source.maintenanceTips ?? maintenance.tips,
    showAnnouncement,
  };
}
