import { useDemoContext } from "@/components/demoContext";
import { useState } from "react";

type colorMode = "free" | "range";

export const Colors = () => {
  const [mode, setMode] = useState("free");
  const { onThemeChange } = useDemoContext();
  return (
    <div>
      <div>Primary</div>
      <div className="flex gap-2 py-1">
        <input
          type="color"
          onChange={(event) => {
            console.log(event.target.value);
            onThemeChange("--orderly-color-primary", event.target.value);
          }}
        />
        <input type="color" />
        <input type="color" />
      </div>
      <div>Secondary</div>
      <div>
        <input type="range" className="w-full" min={0} max={360} />
      </div>
      <div>Denger</div>
      <div>
        <input type="range" className="w-full" min={0} max={360} />
      </div>
      <div>Surface</div>
      <div>On Primary</div>
      <div>On Secondary</div>
      <div>On Background</div>
      <div>On Surface</div>
    </div>
  );
};
