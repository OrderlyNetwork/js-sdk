import { Box, ExtensionPositionEnum, ExtensionSlot } from "@orderly.network/ui";
import { LayoutProvider } from "./context";

export type TradingRewardsLayoutProps = {
  // sideOpen?: boolean;
};

export const TradingRewardsLayout = (props: TradingRewardsLayoutProps) => {
  return (
    <LayoutProvider>
      <div className="oui-h-dvh">
        <ExtensionSlot position={ExtensionPositionEnum.MainNav} />
        <div
          className="oui-grid oui-h-full"
          style={{ gridAutoColumns: "160px 1fr" }}
        >
          <Box p={4} className="oui-bg-base-9 oui-rounded-2xl">
            <ExtensionSlot position={ExtensionPositionEnum.SideNav} />
          </Box>
          <div></div>
        </div>
      </div>
    </LayoutProvider>
  );
};
