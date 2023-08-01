import { FC } from "react";
import { Select } from "@/select";

export interface TokenPickerProps {
  value?: string;
  onChange?: (value: string) => void;
}

export const TokenPicker: FC<TokenPickerProps> = (props) => {
  return (
    <>
      <Select label={"Token"} />
    </>
  );
};
