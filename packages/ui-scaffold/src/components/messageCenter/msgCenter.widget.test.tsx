// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MessageCenterWidget } from "./msgCenter.widget";

const fixture = vi.hoisted(() => ({
  widgetConfigs: undefined as
    | undefined
    | { announcement?: { excludeOfficial?: boolean } },
}));
vi.mock("@orderly.network/hooks", () => ({ useConfig: () => "Broker" }));
vi.mock("@orderly.network/react-app", () => ({
  useAppContext: () => ({ widgetConfigs: fixture.widgetConfigs }),
}));
vi.mock("../scaffold/scaffoldContext", () => ({
  useScaffoldContext: () => ({
    announcementState: {
      tips: [],
      maintenanceDialogInfo: "Maintenance is ongoing",
    },
  }),
}));
vi.mock("./msgCenter.ui", () => ({
  MessageCenter: ({
    showSourceBadge,
    maintenanceDialogInfo,
  }: {
    showSourceBadge: boolean;
    maintenanceDialogInfo?: string;
  }) => (
    <div data-testid="bell" data-source-badge={String(showSourceBadge)}>
      {maintenanceDialogInfo}
    </div>
  ),
}));
afterEach(cleanup);

describe("header announcement source configuration", () => {
  it.each([
    undefined,
    {},
    { announcement: {} },
    { announcement: { excludeOfficial: false } },
  ])(
    "shows source badges by default and preserves the maintenance dialog with %j",
    (config) => {
      fixture.widgetConfigs = config;
      const { rerender } = render(<MessageCenterWidget />);
      expect(screen.getByTestId("bell").getAttribute("data-source-badge")).toBe(
        "true",
      );
      expect(screen.getByText("Maintenance is ongoing")).toBeTruthy();
      fixture.widgetConfigs = { announcement: { excludeOfficial: true } };
      rerender(<MessageCenterWidget />);
      expect(screen.getByTestId("bell").getAttribute("data-source-badge")).toBe(
        "false",
      );
      expect(screen.getByText("Maintenance is ongoing")).toBeTruthy();
      fixture.widgetConfigs = undefined;
      rerender(<MessageCenterWidget />);
      expect(screen.getByTestId("bell").getAttribute("data-source-badge")).toBe(
        "true",
      );
    },
  );
});
