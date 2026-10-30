// @vitest-environment jsdom
import { fireEvent, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnnouncementType } from "@orderly.network/types";
import type { AnnouncementSummary } from "../../types";
import { MaintenanceContentCard } from "../notification/contentCard";
import { AnnouncementCenterUI } from "./announcementCenter.ui";

vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/ui", async () => {
  const { createElement } = await import("react");
  type Props = {
    children?: import("react").ReactNode;
    className?: string;
    onClick?: () => void;
    as?: "span" | "div" | "p";
    title?: string;
  };
  const container = ({ children, className, onClick }: Props) =>
    createElement("div", { className, onClick }, children);
  const text = ({ children, className, as = "span" }: Props) =>
    createElement(as, { className }, children);
  text.formatted = text;
  return {
    cn: (...values: unknown[]) => values.filter(Boolean).join(" "),
    Flex: container,
    ScrollArea: container,
    Text: text,
    Button: ({ children, onClick }: Props) =>
      createElement("button", { onClick }, children),
    Badge: container,
    Icon: () => null,
    ChevronDownIcon: () => null,
    InjectableEmptyDataState: ({ title }: Props) =>
      createElement("div", null, title),
  };
});

afterEach(cleanup);

const maintenance: AnnouncementSummary = {
  announcement_id: "-1",
  type: AnnouncementType.Maintenance,
  message: "Scheduled maintenance details",
  updated_time: 10,
};
const ordinary: AnnouncementSummary = {
  announcement_id: 1,
  title: "Ordinary announcement",
  message: "Body",
  updated_time: 20,
  url: "/announcement/1",
};

