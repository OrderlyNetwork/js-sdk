import Button from "@/button";
import { cn } from "@/utils/css";
import { FC, useCallback, useState } from "react";

const SlippageItem = ({
  value,
  isActive,
  onClick,
}: {
  value: number;
  isActive: boolean;
  onClick: (value: number) => void;
}) => {
  return (
    <button
      onClick={() => onClick(value)}
      className={cn(
        "rounded h-[40px] flex items-center justify-center bg-base-300 text-base-contrast/80",
        isActive && "bg-primary-light text-base-contrast"
      )}
    >
      <span>{`${value}%`}</span>
    </button>
  );
};

export interface SlippageProps {
  onConfirm?: (value: number) => void;
  value?: number;
}

export const Slippage: FC<SlippageProps> = (props) => {
  const [value, setValue] = useState(props.value);
  const [customValue, setCustomValue] = useState<string | undefined>(() =>
    !!props.value && props.value > 2 ? props.value.toString() : undefined
  );

  const onClick = (value: number) => {
    setValue(value);
    setCustomValue("");
  };

  const onConfirm = useCallback(() => {
    const _value = customValue ? Number(customValue) : value;
    if (!_value) return;
    props.onConfirm?.(_value);
  }, [value, customValue]);

  return (
    <>
      <div className="grid grid-cols-4 gap-2">
        <SlippageItem
          value={0.5}
          isActive={value === 0.5 && !customValue}
          onClick={onClick}
        />
        <SlippageItem
          value={1}
          isActive={value === 1 && !customValue}
          onClick={onClick}
        />
        <SlippageItem
          value={2}
          isActive={value === 2 && !customValue}
          onClick={onClick}
        />
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            className="bg-base-300 w-0 rounded flex-1 h-full text-center"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
          />
          <span className="text-sm text-base-contrast/30">%</span>
        </div>
      </div>
      <div className="py-2 text-sm text-base-contrast/30">
        Your transaction will revert if the price changes unfavorably by more
        than this percentage.
      </div>
      <div className="grid grid-cols-6 mt-5">
        <div className="col-start-2 col-span-4">
          <Button
            fullWidth
            onClick={onConfirm}
            disabled={!value && !customValue}
          >
            Confirm
          </Button>
        </div>
      </div>
    </>
  );
};
