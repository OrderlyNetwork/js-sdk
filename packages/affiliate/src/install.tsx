import { ExtensionPositionEnum, installExtension } from "@veltodefi/ui";
import { AffiliateLayout, AffiliateLayoutProps } from "./layout/layout.ui";
import { layoutBuilder } from "./layout/layoutBuilder";

// installExtension<AffiliateLayoutProps>({
//   name: "Affiliate page layout",
//   scope: ["*"],
//   __isInternal: true,
//   positions: [ExtensionPositionEnum.AffiliateLayoutLayout],
//   builder: layoutBuilder,
// })((props: any) => {
//   return <AffiliateLayout {...props} />;
// });

export {};
