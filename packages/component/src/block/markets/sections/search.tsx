import { Input } from "@/input";
import { InputMask } from "@/input/inputMask";
import { Search } from "lucide-react";
import { useCallback, useState } from "react";

export interface SearchFormProps {
  onChange: (value: string) => void;
}

export const SearchForm = () => {
  const [key, setKey] = useState<string>("");
  const onClean = useCallback(() => {
    // console.log("clean");
    setKey("");
  }, []);
  return (
    <Input
      fullWidth
      placeholder={"Search instrument"}
      onClean={onClean}
      value={key}
      onChange={(event) => {
        setKey(event.target.value);
      }}
      prefix={
        <InputMask>
          <Search />
        </InputMask>
      }
    />
  );
};
