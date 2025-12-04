import type { RestrictedInfoOptions } from "@veltodefi/hooks";
import type { AppLogos } from "@veltodefi/react-app";

export type OrderlyAppProviderConfigProps = {
  appIcons: AppLogos;
  restrictedInfo: RestrictedInfoOptions;
};

export const orderlyAppProviderConfig: OrderlyAppProviderConfigProps = {
  appIcons: {
    main: {
      component: (
        <img
          alt="orderlylogo"
          src="/orderly-logo.svg"
          style={{ width: 100, height: 40 }}
        />
      ),
    },
    secondary: {
      img: "/orderly-logo-secondary.svg",
    },
  },
  restrictedInfo: {
    enableDefault: true,
    customRestrictedIps: [],
    customRestrictedRegions: [],
    customUnblockRegions: ["United States"],
    // content: ({ ip, brokerName }) =>
    //   `You are accessing ${brokerName} from an IP address (${ip}) associated with a restricted country. Please refer to our Terms of Use</0>. If you believe this is an error, contact x@orerly.network.`,
  },
};
