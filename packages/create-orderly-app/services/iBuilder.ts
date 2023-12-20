import { CreateAppOptions } from "@/services/types";

export interface IBuilder {
  // new (options: CreateAppOptions): IBuilder;
  showWelcomeMessage(): string;
  createBaseProject(): Promise<any>;
  configure(): Promise<any>;
  // configureWalletConnector(): Promise<any>;
  // updateDependencies(): Promise<any>;
  showSuccessMessage(): string;
}
