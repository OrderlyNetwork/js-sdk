// @vitest-environment jsdom
import { useCallback, useState } from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AnnouncementSummary } from "@orderly.network/ui-notification";
import type { ScaffoldAnnouncementState } from "./scaffoldContext";
import {
  mergeAnnouncementCards,
  useSharedAnnouncementState,
} from "./useSharedAnnouncementState";

const now = 1_800_000_000_000;
const article = (id = 1, end = now + 1000): AnnouncementSummary => ({
  announcement_id: id,
  title: `Announcement ${id}`,
  message: "Body",
  category: "campaign",
  published_time: now - 10_000,
  updated_time: now - 10_000,
  notification_card_end_time: end,
});
const maintenance: AnnouncementSummary = {
  announcement_id: "-1",
  message: "Maintenance",
  updated_time: now - 20_000,
  startTime: now - 20_000,
  endTime: now - 10_000,
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function useHarness(
  initialMaintenance = [maintenance],
  ordinaryOpen = true,
  legacyOpen = false,
) {
  const [tips, setTips] = useState([article()]);
  const [legacyTips, setLegacyTips] = useState(initialMaintenance);
  const [showAnnouncement, setOpen] = useState(ordinaryOpen);
  const [showLegacy, setLegacyOpen] = useState(legacyOpen);
  const [hasUnread, setUnread] = useState(true);
  const [reminderVersion, setReminderVersion] = useState(0);
  const closeOrdinary = useCallback(() => setOpen(false), []);
  const closeLegacy = useCallback(() => setLegacyOpen(false), []);
  const openBell = useCallback(() => {
    setOpen(false);
    setUnread(false);
  }, []);
  const state = useSharedAnnouncementState(
    {
      tips,
      showAnnouncement,
      hasUnread,
      reminderVersion,
      closeTips: closeOrdinary,
      openMessageCenter: openBell,
    },
    {
      tips: legacyTips,
      showAnnouncement: showLegacy,
      closeTips: closeLegacy,
      maintenanceDialogInfo: "Existing maintenance dialog",
    },
  );
  return {
    state,
    setTips,
    setLegacyTips,
    setOpen,
    showAnnouncement,
    showLegacy,
    setReminderVersion,
  };
}

describe("shared maintenance and announcement cards", () => {
  it("reopens for a new push batched with dismissing the previous group", () => {
    const { result } = renderHook(() => useHarness([]));
    const session = result.current.state.cardSession!;
    act(() => {
      result.current.state.closeTips();
      result.current.setTips([article(2, now + 20_000)]);
      result.current.setOpen(true);
      result.current.setReminderVersion((version) => version + 1);
    });
    expect(result.current.state.showAnnouncement).toBe(true);
    expect(result.current.state.cardSession).toBe(session + 1);
  });
  it("rejects newly supplied expired cards even if no previous deadline timer ran", () => {
    const { result } = renderHook(() => useHarness([]));
    act(() => {
      vi.setSystemTime(now + 20_000);
      result.current.setTips([article(2, now + 10_000)]);
    });
    expect(result.current.state.cardTips).toEqual([]);
    expect(result.current.state.showAnnouncement).toBe(false);
  });
  it("expires an announcement on time without removing it from reading entrances or hiding maintenance", () => {
    const { result } = renderHook(() => useHarness());
    const session = result.current.state.cardSession;
    expect(
      result.current.state.cardTips?.map((tip) => tip.announcement_id),
    ).toEqual([1, "-1"]);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(
      result.current.state.cardTips?.map((tip) => tip.announcement_id),
    ).toEqual(["-1"]);
    expect(result.current.state.tips.map((tip) => tip.announcement_id)).toEqual(
      [1, "-1"],
    );
    expect(result.current.state.hasUnread).toBe(true);
    expect(result.current.state.showAnnouncement).toBe(true);
    expect(result.current.state.cardSession).toBe(session);
    expect(result.current.state.maintenanceDialogInfo).toBe(
      "Existing maintenance dialog",
    );
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(result.current.state.cardTips).toEqual([maintenance]);
  });
  it("closes the entire group and reopens with maintenance when another announcement arrives", () => {
    const { result } = renderHook(() => useHarness([maintenance], true, true));
    const session = result.current.state.cardSession!;
    act(() => result.current.state.closeTips());
    expect(result.current.state.showAnnouncement).toBe(false);
    expect(result.current.showAnnouncement).toBe(false);
    expect(result.current.showLegacy).toBe(false);
    expect(result.current.state.hasUnread).toBe(true);
    act(() => {
      result.current.setTips([article(2, now + 20_000), article()]);
      result.current.setOpen(true);
    });
    expect(result.current.state.showAnnouncement).toBe(true);
    expect(result.current.state.cardTips).toHaveLength(3);
    expect(result.current.state.cardSession).toBe(session + 1);
  });
  it("opening the bell closes maintenance and ordinary cards, acknowledges the dot, and retains data", () => {
    const { result } = renderHook(() => useHarness([maintenance], false, true));
    expect(result.current.state.showAnnouncement).toBe(true);
    act(() => result.current.state.openMessageCenter?.());
    expect(result.current.state.showAnnouncement).toBe(false);
    expect(result.current.state.hasUnread).toBe(false);
    expect(result.current.showLegacy).toBe(false);
    expect(result.current.state.cardTips).toHaveLength(2);
    expect(result.current.state.tips).toHaveLength(2);
  });
  it("keeps maintenance visible when the last ordinary announcement is unpublished", () => {
    const { result } = renderHook(() => useHarness());
    const session = result.current.state.cardSession;
    act(() => {
      result.current.setTips([]);
      result.current.setOpen(false);
    });
    expect(result.current.state.cardTips).toEqual([maintenance]);
    expect(result.current.state.tips).toEqual([maintenance]);
    expect(result.current.state.showAnnouncement).toBe(true);
    expect(result.current.state.cardSession).toBe(session);
    act(() => result.current.setLegacyTips([]));
    expect(result.current.state.showAnnouncement).toBe(false);
    expect(result.current.state.tips).toEqual([]);
  });
  it("updates and removes maintenance in the bell independently of card visibility", () => {
    const { result } = renderHook(() => useHarness());
    act(() => result.current.state.closeTips());
    const updated = {
      ...maintenance,
      updated_time: now + 1000,
      startTime: now + 1000,
      message: "Rescheduled maintenance",
    };
    act(() => result.current.setLegacyTips([updated]));
    expect(result.current.state.tips).toEqual([updated, article()]);
    expect(result.current.state.showAnnouncement).toBe(false);
    act(() => result.current.setLegacyTips([]));
    expect(result.current.state.tips).toEqual([article()]);
  });
  it("closes an empty group after expiry and opens a fresh session on the next notification", () => {
    const { result } = renderHook(() => useHarness([]));
    const session = result.current.state.cardSession!;
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.state.showAnnouncement).toBe(false);
    expect(result.current.showAnnouncement).toBe(false);
    expect(result.current.state.hasUnread).toBe(true);
    act(() => {
      result.current.setTips([article(2, now + 10_000)]);
      result.current.setOpen(true);
    });
    expect(result.current.state.showAnnouncement).toBe(true);
    expect(result.current.state.cardSession).toBe(session + 1);
  });
  it("catches up on focus after a suspended tab and cleans up its timer", () => {
    const { result, unmount } = renderHook(() => useHarness());
    act(() => {
      vi.setSystemTime(now + 2000);
      window.dispatchEvent(new Event("focus"));
    });
    expect(result.current.state.cardTips).toEqual([maintenance]);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("handles deadlines beyond the browser timeout limit without expiring them early", () => {
    const { result } = renderHook(() => useHarness([]));
    const end = now + 2_147_483_647 + 1000;
    act(() => result.current.setTips([article(1, end)]));
    act(() => {
      vi.advanceTimersByTime(2_147_483_647);
    });
    expect(result.current.state.cardTips).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.state.cardTips).toHaveLength(0);
  });
  it("retains legacy maintenance even with past endTime and card-deadline metadata", () => {
    const expired = article(1, now);
    const legacy = { ...article(2), notification_card_end_time: null };
    const maintenanceWithDeadline = {
      ...maintenance,
      notification_card_end_time: now - 1,
    };
    const cards = mergeAnnouncementCards(
      [expired, legacy],
      [maintenanceWithDeadline],
      now,
    );
    expect(cards.map((tip) => tip.announcement_id)).toEqual([2, "-1"]);
  });
  it("returns legacy maintenance state when no article state is available", () => {
    const legacy: ScaffoldAnnouncementState = {
      tips: [maintenance],
      showAnnouncement: true,
      closeTips: vi.fn(),
    };
    const { result } = renderHook(() =>
      useSharedAnnouncementState(undefined, legacy),
    );
    expect(result.current).toBe(legacy);
  });
});
