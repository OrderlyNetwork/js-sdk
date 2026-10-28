import { useEffect } from "react";
import { useWS } from "@orderly.network/hooks";
import { announcementTopics, type AnnouncementStore } from "./store";
import type { AnnouncementSourceOptions } from "./types";

type AnnouncementSubscriptionOptions = AnnouncementSourceOptions & {
  enabled: boolean;
  onMessage: AnnouncementStore["notify"];
  onReconnect: AnnouncementStore["recover"];
};

/** Subscribes to enabled announcement sources and recovers after reconnecting. */
export function useAnnouncementSubscription({
  enabled,
  brokerId,
  excludeOfficial,
  onMessage,
  onReconnect,
}: AnnouncementSubscriptionOptions) {
  const ws = useWS();

  useEffect(() => {
    if (!enabled) return;
    const subscriptions = announcementTopics({ brokerId, excludeOfficial }).map(
      (topic) => ws.subscribe(topic, { onMessage }),
    );
    const connection = (event: { type: string; isPrivate: boolean }) => {
      if (event.type === "open" && !event.isPrivate) onReconnect();
    };
    ws.on("status:change", connection);

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe?.());
      ws.off("status:change", connection);
    };
  }, [enabled, brokerId, excludeOfficial, onMessage, onReconnect, ws]);
}
