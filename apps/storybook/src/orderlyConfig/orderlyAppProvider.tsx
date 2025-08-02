import { RestrictedInfoOptions } from "@orderly.network/hooks";
import { AppLogos } from "@orderly.network/react-app";

export type OrderlyAppProviderConfigProps = {
  appIcons: AppLogos;
  restrictedInfo: RestrictedInfoOptions;
};

export const orderlyAppProviderConfig: OrderlyAppProviderConfigProps = {
  appIcons: {
    main: {
      component: (
        <img
          src="/orderly-logo.svg"
          alt="logo"
          draggable={false}
          style={{ height: 40 }}
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
