import React from "react";
import { AddonPanel } from "storybook/internal/components";
import { ThemeEditor } from "./components/editor";
import "@orderly.network/ui/dist/styles.css";

export const Panel = (props: any) => {
  return (
    <AddonPanel {...props}>
      <ThemeEditor />
    </AddonPanel>
  );
};
