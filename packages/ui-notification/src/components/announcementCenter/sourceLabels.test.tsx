import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Badge } from "@orderly.network/ui";
import {
  AnnouncementCenterUI,
  AnnouncementPageUI,
  AnnouncementSourceBadge,
  NotificationUI,
  localizeArticle,
  toSummary,
  type AnnouncementCenterScriptReturns,
} from "@orderly.network/ui-notification";

vi.mock("@orderly.network/hooks", () => ({}));
vi.mock("@orderly.network/react-app", () => ({}));
vi.mock("@orderly.network/i18n", () => {
  const t = (key: string, values?: { name?: string }) =>
    ({
      "notification.source.system": "System",
      "notification.source.platform": "Platform",
      "notification.source.label": `Source: ${values?.name ?? ""}`,
    })[key] ?? key;
  return {
    useTranslation: () => ({ t }),
    i18n: { t },
  };
});
vi.mock("@orderly.network/ui", async () => {
  const { createElement, Children, isValidElement } = await import("react");
  const element =
    (tag: string) =>
    ({ children, className }: { children?: unknown; className?: string }) =>
      createElement(tag, { className }, children as never);
  const text = ({
    children,
    asChild,
  }: {
    children?: unknown;
    asChild?: boolean;
  }) => (asChild ? children : createElement("span", null, children as never));
  text.formatted = element("time");
  return {
    cn: (...values: unknown[]) => values.filter(Boolean).join(" "),
    Badge: vi.fn(({ children, color, size, variant, ...props }) =>
      createElement("div", props, children),
    ),
    Flex: element("div"),
    Text: text,
    ScrollArea: element("div"),
    Button: element("button"),
    Tabs: ({
      children,
      classNames,
      value,
    }: {
      children?: ReactNode;
      classNames?: { tabsList?: string };
      value: string;
    }) =>
      createElement(
        "div",
        null,
        createElement("div", { className: classNames?.tabsList }),
        Children.toArray(children).filter(
          (child) =>
            isValidElement<{ value: string }>(child) &&
            child.props.value === value,
        ),
      ),
    TabPanel: ({ children }: { children?: ReactNode }) => children,
    Divider: element("hr"),
    Icon: element("svg"),
    ChevronDownIcon: element("svg"),
    ChevronLeftIcon: element("svg"),
    ChevronRightIcon: element("svg"),
    InjectableEmptyDataState: element("div"),
    PaginationItems: element("div"),
  };
});

const platformName = "My Trading Platform";
const articles = [true, false].map((is_official) =>
  localizeArticle(
    {
      announcement_id: 1,
      category: "CAMPAIGN",
      is_official,
      published_time: 1,
      updated_time: 1,
      translations: {
        en: { title: "Trading campaign", content: "Campaign details" },
      },
    },
    "en",
  ),
);
const tips = articles.map(toSummary);
const pageProps: AnnouncementCenterScriptReturns = {
  platformName,
  isDetail: false,
  category: "all",
  sourceFilter: "all",
  selectSource: vi.fn(),
  announcements: articles,
  article: undefined,
  status: "ready",
  page: 1,
  pageTotal: 1,
  count: 2,
  selectCategory: vi.fn(),
  openArticle: vi.fn(),
  backToList: vi.fn(),
  selectPage: vi.fn(),
  retry: vi.fn(),
};

function expectSources(markup: string) {
  expect(markup).toContain('data-announcement-source="official"');
  expect(markup).toContain('data-announcement-source="platform"');
  expect(markup).toContain("System");
  expect(markup).toContain(platformName);
}

function expectSourceAboveTitle(markup: string, title: string) {
  const sourceIndex = markup.indexOf("data-announcement-source=");
  const titleIndex = markup.indexOf(renderToStaticMarkup(<span>{title}</span>));
  expect(sourceIndex).toBeGreaterThanOrEqual(0);
  expect(titleIndex).toBeGreaterThan(sourceIndex);
  expect(markup.match(/data-announcement-source=/g)).toHaveLength(1);
  expect(markup).toContain("oui-self-start");
}

