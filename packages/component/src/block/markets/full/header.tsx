import Button from "@/button";
import { MoveDirection, SearchForm } from "./search";
import { X } from "lucide-react";
import { FC } from "react";

interface Props {
  onClose?: () => void;
  onSearch: (key: string) => void;
  keyword?: string;
  onMoving?: (direction: MoveDirection) => void;
  onSymbolSelect?: () => void;
}

export const Header: FC<Props> = (props) => {
  const onClick = () => {
    props.onClose?.();
  };
  return (
    <div className="orderly-flex orderly-items-center orderly-px-5 orderly-pt-5 orderly-pb-2 orderly-bg-base-800">
      <div className="orderly-w-full orderly-mr-2">
        <SearchForm
          onSearch={props.onSearch}
          keyword={props.keyword}
          onMoving={props.onMoving}
          onSymbolSelect={props.onSymbolSelect}
        />
      </div>
      <button
        className="orderly-text-base-contrast-80 hover:orderly-bg-tertiary/10 orderly-h-full orderly-px-2 orderly-rounded"
        onClick={onClick}
      >
        {/* @ts-ignore */}
        <X size={20} />
      </button>
    </div>
  );
};
