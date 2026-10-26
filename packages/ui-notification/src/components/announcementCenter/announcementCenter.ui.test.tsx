// @vitest-environment jsdom
import { fireEvent, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnnouncementType } from "@orderly.network/types";
import type { AnnouncementSummary } from "../../types";
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
