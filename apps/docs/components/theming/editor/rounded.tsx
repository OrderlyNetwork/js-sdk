import { useState } from "react";
import { defaultStyles } from "../mergeStyles";
import { useDemoContext } from "@/components/demoContext";
import { Input } from "@orderly.network/react";

const RoundedInput = ({
  name,
  onChange,
  label,
}: {
  name: string;
  label: string;
  onChange: (name: string, value: string) => void;
}) => {
  const [value, setValue] = useState(defaultStyles[name].replace("px", ""));
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

export const Rounded = () => {
  const { onThemeChange } = useDemoContext();
  return (
    <div className="flex space-x-2">
      <RoundedInput
        name={"--orderly-rounded-sm"}
        label="sm"
        onChange={onThemeChange}
      />
      <RoundedInput
        name={"--orderly-rounded"}
        label="default"
        onChange={onThemeChange}
      />
      <RoundedInput
        name={"--orderly-rounded-lg"}
        label="lg"
        onChange={onThemeChange}
      />
      <RoundedInput
        name={"--orderly-rounded-full"}
        label="full"
        onChange={onThemeChange}
      />
    </div>
  );
};
