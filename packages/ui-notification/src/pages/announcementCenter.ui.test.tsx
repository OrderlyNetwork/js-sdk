// @vitest-environment jsdom
import { StrictMode, type HTMLAttributes } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OrderlyThemeProvider } from "@orderly.network/ui";
import { localizeAnnouncement } from "../articles/model";
import type { AnnouncementCenterScriptReturns } from "./announcementCenter.script";
import { AnnouncementPageUI } from "./announcementCenter.ui";

vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("../articles/markdown", () => ({ AnnouncementMarkdown: () => null }));
vi.mock("../components/announcementSourceBadge", () => ({
  AnnouncementSourceBadge: () => null,
}));
vi.mock("@orderly.network/ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@orderly.network/ui")>();
  const { createElement } = await import("react");
  const element =
    (tag: string) =>
    ({ children, className, onClick, role }: HTMLAttributes<HTMLElement>) =>
      createElement(tag, { className, onClick, role }, children);
  const Text = element("span");
  return {
    ...actual,
    Button: element("button"),
    Text: Object.assign(Text, { formatted: element("time") }),
    PaginationItems: ({
      onPageChange,
    }: {
      onPageChange: (page: number) => void;
    }) =>
      createElement("button", { onClick: () => onPageChange(2) }, "Next page"),
  };
});

const props: AnnouncementCenterScriptReturns = {
  isDetail: false,
  article: undefined,
  category: "all",
  sourceFilter: "all",
  selectSource: vi.fn(),
  announcements: [
    localizeAnnouncement(
      {
        announcement_id: 1,
        category: "CAMPAIGN",
        is_official: true,
        published_time: 1,
        updated_time: 1,
        translations: { en: { title: "Current article" } },
      },
      "en",
    ),
  ],
  status: "ready",
  page: 1,
  pageTotal: 2,
  count: 21,
  selectCategory: vi.fn(),
  openArticle: vi.fn(),
  backToList: vi.fn(),
  selectPage: vi.fn(),
  retry: vi.fn(),
};
const page = (overrides: Partial<AnnouncementCenterScriptReturns> = {}) => (
  <StrictMode>
    <OrderlyThemeProvider>
      <AnnouncementPageUI {...props} {...overrides} />
    </OrderlyThemeProvider>
  </StrictMode>
);

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("dir");
  vi.clearAllMocks();
});

describe("announcement source tabs", () => {
  it("uses the configured broker name between All and System", () => {
    render(page({ platformName: "  Orderly Demo  " }));
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "common.all",
      "Orderly Demo",
      "notification.source.system",
    ]);
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Orderly Demo" }), {
      button: 0,
      ctrlKey: false,
    });
    expect(props.selectSource).toHaveBeenCalledWith("community");
    fireEvent.mouseDown(
      screen.getByRole("tab", { name: "notification.source.system" }),
      {
        button: 0,
        ctrlKey: false,
      },
    );
    expect(props.selectSource).toHaveBeenCalledWith("official");
  });
  it.each(["ltr", "rtl"])(
    "retains source order through selection and list updates in %s",
    (dir) => {
      document.documentElement.dir = dir;
      const { rerender } = render(page());
      const expectedOrder = [
        "common.all",
        "notification.source.platform",
        "notification.source.system",
      ];
      const tabOrder = () =>
        screen.getAllByRole("tab").map((tab) => tab.textContent);
      expect(tabOrder()).toEqual(expectedOrder);
      for (const sourceFilter of [
        "community",
        "official",
        "all",
        "official",
      ] as const) {
        rerender(page({ sourceFilter }));
        expect(tabOrder()).toEqual(expectedOrder);
        expect(screen.getAllByText("Current article")).toHaveLength(1);
        rerender(
          page({
            sourceFilter,
            announcements: [
              { ...props.announcements[0], title: "Updated article" },
            ],
          }),
        );
        expect(tabOrder()).toEqual(expectedOrder);
        expect(screen.queryByText("Current article")).toBeNull();
        expect(screen.getAllByText("Updated article")).toHaveLength(1);
        expect(screen.getByRole("tabpanel").textContent).toContain(
          "Updated article",
        );
      }
      expect(
        screen.getByRole("tablist").closest("[dir]")?.getAttribute("dir"),
      ).toBe(dir);
    },
  );

  it.each(["ltr", "rtl"])(
    "inherits %s and follows document direction changes",
    async (dir) => {
      document.documentElement.dir = dir;
      render(page());
      const list = screen.getByRole("tablist");
      expect(list.parentElement?.parentElement?.getAttribute("dir")).toBe(dir);
      const nextDir = dir === "rtl" ? "ltr" : "rtl";
      await act(async () => {
        document.documentElement.dir = nextDir;
      });
      await waitFor(() =>
        expect(list.closest("[dir]")?.getAttribute("dir")).toBe(nextDir),
      );
      expect(screen.getAllByText("Current article")).toHaveLength(1);
      expect(list.className).toContain("oui-announcement-sources");
      expect(list.className).toContain("oui-flex-wrap");
      expect(
        screen.getByRole("tab", { name: "common.all" }).className,
      ).toContain("oui-whitespace-normal");
    },
  );

  it("keeps selection controlled and shows the new list only in its active panel", () => {
    const { rerender } = render(page());
    const community = screen.getByRole("tab", {
      name: "notification.source.platform",
    });
    fireEvent.mouseDown(community, { button: 0, ctrlKey: false });
    expect(props.selectSource).toHaveBeenCalledWith("community");
    expect(
      screen
        .getByRole("tab", { name: "common.all" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    rerender(
      page({
        sourceFilter: "community",
        announcements: [
          { ...props.announcements[0], title: "Community article" },
        ],
      }),
    );
    expect(community.getAttribute("aria-selected")).toBe("true");
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "common.all",
      "notification.source.platform",
      "notification.source.system",
    ]);
    expect(screen.queryByText("Current article")).toBeNull();
    expect(screen.getAllByText("Community article")).toHaveLength(1);
    expect(screen.getByRole("tabpanel").getAttribute("aria-labelledby")).toBe(
      community.id,
    );
    fireEvent.click(screen.getByText("Next page"));
    expect(props.selectPage).toHaveBeenCalledWith(2);
    fireEvent.click(screen.getByText("Community article"));
    expect(props.openArticle).toHaveBeenCalledWith(1);
  });

  it.each([
    ["ltr", "ArrowRight"],
    ["rtl", "ArrowLeft"],
  ])("uses %s keyboard direction", async (dir, key) => {
    document.documentElement.dir = dir;
    render(page());
    const all = screen.getByRole("tab", { name: "common.all" });
    act(() => all.focus());
    vi.clearAllMocks();
    fireEvent.keyDown(all, { key });
    await waitFor(() =>
      expect(props.selectSource).toHaveBeenCalledWith("community"),
    );
    expect(document.activeElement).toBe(
      screen.getByRole("tab", { name: "notification.source.platform" }),
    );
  });

  it("renders the list without tabs when source filtering is hidden", () => {
    render(page({ showSourceFilter: false }));
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.getAllByText("Current article")).toHaveLength(1);
  });
});
