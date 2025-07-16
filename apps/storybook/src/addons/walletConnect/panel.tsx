import React from "react";
import { AddonPanel } from "storybook/internal/components";

export const Panel = (props) => {
  return (
    <AddonPanel {...props}>
      <div>Orderly Key</div>
    </AddonPanel>
  );
};
