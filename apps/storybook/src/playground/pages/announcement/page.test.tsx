// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import AnnouncementPage from "./page";

const mocks = vi.hoisted(() => ({
  search: "",
  navigate: vi.fn(),
  onRouteChange: vi.fn(),
  layout: vi.fn().mockReturnValue(null),
}));

vi.mock("react-router", () => ({
  useNavigate: () => mocks.navigate,
  useLocation: () => ({ search: mocks.search }),
}));
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/ui", () => ({
  useScreen: () => ({ isMobile: true }),
  ChevronLeftIcon: () => null,
  Text: () => null,
}));
vi.mock("../../../components/layout/baseLayout", () => ({
  BaseLayout: mocks.layout,
}));
vi.mock("../../hooks/useNav", () => ({
  useNav: () => ({ onRouteChange: mocks.onRouteChange }),
}));
vi.mock("./announcement.widget", () => ({ AnnouncementWidget: () => null }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.search = "";
  window.history.replaceState({ idx: 0 }, "", "/en/announcement");
});

function clickBack() {
  renderToStaticMarkup(<AnnouncementPage />);
  mocks.layout.mock.calls[0][0].topBar.props.children[0].props.onClick();
}

it.each(["official", "community"])(
  "removes source=%s from the trading fallback while retaining repeated context",
  (source) => {
    mocks.search = `?source=${source}&brokerId=demo&feature=one&feature=two`;
    clickBack();
    expect(mocks.onRouteChange).toHaveBeenCalledExactlyOnceWith({
      href: "/?brokerId=demo&feature=one&feature=two",
      name: "trading",
    });
    expect(mocks.navigate).not.toHaveBeenCalled();
  },
);

it("explicitly clears query inheritance when source is the only parameter", () => {
  mocks.search = "?source=official";
  clickBack();
  expect(mocks.onRouteChange).toHaveBeenCalledExactlyOnceWith({
    href: "/?",
    name: "trading",
  });
});

it("retains the existing history-back behavior", () => {
  window.history.replaceState({ idx: 1 }, "", "/en/announcement/article");
  mocks.search = "?source=official";
  clickBack();
  expect(mocks.navigate).toHaveBeenCalledExactlyOnceWith(-1);
  expect(mocks.onRouteChange).not.toHaveBeenCalled();
});
