import {
  ExtensionPosition,
  ExtensionPositionEnum,
  ExtensionSlot,
} from "@orderly.network/ui";

export const PortfolioLayout = () => {
  return (
    <div>
      <ExtensionSlot position={ExtensionPositionEnum.Logo} />
    </div>
  );
};