describe("bell maintenance during announcement reads", () => {
  it.each([
    [
      "2026-10-29T10:00:00Z",
      "2026-10-29T11:30:00Z",
      "2026-10-29 10:00 – 11:30 UTC",
    ],
    [
      "2026-10-29T23:00:00Z",
      "2026-10-30T01:00:00Z",
      "2026-10-29 23:00 – 2026-10-30 01:00 UTC",
    ],
    [
      "2026-12-31T23:00:00Z",
      "2027-01-01T01:00:00Z",
      "2026-12-31 23:00 – 2027-01-01 01:00 UTC",
    ],
  ])(
    "shows the maintenance window from %s to %s before expanding",
    (start, end, label) => {
      const { rerender } = render(
        <AnnouncementCenterUI
          dataSource={[
            {
              ...maintenance,
              startTime: Date.parse(start),
              endTime: Date.parse(end),
            },
          ]}
          onItemClick={vi.fn()}
        />,
      );
      const trigger = screen.getByRole("button", {
        name: /notification.maintenance/,
      });
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      expect(trigger.contains(screen.getByText(label))).toBe(true);
      expect(screen.queryByText("notification.recentlyUpdated")).toBeNull();
      fireEvent.click(trigger);
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      fireEvent.click(trigger);
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      rerender(
        <MaintenanceContentCard
          message={maintenance.message}
          startTime={Date.parse(start)}
          endTime={Date.parse(end)}
        />,
      );
      expect(screen.getByText(label)).toBeTruthy();
      expect(screen.getByText(maintenance.message)).toBeTruthy();
      expect(screen.queryByText("notification.recentlyUpdated")).toBeNull();
    },
  );

  it.each([
    [undefined, undefined],
    [Date.parse("2026-10-29T10:00:00Z"), undefined],
    [NaN, Date.parse("2026-10-29T11:00:00Z")],
    [Infinity, Infinity],
    [2, 1],
  ])(
    "does not invent a maintenance time for invalid window %s / %s",
    (startTime, endTime) => {
      const { rerender } = render(
        <AnnouncementCenterUI
          dataSource={[{ ...maintenance, startTime, endTime }]}
          onItemClick={vi.fn()}
        />,
      );
      expect(screen.queryByText(/UTC/)).toBeNull();
      expect(screen.queryByText("notification.recentlyUpdated")).toBeNull();
      rerender(
        <MaintenanceContentCard
          message={maintenance.message}
          startTime={startTime}
          endTime={endTime}
        />,
      );
      expect(screen.queryByText(/UTC/)).toBeNull();
      expect(screen.queryByText("notification.recentlyUpdated")).toBeNull();
      expect(screen.getByText(maintenance.message)).toBeTruthy();
    },
  );

  it("toggles maintenance through its header and keeps selectable details outside the button", () => {
    const onItemClick = vi.fn();
    render(
      <AnnouncementCenterUI
        dataSource={[maintenance, ordinary]}
        status="ready"
        onItemClick={onItemClick}
      />,
    );
    const trigger = screen.getByRole("button", {
      name: /notification.maintenance/,
    });
    const details = screen.getByText(maintenance.message);
    const content = document.getElementById(
      trigger.getAttribute("aria-controls")!,
    )!;

    expect(trigger.getAttribute("type")).toBe("button");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(content.getAttribute("aria-hidden")).toBe("true");
    expect(content.contains(details)).toBe(true);
    expect(trigger.contains(details)).toBe(false);

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(content.getAttribute("aria-hidden")).toBe("false");
    fireEvent.click(details);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(onItemClick).not.toHaveBeenCalled();

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(content.getAttribute("aria-hidden")).toBe("true");
  });

  it.each(["loading", "error"] as const)(
    "keeps maintenance expandable during %s and restores ordinary content after recovery",
    (status) => {
      const retry = vi.fn();
      const onItemClick = vi.fn();
      const { rerender } = render(
        <AnnouncementCenterUI
          dataSource={[ordinary, maintenance]}
          status={status}
          retry={retry}
          onItemClick={onItemClick}
        />,
      );
      expect(screen.queryByText(ordinary.title!)).toBeNull();
      expect(screen.queryByText("notification.empty")).toBeNull();
      const details = screen.getByText(maintenance.message);
      expect(details.closest(".oui-grid")?.getAttribute("style")).toContain(
        "grid-template-rows: 0fr",
      );
      fireEvent.click(screen.getByText("notification.maintenance"));
      expect(details.closest(".oui-grid")?.getAttribute("style")).toContain(
        "grid-template-rows: 1fr",
      );
      if (status === "loading") {
        expect(screen.getByRole("status").getAttribute("aria-label")).toBe(
          "notification.loading",
        );
      } else {
        expect(screen.getByRole("alert").textContent).toContain(
          "notification.loadFailed",
        );
        fireEvent.click(
          screen.getByRole("button", { name: "notification.retry" }),
        );
        expect(retry).toHaveBeenCalledOnce();
      }
      rerender(
        <AnnouncementCenterUI
          dataSource={[ordinary, maintenance]}
          status="ready"
          onItemClick={onItemClick}
        />,
      );
      expect(screen.queryByRole("status")).toBeNull();
      expect(screen.queryByRole("alert")).toBeNull();
      fireEvent.click(
        screen.getByRole("button", { name: /Ordinary announcement/ }),
      );
      expect(onItemClick).toHaveBeenCalledWith(ordinary.url);
      expect(screen.getByText(maintenance.message)).toBeTruthy();
    },
  );

  it.each(["loading", "error"] as const)(
    "preserves the %s state without maintenance and shows empty only after a successful empty read",
    (status) => {
      const { rerender } = render(
        <AnnouncementCenterUI
          dataSource={[]}
          status={status}
          onItemClick={vi.fn()}
        />,
      );
      expect(
        screen.getByRole(status === "loading" ? "status" : "alert"),
      ).toBeTruthy();
      expect(screen.queryByText("notification.empty")).toBeNull();
      rerender(
        <AnnouncementCenterUI
          dataSource={[]}
          status="ready"
          onItemClick={vi.fn()}
        />,
      );
      expect(screen.getByText("notification.empty")).toBeTruthy();
    },
  );
});
