import type { PropsWithChildren, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import AnnouncementPage from "./page";

vi.mock("react-router", () => ({ useNavigate: () => vi.fn() }));
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@orderly.network/ui")>()),
  useScreen: () => ({ isMobile: true }),
}));
vi.mock("../../../components/layout/baseLayout", () => ({
  BaseLayout: ({
    topBar,
    children,
  }: PropsWithChildren<{ topBar?: ReactNode }>) => (
    <>
      {topBar}
      {children}
    </>
  ),
}));
vi.mock("../../hooks/useNav", () => ({
  useNav: () => ({ onRouteChange: vi.fn() }),
}));
vi.mock("./announcement.widget", () => ({ AnnouncementWidget: () => null }));

it("renders the mobile back arrow with inherited theme color at full opacity", () => {
  const markup = renderToStaticMarkup(<AnnouncementPage />);
  expect(markup).toContain("<button");
  expect(markup).toContain("oui-text-inherit");
  expect(markup).not.toContain("oui-text-black");
  expect(markup).toContain('fill-opacity="1"');
});
