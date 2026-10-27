import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import { AnnouncementWidget } from "./announcement.widget";

const mocks = vi.hoisted(() => ({
  params: {} as { slug?: string },
  page: vi.fn().mockReturnValue(null),
  onRouteChange: vi.fn(),
}));

vi.mock("react-router", () => ({ useParams: () => mocks.params }));
vi.mock("@orderly.network/ui-notification", () => ({
  AnnouncementCenterPage: mocks.page,
}));
vi.mock("../../hooks/useNav", () => ({
  useNav: () => ({ onRouteChange: mocks.onRouteChange }),
}));

beforeEach(() => vi.clearAllMocks());

it.each([
  ["release-notes", { slug: "release-notes", id: undefined }],
  ["55", { slug: undefined, id: "55" }],
  [undefined, { slug: undefined, id: undefined }],
])(
  "adapts the route segment %s to an explicit page locator",
  (slug, expected) => {
    mocks.params = { slug };
    renderToStaticMarkup(<AnnouncementWidget />);
    expect(mocks.page.mock.calls[0][0]).toMatchObject({
      ...expected,
      routerAdapter: { onRouteChange: mocks.onRouteChange },
    });
  },
);
