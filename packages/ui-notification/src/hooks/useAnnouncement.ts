import { useContext, useEffect } from "react";
import { useAppContext } from "@orderly.network/react-app";
import { AnnouncementArticlesContext } from "../articles/context";
import { toSummary } from "../articles/model";
import { useLiveAnnouncements } from "../articles/useLiveAnnouncements";
import { useAnnouncementCardState } from "./useAnnouncementCardState";
import { useMaintenanceAnnouncement } from "./useMaintenanceAnnouncement";

/**
 * Presentation options for useAnnouncement; does not override the global source.
 */
export type AnnouncementOptions = {
  /**
   * Suppress returned and global carousel visibility without disabling reads.
   * @default false
   */
  hideTips?: boolean;
};
/**
 * Return value of useAnnouncement, including shared bell/card state and maintenance reminders.
 */
export type AnnouncementReturn = ReturnType<typeof useAnnouncement>;

/**
 * Reads the ancestor source, or creates an automatic source for standalone use.
 * Use a shared AnnouncementProvider for multiple custom entry points.
 * @param options - Presentation options; hideTips defaults to false.
 * @returns Shared bell tips, independent cardTips, unread/dismissal actions and maintenance state.
 * closeTips dismisses cards; openMessageCenter also acknowledges ordinary unread state.
 * Official posts are included by default; set widgetConfigs.announcement.excludeOfficial
 * to true to exclude them from the automatic source.
 */
export function useAnnouncement(options?: AnnouncementOptions) {
  const context = useContext(AnnouncementArticlesContext);
  const automatic = useLiveAnnouncements(!context);
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