describe("announcement source labels", () => {
  it("uses the shared neutral extra-small Badge without custom visual styling", () => {
    vi.mocked(Badge).mockClear();
    const markup = renderToStaticMarkup(
      <AnnouncementSourceBadge isOfficial className="custom-source-class" />,
    );
    expect(vi.mocked(Badge).mock.calls[0][0]).toMatchObject({
      color: "neutral",
      size: "xs",
      title: "System",
      "aria-label": "Source: System",
      "data-announcement-source": "official",
    });
    expect(markup).toContain("custom-source-class");
    expect(markup).toContain("oui-max-w-[140px]");
    expect(markup).not.toMatch(/oui-(bg-|border|rounded|text-|font-)/);
  });
  it.each([
    [true, "neutral"],
    [false, "primary"],
  ] as const)(
    "uses the source-specific Badge color for isOfficial=%s",
    (isOfficial, color) => {
      vi.mocked(Badge).mockClear();
      renderToStaticMarkup(
        <AnnouncementSourceBadge
          isOfficial={isOfficial}
          platformName={platformName}
        />,
      );
      expect(vi.mocked(Badge).mock.calls[0][0]).toMatchObject({
        color,
        size: "xs",
      });
    },
  );
  it("shows official identity rather than platform name and keeps full long names in the tooltip", () => {
    const official = renderToStaticMarkup(
      <AnnouncementSourceBadge isOfficial platformName={platformName} />,
    );
    expect(official).toContain("System");
    expect(official).not.toContain(platformName);
    const name = "A very long trading platform name";
    const platform = renderToStaticMarkup(
      <AnnouncementSourceBadge isOfficial={false} platformName={` ${name} `} />,
    );
    expect(platform).toContain(`title="${name}"`);
    expect(platform).toContain("oui-truncate");
  });
  it("uses Platform when the configured name is missing and hides unknown legacy sources", () => {
    expect(
      renderToStaticMarkup(
        <AnnouncementSourceBadge isOfficial={false} platformName=" " />,
      ),
    ).toContain("Platform");
    expect(
      renderToStaticMarkup(
        <AnnouncementSourceBadge platformName={platformName} />,
      ),
    ).toBe("");
  });
  it("renders both sources in the Header bell", () => {
    expectSources(
      renderToStaticMarkup(
        <AnnouncementCenterUI
          dataSource={tips}
          platformName={platformName}
          onItemClick={vi.fn()}
        />,
      ),
    );
  });
  it.each(["Orderly", " ALPIX ", ""])(
    "preserves the configured broker name for title-only API rows (%s)",
    (brokerName) => {
      const title = "ALPIX Trading Competition Season 2";
      for (const isOfficial of [true, false]) {
        const markup = renderToStaticMarkup(
          <AnnouncementCenterUI
            dataSource={[
              {
                ...tips[0],
                announcement_id: 2,
                title,
                message: "",
                is_official: isOfficial,
              },
            ]}
            platformName={brokerName}
            onItemClick={vi.fn()}
          />,
        );
        expect(markup).toContain(
          `data-announcement-source="${isOfficial ? "official" : "platform"}"`,
        );
        expect(markup).toContain(
          `title="${isOfficial ? "System" : brokerName.trim() || "Platform"}"`,
        );
        expectSourceAboveTitle(markup, title);
      }
    },
  );
  it.each(tips)(
    "places the Header bell source above the title ($is_official)",
    (tip) => {
      expectSourceAboveTitle(
        renderToStaticMarkup(
          <AnnouncementCenterUI
            dataSource={[tip]}
            platformName={platformName}
            onItemClick={vi.fn()}
          />,
        ),
        tip.title!,
      );
    },
  );
  it.each(tips)(
    "places the legacy Header bell source above its title ($is_official)",
    (tip) => {
      expectSourceAboveTitle(
        renderToStaticMarkup(
          <AnnouncementCenterUI
            dataSource={[{ ...tip, title: undefined, type: null }]}
            platformName={platformName}
            onItemClick={vi.fn()}
          />,
        ),
        "notification.general",
      );
    },
  );
  it("renders the active source in announcement cards", () => {
    expectSources(
      tips
        .map((tip) =>
          renderToStaticMarkup(
            <NotificationUI
              dataSource={[tip]}
              platformName={platformName}
              onItemClick={vi.fn()}
            />,
          ),
        )
        .join(""),
    );
  });
  it.each(tips)(
    "places the card source above the title, outside the category header ($is_official)",
    (tip) => {
      const markup = renderToStaticMarkup(
        <NotificationUI
          dataSource={[tip]}
          platformName={platformName}
          onItemClick={vi.fn()}
        />,
      );
      const sourceIndex = markup.indexOf("data-announcement-source=");
      const contentIndex = markup.indexOf(
        "oui-announcement-notification-content",
      );
      expect(sourceIndex).toBeGreaterThan(markup.indexOf("<hr"));
      expect(sourceIndex).toBeLessThan(contentIndex);
      expect(markup.match(/data-announcement-source=/g)).toHaveLength(1);
      expect(markup).toContain("oui-mb-3");
    },
  );
  it("renders both sources in the list", () => {
    expect(
      renderToStaticMarkup(<AnnouncementPageUI {...pageProps} />),
    ).toContain("oui-announcement-sources");
    expectSources(renderToStaticMarkup(<AnnouncementPageUI {...pageProps} />));
  });
  it.each(articles)(
    "places the list source above the title ($is_official)",
    (article) => {
      expectSourceAboveTitle(
        renderToStaticMarkup(
          <AnnouncementPageUI {...pageProps} announcements={[article]} />,
        ),
        article.title,
      );
    },
  );
  it("renders the source on each detail page", () => {
    expectSources(
      articles
        .map((article) =>
          renderToStaticMarkup(
            <AnnouncementPageUI {...pageProps} isDetail article={article} />,
          ),
        )
        .join(""),
    );
  });
});

