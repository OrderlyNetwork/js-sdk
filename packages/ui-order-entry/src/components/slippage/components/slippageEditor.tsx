import {
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import {
  Box,
  cn,
  ExclamationFillIcon,
  Flex,
  Input,
  inputFormatter,
  modal,
  Text,
  Tooltip,
  TooltipTrigger,
} from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";

interface SlippageProps {
  initialValue?: number;
  isMobile?: boolean;
}

const options = [0.01, 0.05, 0.1];

export const SlippageEditor = forwardRef<
  { getValue: () => number | undefined },
  SlippageProps
>((props, ref) => {
  const [value, setValue] = useState<number>();
  const [customValue, setCustomValue] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  useImperativeHandle(ref, () => ({
    getValue: () =>
      customValue ? new Decimal(customValue)?.toNumber() : value,
  }));

  useEffect(() => {
    if (props.initialValue && !options.includes(props.initialValue!)) {
      setCustomValue(props.initialValue!.toString());
    } else {
      setValue(props.initialValue);
    }
  }, [props.initialValue, open]);

  const onClick = (val: number) => {
    setValue(val);
    setCustomValue("");
    setError(undefined);
  };

  const onValueChange = (val: string) => {
    if (!val) {
      setCustomValue(val);
      return;
    }

    const d = new Decimal(val);
    setValue(undefined);
    if (d.gt(3)) {
      setCustomValue("3");
      setError("The current input value cannot exceed 3%");
    } else {
      setCustomValue(val);
      setError(undefined);
    }
  };

  const toolTipButton = props.isMobile ? (
    <button
      onClick={() => {
        // setOpen(true)
        modal.alert({
          title: "Tips",
          message:
            "Your transaction will revert if the price changs unfavorably by more than this percentage.",
        });
      }}
    >
      <ExclamationFillIcon className="oui-text-base-contrast-54" size={16} />
    </button>
  ) : (
    <Tooltip
      content={
        "Your transaction will revert if the price changs unfavorably by more than this percentage."
      }
      className="oui-w-[260px]"
    >
      <TooltipTrigger>
        <ExclamationFillIcon className="oui-text-base-contrast-54" size={16} />
      </TooltipTrigger>
    </Tooltip>
  );

  return (
    <div className="oui-text-2xs">
      <Flex mb={2} gapX={1}>
        <Text size="xs">Slippage</Text>
        {toolTipButton}
      </Flex>
      <Flex gapX={2}>
        {options.map((item) => {
          const isActive = value === item;
          return (
            <SlippageItem
              key={item}
              value={item}
              isActive={isActive}
              onClick={() => {
                onClick(item);
              }}
            />
          );
        })}

        <Input
          suffix="%"
          formatters={[
            inputFormatter.numberFormatter,
            inputFormatter.dpFormatter(2),
          ]}
          value={customValue}
          onValueChange={onValueChange}
          classNames={{
            root: cn(
              "oui-bg-base-6 oui-rounded-md",
              "oui-w-[74px] oui-h-[40px]",
            ),
            input: "oui-text-base-contrast",
            additional: "oui-pl-1",
          }}
        />
      </Flex>
      {!!error && (
        <Box mt={5} className="-oui-mb-5">
          <Text size="2xs" color="danger">
            {error}
          </Text>
        </Box>
      )}
    </div>
  );
});

type SlippageItemProps = {
  value: number;
  isActive: boolean;
  onClick: () => void;
};

const SlippageItem: FC<SlippageItemProps> = ({ value, isActive, onClick }) => {
  return (
    <Flex
      intensity={600}
      justify="center"
      itemAlign="center"
      r="md"
      width={74}
      height={40}
      className={cn(
        "oui-cursor-pointer oui-select-none",
        isActive && "oui-bg-primary-light",
      )}
      onClick={onClick}
    >
      <Text size="sm" intensity={80}>
        {value}%
      </Text>
    </Flex>
  );
};
