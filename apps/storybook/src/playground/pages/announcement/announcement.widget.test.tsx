import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import { AnnouncementWidget } from "./announcement.widget";

const mocks = vi.hoisted(() => ({
  params: {} as { slug?: string },
  page: vi.fn().mockReturnValue(null),
}));

vi.mock("react-router", () => ({ useParams: () => mocks.params }));
vi.mock("@orderly.network/ui-notification", () => ({
  AnnouncementCenterPage: mocks.page,
}));

beforeEach(() => vi.clearAllMocks());

it.each(["release-notes", "55", undefined])(
  "passes the route segment %s as slug and uses global navigation",
  (slug) => {
    mocks.params = { slug };
    renderToStaticMarkup(<AnnouncementWidget />);
    expect(mocks.page.mock.calls[0][0]).toEqual({ slug });
  },
);