describe("hidden announcement source labels", () => {
  it.each([true, false])(
    "hides source badges in the bell for title-based rows=%s",
    (hasTitle) => {
      const markup = renderToStaticMarkup(
        <AnnouncementCenterUI
          dataSource={tips.map((tip) => ({
            ...tip,
            title: hasTitle ? tip.title : undefined,
            type: null,
          }))}
          platformName={platformName}
          showSourceBadge={false}
          onItemClick={vi.fn()}
        />,
      );
      expect(markup).not.toContain("data-announcement-source=");
      expect(markup).toContain(
        hasTitle ? "Trading campaign" : "notification.general",
      );
      expect(markup).toContain("<time");
    },
  );
  it("hides list badges and source filters while retaining titles, times and categories", () => {
    const markup = renderToStaticMarkup(
      <AnnouncementPageUI
        {...pageProps}
        showSourceBadge={false}
        showSourceFilter={false}
      />,
    );
    expect(markup).not.toContain("data-announcement-source=");
    expect(markup).toContain("Trading campaign");
    expect(markup).toContain("<time");
    expect(markup).not.toContain("oui-announcement-sources");
    expect(markup).toContain("oui-announcement-categories");
  });
  it.each(articles)(
    "hides the detail badge and its spacing ($is_official)",
    (article) => {
      const markup = renderToStaticMarkup(
        <AnnouncementPageUI
          {...pageProps}
          isDetail
          article={article}
          showSourceBadge={false}
        />,
      );
      expect(markup).not.toContain("data-announcement-source=");
      expect(markup).toContain("<article><h1>");
      expect(markup).toContain(article.title);
      expect(markup).toContain("Campaign details");
      expect(markup).toContain("<time");
    },
  );
});
