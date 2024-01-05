import { ReactNode } from "react";

export interface Plugin {
  get name(): string;
  get positions(): PluginPosition[];

  initialize?: () => void;

  render(): ReactNode;
}

export enum PluginPosition {}
