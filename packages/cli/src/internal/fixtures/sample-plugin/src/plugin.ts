import type { SamplePluginOptions } from "./types";

export function registerSamplePlugin(options: SamplePluginOptions = {}) {
  const { jwtToken } = options;
  return (_SDK: unknown) => {
    void jwtToken;
  };
}
