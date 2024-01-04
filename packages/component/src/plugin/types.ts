import { ReactNode } from "react";

export interface Plugin {
  get name(): string;
  get endpoint(): string;

  initialize(): void;

  render(): ReactNode;
}
