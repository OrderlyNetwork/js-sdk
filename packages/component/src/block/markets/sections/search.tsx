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
      onChange={(event) => {
        props.onChange?.(event.target.value);
      }}
      prefix={
        <InputMask>
          <Search size={16} />
        </InputMask>
      }
    />
  );
};
