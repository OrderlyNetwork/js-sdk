import { AppLogos } from "@/provider/appProvider";

export type OrderlyConfig = {
  wallet: {
    apiKey?: string;
    options?: any;
  };
  app: {
    brokerId: string;
    brokerName: string;
    appIcons: AppLogos;
  };
  pages: {
    trading?: {
      tradingView?: {
        scriptSRC: string;
        library_path: string;
      };
    };
  };
};

export type OrderlyConfigCtx = {};
