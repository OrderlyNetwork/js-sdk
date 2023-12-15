import { Input } from "@/input";
import { InputMask } from "@/input/inputMask";
import { Search } from "lucide-react";
import { FC, useCallback, useEffect, useState } from "react";

export interface SearchFormProps {
  onChange?: (value: string) => void;
  value?: string;
}

export const SearchForm: FC<SearchFormProps> = (props) => {
  // const [key, setKey] = useState<string>("");

  const onClean = useCallback(() => {
    //
    props.onChange?.("");
  }, []);

  // useEffect(() => {
  //   props.onChange?.(key);
  // }, [key]);

  return (
    <Input
      fullWidth
      placeholder={"Search instrument"}
      onClean={onClean}
      value={props.value}
      containerClassName="orderly-bg-base-900"
      className="orderly-text-2xs"
      onChange={(event) => {
        props.onChange?.(event.target.value);
      }}
      prefix={
        <InputMask>
          {/* @ts-ignore */}
          <Search size={16} className="orderly-text-base-contrast-20" />
        </InputMask>
      }
    />
  );
};
