// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
import { AddonPanel } from "storybook/internal/components";
import { ThemeEditor } from "./components/editor";
import "@kodiak-finance/orderly-ui/dist/styles.css";

export const Panel = (props: any) => {
  return (
    <AddonPanel {...props}>
      <ThemeEditor />
    </AddonPanel>
  );
};
