import { Box, ExtensionPositionEnum, ExtensionSlot } from "@orderly.network/ui";

export const PortfolioLayout = () => {
  return (
    <div>
      <ExtensionSlot position={ExtensionPositionEnum.MainNav} />
      <ExtensionSlot position={ExtensionPositionEnum.Logo} />

      <Box p={4} className="oui-bg-base-9">
        <ExtensionSlot position={ExtensionPositionEnum.SideNav} />
      </Box>
    </div>
  );
};
