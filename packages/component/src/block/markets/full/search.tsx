import { FC } from "react";
import { Input } from "@/input";
import { InputMask } from "@/input/inputMask";
import {
  useDebouncedCallback,
  useThrottledCallback,
} from "@orderly.network/hooks";
import { Search } from "lucide-react";

interface Props {
  onSearch: (key: string) => void;
  keyword?: string;
  onMoving?: (direction: MoveDirection) => void;

  onSymbolSelect?: () => void;
}

export enum MoveDirection {
  Up,
  Down,
}

export const SearchForm: FC<Props> = (props) => {
  const onMoving = (direction: MoveDirection, e: React.KeyboardEvent) => {
    props.onMoving?.(direction);
    e.preventDefault();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { keyCode } = e;

    if (keyCode === 40) {
      // console.log("down")
      onMoving?.(MoveDirection.Down, e);
    } else if (keyCode === 38) {
      // console.log("up")
      onMoving?.(MoveDirection.Up, e);
    } else if (keyCode === 13) {
      // console.log("enter")
      // onMoving?.(MoveDirection.Up, e);
      props.onSymbolSelect?.();
    }
  };

  const onChange = useDebouncedCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // console.log(e.target.value);

      props.onSearch(e.target.value);
    },
    200
  );

  // const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {

  // }

  return (
    <Input
      placeholder="Search"
      onKeyDown={handleKeyDown}
      onChange={onChange}
      autoFocus
      // value={props.keyword}
      prefix={
        <InputMask>
          {/* @ts-ignore */}
          <Search size={20} className="orderly-text-base-contrast-20" />
        </InputMask>
      }
    />
  );
};
