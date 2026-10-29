import { useCallback, useEffect, useMemo, useState } from "react";
import type { AnnouncementScaffoldState } from "../articles/context";
import type { AnnouncementSummary } from "../types";
import {
  isSystemMaintenance as isMaintenance,
  mergeBellAnnouncements,
} from "../utils/bellAnnouncements";

const MAX_TIMEOUT = 2_147_483_647;

/**
 * Combines ordinary and maintenance cards, deduplicates by ID and sorts newest first.
 * @param announcements - Ordinary card summaries.
 * @param maintenance - Maintenance summaries, exempt from card deadline expiry.
 * @param now - Current timestamp in milliseconds.
 * @returns A new list without expired ordinary cards; missing/null deadlines retain a card.
 */
export function mergeAnnouncementCards(
  announcements: AnnouncementSummary[],
  maintenance: AnnouncementSummary[],
  now: number,
) {
  const seen = new Set<string>();
  return [...announcements, ...maintenance]
    .filter((tip) => {
      const id = String(tip.announcement_id);
      if (seen.has(id)) return false;
      const end = tip.notification_card_end_time;
      if (!isMaintenance(tip) && end != null && now >= end) return false;
      seen.add(id);
      return true;
    })
    .sort(
      (a, b) =>
        (b.published_time ?? b.updated_time ?? 0) -
          (a.published_time ?? a.updated_time ?? 0) ||
        Number(b.announcement_id) - Number(a.announcement_id),
    );
}

type CardVisibility = {
  open: boolean;
  sourceOpen: boolean;
  hasCards: boolean;
  session: number;
  reminderVersion?: number;
};

/**
 * Reconciles shared carousel visibility and advances its session when reopening.
 * @param previous - Previous open/sourceOpen/hasCards/session/reminderVersion state.
 * @param sourceOpen - Whether an underlying source requests an open carousel.
 * @param hasCards - Whether there are displayable cards.
 * @param reminderVersion - Publication reminder version; defaults to 0.
 * @returns Updated visibility/session state, or the original object when unchanged.
 */
export function reconcileCardVisibility(
  previous: CardVisibility,
  sourceOpen: boolean,
  hasCards: boolean,
  reminderVersion = 0,
): CardVisibility {
  const open =
    hasCards &&
    (previous.open ||
      (sourceOpen &&
        (!previous.sourceOpen ||
          !previous.hasCards ||
          reminderVersion !== (previous.reminderVersion ?? 0))));
  if (
    previous.open === open &&
    previous.sourceOpen === sourceOpen &&
    previous.hasCards === hasCards &&
    (previous.reminderVersion ?? 0) === reminderVersion
  )
    return previous;
  return {
    open,
    sourceOpen,
    hasCards,
    session: open && !previous.open ? previous.session + 1 : previous.session,
    reminderVersion,
  };
}

/**
 * Composes shared carousel visibility, card expiry and maintenance dismissal.
 * @param controlled - Ordinary source state; undefined returns the legacy state.
 * @param legacy - Maintenance source state, including its dialog and dismissal action.
 * @returns Bell tips, deadline-filtered cardTips and shared actions. closeTips dismisses
 * both sources; openMessageCenter also invokes the controlled source acknowledgment.
 */
export function useAnnouncementCardState(
  controlled: AnnouncementScaffoldState | undefined,
  legacy: AnnouncementScaffoldState,
): AnnouncementScaffoldState {
  const [now, setNow] = useState(Date.now);
  const [visibility, setVisibility] = useState<CardVisibility>({
    open: false,
    sourceOpen: false,
    hasCards: false,
    session: 0,
  });
  const ordinaryCards = controlled?.cardTips ?? controlled?.tips;
  const maintenance = useMemo(
    () => controlled?.maintenanceTips ?? legacy.tips.filter(isMaintenance),
    [controlled?.maintenanceTips, legacy.tips],
  );
  const tips = useMemo(
    () => mergeBellAnnouncements(controlled?.tips ?? [], maintenance),
    [controlled?.tips, maintenance],
  );
  const cardTips = useMemo(
    () => mergeAnnouncementCards(ordinaryCards ?? [], maintenance, Date.now()),
    [ordinaryCards, maintenance, now],
  );
  const sourceOpen =
    !!controlled &&
    (controlled.showAnnouncement ||
      (controlled.maintenanceTips === undefined &&
        maintenance.length > 0 &&
        legacy.showAnnouncement));
  const sharedVisibility = reconcileCardVisibility(
    visibility,
    sourceOpen,
    cardTips.length > 0,
    controlled?.reminderVersion,
  );
  if (sharedVisibility !== visibility) setVisibility(sharedVisibility);

  const closeShared = useCallback(
    (acknowledge = false) => {
      setVisibility((current) =>
        current.open ? { ...current, open: false } : current,
      );
      if (acknowledge && controlled?.openMessageCenter)
        controlled.openMessageCenter();
      else controlled?.closeTips();
      legacy.closeTips();
    },
    [controlled, legacy.closeTips],
  );
  const closeTips = useCallback(() => closeShared(), [closeShared]);
  const openMessageCenter = useCallback(() => closeShared(true), [closeShared]);

  useEffect(() => {
    if (!ordinaryCards || typeof window === "undefined") return;
    const update = () => setNow(Date.now());
    const currentTime = Date.now();
    const deadlines = ordinaryCards
      .filter((tip) => !isMaintenance(tip))
      .map((tip) => tip.notification_card_end_time)
      .filter(
        (end): end is number =>
          end != null && Number.isFinite(end) && end > currentTime,
      );
    const deadline = Math.min(...deadlines);
    const timer = Number.isFinite(deadline)
      ? window.setTimeout(
          update,
          Math.min(MAX_TIMEOUT, Math.max(0, deadline - Date.now())),
        )
      : undefined;
    window.addEventListener("focus", update);
    window.addEventListener("pageshow", update);
    window.addEventListener("online", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", update);
      window.removeEventListener("pageshow", update);
      window.removeEventListener("online", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [ordinaryCards, now]);

  useEffect(() => {
    if (
      controlled &&
      !cardTips.length &&
      sourceOpen &&
      (controlled.cardStatus === undefined || controlled.cardStatus === "ready")
    )
      closeTips();
  }, [controlled, cardTips.length, sourceOpen, closeTips]);

  return controlled
    ? {
        ...controlled,
        tips,
        maintenanceDialogInfo: legacy.maintenanceDialogInfo,
        cardTips,
        showAnnouncement: sharedVisibility.open,
        cardSession: sharedVisibility.session,
        closeTips,
        openMessageCenter,
      }
    : legacy;
}
