type ConfigCtx = {

}

const config = (ctx:ConfigCtx) => {
  return {
  {{#if onboard}}
    wallet: {
      apiKey: "",
      options: {},
    },
  {{/if}}
    app: {
      appIcons: {
        main: "",
        secondary: "",
      },
      tradingView: {
        scriptSRC: "",
        library_path: "",
      },
    },
  };
};

export default config as (ctx:ConfigCtx) => {
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
