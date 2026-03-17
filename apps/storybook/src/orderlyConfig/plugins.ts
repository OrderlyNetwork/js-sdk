import { registerOnrampPlugin } from "@orderly.network/onramp-plugin";

export const plugins = [
  registerOnrampPlugin({
    apiKey: "pk_prod_01JWTGETB1H32953X7KR3DSH1S",
    secretKey: "sk_prod_01JWTGETB1H32953X7KR3DSH1S",
    workerUrl: "https://gentle-butterfly-db9c.han-eff.workers.dev/",
  }),
];
