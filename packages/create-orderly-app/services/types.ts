export type AppMode = "new" | "integration";

export type CreateAppOptions = {
  mode: AppMode;
  name: string;
  path: string;
  fullPath: string;
  framework: string;
  walletConnector: string;
  brokerId: string;
  brokerName: string;
  pages: string[];
  // baseOn: string;
  // themes: [],
};
