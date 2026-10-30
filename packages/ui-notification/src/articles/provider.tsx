import { useContext, type PropsWithChildren } from "react";
import { AnnouncementArticlesContext } from "./context";
import { useLiveAnnouncements } from "./useLiveAnnouncements";

function LiveProvider({ children }: PropsWithChildren) {
  const value = useLiveAnnouncements();
  return (
    <AnnouncementArticlesContext.Provider value={value}>
      {children}
    </AnnouncementArticlesContext.Provider>
  );
}

/**
 * Provider children only; broker and official-post visibility come from global app configuration.
 */
export type AnnouncementProviderProps = PropsWithChildren;

/**
 * Shares automatic announcement data across descendants, reusing any ancestor source.
 * Use inside the existing Orderly app providers. Official posts are included by default
 * unless widgetConfigs.announcement.excludeOfficial is true.
 * @returns Children under a shared source, or unchanged when a source already exists.
 */
export function AnnouncementProvider({ children }: AnnouncementProviderProps) {
  const existing = useContext(AnnouncementArticlesContext);
  if (existing) return <>{children}</>;
  return <LiveProvider>{children}</LiveProvider>;
}
