import { CheckIcon, CloseIcon, Input, inputFormatter, Tooltip } from "@orderly.network/ui";
import { FC, useEffect } from "react";

export const InnerInput: FC<{
    inputRef: any;
    value: string;
    setPrice: any;
    setEditting: any;
    error?: string;
    handleKeyDown: (e: any) => void;
    onClick: (e: any) => void;
    onClose: (e: any) => void;
    dp: number;
    hintInfo?: string;
  }> = (props) => {
    const {
      inputRef,
      dp,
      value,
      setPrice,
      setEditting,
      error,
      handleKeyDown,
      onClick,
      onClose,
      hintInfo,
    } = props;
  
    useEffect(() => {
      const input = inputRef.current;
      if (input) {
        const length = input.value.length;
        input.setSelectionRange(length, length);
      }
      setEditting(true);
    }, []);
    return (
      <Tooltip content={hintInfo} open={(hintInfo?.length || 0) > 0}>
        <Input
          ref={inputRef}
          type="text"
          size="sm"
          formatters={[
            inputFormatter.numberFormatter,
            inputFormatter.dpFormatter(dp),
          ]}
          value={value}
          onValueChange={(e) => setPrice(e)}
          helpText={error}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onKeyDown={handleKeyDown}
          autoFocus
          classNames={{
            root: "oui-bg-base-700 oui-px-2 oui-py-1 oui-rounded",
            input: "oui-pr-2",
          }}
          // prefix={
          //   <CloseIcon
          //     size={14}
          //     color="white"
          //     opacity={1}
          //     className="oui-cursor-pointer oui-opacity-50 hover:oui-opacity-100"
          //     onClick={(e) => {
          //       e.stopPropagation();
          //       e.preventDefault();
          //       onClose(e);
          //     }}
          //   />
          // }
          suffix={
            <button onClick={onClick}>
              <CheckIcon
                size={18}
                color="white"
                opacity={1}
                className="oui-cursor-pointer oui-opacity-50 hover:oui-opacity-100"
              />
            </button>
          }
        />
      </Tooltip>
    );
  };