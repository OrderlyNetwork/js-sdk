import { FC, useEffect, useState } from "react";
import {
  AlertDialog,
  Box,
  cn,
  EditIcon,
  Flex,
  Input,
  inputFormatter,
  Text,
} from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";

interface SlippageProps {
  value?: number;
  onValueChange?: (value: number) => void;
}

const options = [0.5, 1, 2];

export const Slippage: FC<SlippageProps> = (props) => {
  const [value, setValue] = useState<number>();
  const [customValue, setCustomValue] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (props.value && !options.includes(props.value!)) {
      setCustomValue(props.value!.toString());
    } else {
      setValue(props.value);
    }
  }, [props.value, open]);

  const showSlippage = () => {
    setOpen(true);
  };

  const hideSlippage = () => {
    setOpen(false);
  };

  const onClick = (val: number) => {
    setValue(val);
    setCustomValue("");
  };

  const onValueChange = (val: string) => {
    if (!val) {
      setCustomValue(val);
      return;
    }

    const d = new Decimal(val);
    setValue(undefined);
    if (d.gt(10)) {
      setCustomValue("10");
    } else {
      setCustomValue(val);
    }
  };

  const getValue = () =>
    customValue ? new Decimal(customValue)?.toNumber() : value;

  const onConfirm = () => {
    const val = getValue();
    if (!val) return Promise.resolve(true);
    props.onValueChange?.(val);
    hideSlippage();
    // if custom value in options, then clear custom value
    if (options.includes(val)) {
      setCustomValue("");
    }
    return Promise.resolve(true);
  };

  const disabled = !getValue();

  const content = (
    <div className="oui-text-2xs">
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
              "oui-w-[74px] oui-h-[40px]"
            ),
            input: "oui-text-base-contrast",
            additional: "oui-pl-1",
          }}
        />
      </Flex>

      <Box mt={5}>
        <Text intensity={54}>
          Your transaction will revert if the price changes unfavorably by more
          than this percentage.
        </Text>
      </Box>
    </div>
  );

  return (
    <>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Slippage tolerance"
        okLabel="Confirm"
        message={content}
        onOk={onConfirm}
        actions={{ primary: { disabled } }}
      />
      <Flex
        gapX={1}
        className="oui-cursor-pointer oui-select-none"
        onClick={showSlippage}
      >
        <Text intensity={36} size="2xs">
          Slippage:
        </Text>
        <Text size="2xs" color="primaryLight">
          {props.value}%
        </Text>
        <EditIcon className="oui-w-3 oui-h-3 oui-text-primary-light" />
      </Flex>
    </>
  );
};

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
        isActive && "oui-bg-primary-light"
      )}
      onClick={onClick}
    >
      <Text size="sm" intensity={80}>
        {value}%
      </Text>
    </Flex>
  );
};
