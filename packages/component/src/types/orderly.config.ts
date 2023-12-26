export type OrderlyConfig = {
  wallet: {
    apiKey?: string;
    options?: any;
  };
  app: {
    brokerId: string;
    brokerName: string;
    appIcons: {
      main?: string;
      secondary?: string;
    };
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
