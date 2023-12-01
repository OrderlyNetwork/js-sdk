import { useDemoContext } from "@/components/demoContext";
import { hexToRgb, rgbToHex } from "@/utils/color";
import { useState } from "react";
import { defaultStyles } from "../mergeStyles";

type colorMode = "free" | "range";

const ColorInput = ({
  name,
  onChange,
}: {
  name: string;
  onChange: (name: string, color: string) => void;
}) => {
  const [color, setColor] = useState(rgbToHex(defaultStyles[name]));

  return (
    <input
      type="color"
      value={color}
      onChange={(event) => {
        const rgb = hexToRgb(event.target.value);
        // onThemeChange("--orderly-color-primary-darken", rgb.join(" "));
        setColor(event.target.value);
        onChange(name, rgb.join(" "));
      }}
      onBlur={(event) => {
        console.log("blur", event.target.value);
      }}
    />
  );
};

export const Colors = () => {
  // const [mode, setMode] = useState("free");
  const { onThemeChange } = useDemoContext();
  return (
    <div className="space-y-3">
      <div>
        <div>Base</div>
        <div className="flex gap-2 py-1">
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-base-100"
          />

          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-base-200"
          />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-base-300"
          />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-base-400"
          />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-base-500"
          />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-base-600"
          />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-base-700"
          />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-base-800"
          />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-base-900"
          />
        </div>
      </div>
      <div>
        <div>Base text</div>
        <div className="flex gap-2 py-1">
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-base-foreground"
          />
        </div>
      </div>
      <div>
        <div>Primary</div>
        <div className="flex gap-2 py-1">
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-primary-darken"
          />

          <ColorInput onChange={onThemeChange} name="--orderly-color-primary" />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-primary-light"
          />
        </div>
      </div>
      <div>
        <div>Success</div>
        <div className="flex gap-2 py-1">
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-success-darken"
          />

          <ColorInput onChange={onThemeChange} name="--orderly-color-success" />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-success-light"
          />
        </div>
      </div>

      <div>
        <div>Danger</div>
        <div className="flex gap-2 py-1">
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-danger-darken"
          />

          <ColorInput onChange={onThemeChange} name="--orderly-color-danger" />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-danger-light"
          />
        </div>
      </div>
      <div>
        <div>Trade</div>
        <div className="flex gap-2 py-1">
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-trading-profit"
          />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-trading-profit-contrast"
          />

          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-trading-loss"
          />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-trading-loss-contrast"
          />
        </div>
      </div>
      <div>
        <div>Divider</div>
        <div className="flex gap-2 py-1">
          <ColorInput onChange={onThemeChange} name="--orderly-color-divider" />
        </div>
      </div>

      {/* <div>Secondary</div>
      <div>
        <input type="range" className="w-full" min={0} max={360} />
      </div>
      <div>Denger</div>
      <div>
        <input type="range" className="w-full" min={0} max={360} />
      </div> */}
    </div>
  );
};
