import { useAppContext } from "@orderly.network/react-app";
import { useConfig } from "@orderly.network/hooks";
type AppContextReturnType = ReturnType<typeof useAppContext>;

export type RestrictedInfo = AppContextReturnType["restrictedInfo"] & {
  brokerName?: string;
};

export const useRestrictedAreasScript = (): RestrictedInfo => {
  const {
    restrictedInfo = {
      ip: "",
      invalidRegions: [],
      restrictedAreasOpen: false,
      contact: {
        url: "",
        text: "",
      },
    },
  } = useAppContext();
  const config = useConfig();
  const brokerName = config.get("brokerName");
  return {
    ...restrictedInfo,
    brokerName,
  };
};
