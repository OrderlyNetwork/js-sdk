import { FC, useEffect, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
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
  max?: number;
  min?: number;
}

const options = [0.5, 1, 2];

export const Slippage: FC<SlippageProps> = (props) => {
  const { min = 0.2, max = 10 } = props;
  const [value, setValue] = useState<number>();
  const [customValue, setCustomValue] = useState("");
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

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
    if (!val || Number(val) === 0) {
      setCustomValue(val);
      return;
    }

    const d = new Decimal(val);
    setValue(undefined);
    if (d.lt(min)) {
      setCustomValue(min.toString());
    } else if (d.gt(max)) {
      setCustomValue(max.toString());
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
              "oui-rounded-md oui-bg-base-6",
              "oui-h-[40px] oui-w-[74px]",
            ),
            input: "oui-text-base-contrast",
            additional: "oui-pl-1",
          }}
        />
      </Flex>

      <Box mt={5}>
        <Text intensity={54}>
          {t("transfer.slippage.slippageTolerance.description")}
        </Text>
      </Box>
    </div>
  );

  return (
    <>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title={t("transfer.slippage.slippageTolerance")}
        okLabel={t("common.confirm")}
        message={content}
        onOk={onConfirm}
        actions={{ primary: { disabled } }}
      />
      <Flex
        width="100%"
        justify="between"
        className="oui-cursor-pointer oui-select-none"
        onClick={showSlippage}
      >
        <Text intensity={36} size="2xs">
          {t("transfer.slippage")}
        </Text>
        <Flex gapX={1}>
          <Text size="2xs" color="primaryLight">
            {props.value}%
          </Text>
          <EditIcon className="oui-size-3 oui-text-primary-light" />
        </Flex>
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
        isActive
          ? "oui-bg-primary-light oui-text-primary-contrast/80"
          : "oui-text-base-contrast-80",
      )}
      onClick={onClick}
    >
      <Text size="sm">{value}%</Text>
    </Flex>
  );
};
