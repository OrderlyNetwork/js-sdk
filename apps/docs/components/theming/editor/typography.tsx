import { useDemoContext } from "@/components/demoContext";
import { Input } from "@orderly.network/react";
import { useState } from "react";

const FontSizeInput = ({
  name,
  onChange,
  label,
}: {
  name: string;
  label: string;
  onChange: (name: string, value: string) => void;
}) => {
  const { theme } = useDemoContext();
  const [value, setValue] = useState(theme[name]?.replace("px", ""));
  return (
    <div className="flex flex-col items-center gap-1">
      <Input
        min={0}
        type="number"
        value={value}
        max={9999}
        onChange={(event) => {
          setValue(event.target.value);
          onChange(name, `${event.target.value}px`);
        }}
        className="w-[56px] bg-transparent text-center"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
};

export const Typography = () => {
  const { onThemeChange, theme } = useDemoContext();
  const [fontSize, setFontSize] = useState(
    theme["--orderly-font-size-base"].replace("px", "")
  );
  return (
    <div className="space-y-3">
      {/* <Input
        type="number"
        min={7}
        suffix="px"
        value={fontSize}
        onChange={(event) => {
          setFontSize(event?.target.value);
          onThemeChange("--orderly-font-size-base", `${event?.target.value}px`);
        }}
      /> */}
      <div className="grid grid-cols-4 gap-2">
        <FontSizeInput
          name="--orderly-font-size-4xs"
          label="4xs"
          onChange={onThemeChange}
        />
        <FontSizeInput
          name="--orderly-font-size-3xs"
          label="3xs"
          onChange={onThemeChange}
        />
        <FontSizeInput
          name="--orderly-font-size-2xs"
          label="2xs"
          onChange={onThemeChange}
        />
        <FontSizeInput
          name="--orderly-font-size-xs"
          label="xs"
          onChange={onThemeChange}
        />
        <FontSizeInput
          name="--orderly-font-size-sm"
          label="sm"
          onChange={onThemeChange}
        />
      </div>
      <Input type="text" placeholder="font-family" />
    </div>
  );
};
