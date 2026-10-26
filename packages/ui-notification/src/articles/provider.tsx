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

export type AnnouncementProviderProps = PropsWithChildren;

/** Reuses an ancestor source to share announcement requests and subscriptions. */
export function AnnouncementProvider({ children }: AnnouncementProviderProps) {
  const existing = useContext(AnnouncementArticlesContext);
  if (existing) return <>{children}</>;
  return <LiveProvider>{children}</LiveProvider>;
}
