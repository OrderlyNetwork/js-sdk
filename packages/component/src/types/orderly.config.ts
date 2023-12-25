export type OrderlyConfig = {
  wallet: {
    apiKey?: string;
    options?: any;
  };
  app: {
    appIcons: {
      main?: string;
      secondary?: string;
    };
    tradingView: {
      scriptSRC: string;
      library_path: string;
    };
  };
};

export type OrderlyConfigCtx = {};
