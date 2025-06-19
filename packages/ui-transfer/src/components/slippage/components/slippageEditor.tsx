import React, { useEffect, useImperativeHandle, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
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

interface SlippageRef {
  getValue: () => number | void;
}

interface SlippageProps {
  initialValue?: number;
  isMobile?: boolean;
}

interface SlippageItemProps {
  value: number;
  isActive: boolean;
  onClick: React.MouseEventHandler<HTMLElement>;
}

const options = [0.5, 1, 2];

const SlippageItem: React.FC<SlippageItemProps> = (props) => {
  const { value, isActive, onClick } = props;
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

export const SlippageEditor = React.forwardRef<SlippageRef, SlippageProps>(
  (props, ref) => {
    const { t } = useTranslation();
    const [value, setValue] = useState<number>();
    const [customValue, setCustomValue] = useState<string>("");
    const [error, setError] = useState<string | undefined>(undefined);

    useImperativeHandle(ref, () => ({
      getValue() {
        return customValue ? new Decimal(customValue)?.toNumber() : value;
      },
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
        setError(t("orderEntry.slippage.error.exceed"));
      } else {
        setCustomValue(val);
        setError(undefined);
      }
    };

    const toolTipButton = props.isMobile ? (
      <button
        onClick={() => {
          modal.alert({
            title: t("common.tips"),
            message: <Text size="2xs">{t("orderEntry.slippage.tips")}</Text>,
          });
        }}
      >
        <ExclamationFillIcon className="oui-text-base-contrast-54" size={16} />
      </button>
    ) : (
      <Tooltip
        className="oui-w-[260px] oui-bg-base-6"
        arrow={{ className: "oui-fill-base-6" }}
        content={
          <Text intensity={80} size="2xs">
            {t("orderEntry.slippage.tips")}
          </Text>
        }
      >
        <TooltipTrigger>
          <ExclamationFillIcon
            className="oui-text-base-contrast-54"
            size={16}
          />
        </TooltipTrigger>
      </Tooltip>
    );

    return (
      <div className="oui-text-2xs">
        <Flex mb={2} gapX={1}>
          <Text size="xs">{t("orderEntry.slippage")}</Text>
          {toolTipButton}
        </Flex>
        <Flex gapX={2}>
          {options.map((item) => {
            const isActive = value === item;
            return (
              <SlippageItem
                key={`item-${item}`}
                value={item}
                isActive={isActive}
                onClick={() => onClick(item)}
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
        {!!error && (
          <Box mt={5} className="-oui-mb-5">
            <Text size="2xs" color="danger">
              {error}
            </Text>
          </Box>
        )}
      </div>
    );
  },
);
