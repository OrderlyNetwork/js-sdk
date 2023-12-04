import { useDemoContext } from "@/components/demoContext";
import { Input } from "@orderly.network/react";
import { useState } from "react";
import { defaultStyles } from "../mergeStyles";

export const Typography = () => {
  const { onThemeChange } = useDemoContext();
  const [fontSize, setFontSize] = useState(
    defaultStyles["--orderly-font-size-base"].replace("px", "")
  );
  return (
    <div className="space-y-3">
      <Input
        type="number"
        min={7}
        suffix="px"
        value={fontSize}
        onChange={(event) => {
          setFontSize(event?.target.value);
          onThemeChange("--orderly-font-size-base", `${event?.target.value}px`);
        }}
      />
      <Input type="text" placeholder="font-family" />
    </div>
  );
};
