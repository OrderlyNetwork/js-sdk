import { FC } from "react";
import { Select } from "@/select";
import { API } from "@orderly.network/types";

export interface TokenPickerProps {
  value?: API.TokenInfo;
  onChange?: (value: API.TokenInfo) => void;
  tokens: API.TokenInfo[];
}

export const TokenPicker: FC<TokenPickerProps> = (props) => {
  return (
    <>
      <Select label={"Token"} options={[]} />
    </>
  );
};
