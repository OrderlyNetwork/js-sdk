import Button from "@/button";
import { cn } from "@/utils/css";
import { NumberReg } from "@/utils/num";
import { Decimal } from "@orderly.network/utils";
import { ChangeEvent, FC, FormEvent, useCallback, useState } from "react";
import { set } from "react-hook-form";

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
        "rounded h-[40px] flex items-center justify-center bg-base-500 text-base-contrast text-2xs",
        isActive && "bg-primary text-base-contrast"
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

  const onValueChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    if (value === ".") {
      setCustomValue("0.");
      return;
    }

    const result = (value as string).match(NumberReg);

    if (Array.isArray(result)) {
      value = result[0];
      // value = parseFloat(value);
      if (isNaN(parseFloat(value))) {
        setCustomValue("");
      } else {
        let d = new Decimal(value);
        // setCustomValue(value);
        if (d.gt(10)) {
          setCustomValue("10");
          return;
        }
        if (d.dp() > 2) {
          setCustomValue(d.todp(2).toString());
        } else {
          setCustomValue(value);
        }
      }
    } else {
      setCustomValue("");
    }
  }, []);

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
            className="bg-base-400 w-0 rounded flex-1 h-full text-center text-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            value={customValue}
            // onChange={(e) => setCustomValue(e.target.value)}
            onChange={onValueChange}
          />
          <span className="text-2xs text-base-contrast-36">%</span>
        </div>
      </div>
      <div className="py-2 text-3xs text-base-contrast-36">
        Your transaction will revert if the price changes unfavorably by more
        than this percentage.
      </div>
      <div className="grid grid-cols-6 mt-5">
        <div className="col-start-2 col-span-4">
          <Button
            fullWidth
            onClick={onConfirm}
            disabled={!value && !customValue}
            className="text-xs"
          >
            Confirm
          </Button>
        </div>
      </div>
    </>
  );
};
