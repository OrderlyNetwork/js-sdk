import type { RestrictedInfoOptions } from "@orderly.network/hooks";
import type { AppLogos } from "@orderly.network/react-app";
import { OrderlySecondaryLogo } from "../components/icons/orderlySecondaryLogo";

export type OrderlyAppProviderConfigProps = {
  appIcons: AppLogos;
  restrictedInfo: RestrictedInfoOptions;
};

export const orderlyAppProviderConfig: OrderlyAppProviderConfigProps = {
  appIcons: {
    // main: {
    //   component: (
    //     <OrderlyTextIcon className="oui-w-[100px] oui-h-10 oui-fill-base-contrast" />
    //   ),
    // },
    secondary: {
      component: <OrderlySecondaryLogo className="oui-text-base-contrast" />,
    },
  },
  restrictedInfo: {
    enableDefault: true,
    customRestrictedIps: [],
    customRestrictedRegions: [],
    customUnblockRegions: ["United States"],
    // Prediction trading policy; independent of site-wide wallet connections.
    // Set enableDefault to false to use only the custom region/city names.
    predictionRegionRestriction: {
      enableDefault: true,
      customRestrictedRegions: [],
    },
    // content: ({ ip, brokerName }) =>
    //   `You are accessing ${brokerName} from an IP address (${ip}) associated with a restricted country. Please refer to our Terms of Use</0>. If you believe this is an error, contact x@orerly.network.`,
  },
};
