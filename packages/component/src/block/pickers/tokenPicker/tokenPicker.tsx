import { FC } from "react";
import { Select } from "@/select";
import { API } from "@orderly/core";

export interface TokenPickerProps {
  value?: API.Token;
  onChange?: (value: API.Token) => void;
  tokens: API.Token[];
}

export const TokenPicker: FC<TokenPickerProps> = (props) => {
  return (
    <>
      <Select label={"Token"} options={[]} />
    </>
  );
};
