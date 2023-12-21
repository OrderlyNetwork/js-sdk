"use client";

import { useDemoContext } from "@/components/demoContext";
import { hexToRgb, rgbToHex } from "@/utils/color";
import { useEffect, useState } from "react";
import { defaultStyles, getDefaultColors } from "../mergeStyles";

// const colors = getDefaultColors();

const ColorInput = ({
  name,
  onChange,
  selector,
}: {
  name: string;
  selector?: string;
  onChange: (name: string, color: string) => void;
}) => {
  const { colors } = useDemoContext();

  const [color, setColor] = useState(rgbToHex(colors[name]));

  useEffect(() => {
    setColor(rgbToHex(colors[name]));
  }, [colors[name]]);

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
        const el = document.querySelectorAll(`.outline-offset-2`);
        if (el) {
          // el.classList.add("outline");
          el.forEach((e) => {
            e.classList.remove(
              "outline",
              "outline-offset-2",
              "outline-white/30"
            );
          });
        }
      }}
      onFocus={(event) => {
        if (selector) {
          const el = document.querySelectorAll(selector);

          if (el) {
            // el.classList.add("outline");
            el.forEach((e) => {
              e.classList.add(
                "outline",
                "outline-offset-2",
                "outline-white/30"
              );
            });
          }
        }
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
            selector=".orderly-bg-base-100,.orderly-text-base-100,.orderly-border-base-100"
          />

          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-base-200"
            selector=".orderly-bg-base-200,.orderly-text-base-200,.orderly-border-base-200"
          />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-base-300"
            selector=".orderly-bg-base-300,.orderly-text-base-300,.orderly-border-base-300"
          />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-base-400"
            selector=".orderly-bg-base-400,.orderly-text-base-400,.orderly-border-base-400"
          />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-base-500"
            selector=".orderly-bg-base-500,.orderly-text-base-500,.orderly-border-base-500"
          />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-base-600"
            selector=".orderly-bg-base-600,.orderly-text-base-600,.orderly-border-base-600"
          />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-base-700"
            selector=".orderly-bg-base-700,.orderly-text-base-700,.orderly-border-base-700"
          />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-base-800"
            selector=".orderly-bg-base-800,.orderly-text-base-800,.orderly-border-base-800"
          />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-base-900"
            selector=".orderly-bg-base-900,.orderly-text-base-900,.orderly-border-base-900"
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
      <div className="flex gap-5">
        <div>
          <div>Primary</div>
          <div className="flex gap-2 py-1">
            <ColorInput
              onChange={onThemeChange}
              name="--orderly-color-primary-darken"
              selector=".orderly-bg-primary-darken,.orderly-text-primary-darken,.orderly-border-primary-darken"
            />

            <ColorInput
              onChange={onThemeChange}
              name="--orderly-color-primary"
              selector=".orderly-bg-primary,.orderly-text-primary,.orderly-border-primary"
            />
            <ColorInput
              onChange={onThemeChange}
              name="--orderly-color-primary-light"
              selector=".orderly-bg-primary-light,.orderly-text-primary-light,.orderly-border-primary-light"
            />
            <ColorInput
              onChange={onThemeChange}
              name="--orderly-color-primary-contrast"
              selector=".orderly-bg-primary-light,.orderly-bg-primary-darken,.orderly-border-primary"
            />
          </div>
        </div>

        <div>
          <div>Success</div>
          <div className="flex gap-2 py-1">
            <ColorInput
              onChange={onThemeChange}
              name="--orderly-color-success-darken"
              selector=".orderly-bg-success-darken,.orderly-text-success-darken"
            />

            <ColorInput
              onChange={onThemeChange}
              name="--orderly-color-success"
              selector=".orderly-bg-success,.orderly-text-success"
            />
            <ColorInput
              onChange={onThemeChange}
              name="--orderly-color-success-light"
              selector=".orderly-bg-success-light,.orderly-text-success-light"
            />
            <ColorInput
              onChange={onThemeChange}
              name="--orderly-color-success-contrast"
              selector=".orderly-bg-success-light,.orderly-bg-success-darken,.orderly-border-success"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-5">
        <div>
          <div>Danger</div>
          <div className="flex gap-2 py-1">
            <ColorInput
              onChange={onThemeChange}
              name="--orderly-color-danger-darken"
              selector=".orderly-bg-danger-darken,.orderly-text-danger-darken"
            />

            <ColorInput
              onChange={onThemeChange}
              name="--orderly-color-danger"
              selector="orderly-bg-danger,orderly-text-danger"
            />
            <ColorInput
              onChange={onThemeChange}
              name="--orderly-color-danger-light"
              selector=".orderly-bg-danger-light,.orderly-text-danger-light"
            />
            <ColorInput
              onChange={onThemeChange}
              name="--orderly-color-danger-contrast"
              selector=".orderly-bg-danger-light,.orderly-bg-danger-darken,.orderly-border-danger"
            />
          </div>
        </div>
        <div>
          <div>Warning</div>
          <div className="flex gap-2 py-1">
            <ColorInput
              onChange={onThemeChange}
              name="--orderly-color-warning-darken"
              selector=".orderly-bg-warning-darken,.orderly-text-warning-darken"
            />
            <ColorInput
              onChange={onThemeChange}
              name="--orderly-color-warning"
              selector=".orderly-bg-warning,.orderly-text-warning"
            />
            <ColorInput
              onChange={onThemeChange}
              name="--orderly-color-warning-light"
              selector=".orderly-bg-warning-light,.orderly-text-warning-light"
            />
            <ColorInput
              onChange={onThemeChange}
              name="--orderly-color-warning-contrast"
              selector=".orderly-bg-warning-light,.orderly-bg-warning-darken,.orderly-border-warning"
            />
          </div>
        </div>
      </div>

      <div>
        <div>Trade</div>
        <div className="flex gap-2 py-1">
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-trading-profit"
            selector=".orderly-bg-trade-profit,.orderly-text-trade-profit"
          />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-trading-profit-contrast"
            selector=".orderly-bg-trade-profit-contrast,.orderly-text-trade-profit-contrast"
          />

          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-trading-loss"
            selector=".orderly-bg-trade-loss,.orderly-text-trade-loss"
          />
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-trading-loss-contrast"
            selector=".orderly-bg-trade-loss-contrast,.orderly-text-trade-loss-contrast"
          />
        </div>
      </div>
      <div>
        <div>Divider</div>
        <div className="flex gap-2 py-1">
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-divider"
            selector=".orderly-bg-divider,.orderly-text-divider,.orderly-border-divider"
          />
        </div>
      </div>
      <div>
        <div>Link</div>
        <div className="flex gap-2 py-1">
          <ColorInput
            onChange={onThemeChange}
            name="--orderly-color-link"
            selector=".orderly-bg-link,.orderly-text-link,.orderly-border-link"
          />
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
