import {
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
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
} from "@kodiak-finance/orderly-ui";
import { Decimal } from "@kodiak-finance/orderly-utils";

interface SlippageProps {
  initialValue?: number;
  isMobile?: boolean;
}

const options = [0.01, 0.05, 0.1];

export const SlippageEditor = forwardRef<
  { getValue: () => number | undefined },
  SlippageProps
>((props, ref) => {
  const { t } = useTranslation();
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
      setError(t("orderEntry.slippage.error.exceed"));
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
          title: t("common.tips"),
          message: <Text size="2xs">{t("orderEntry.slippage.tips")}</Text>,
        });
      }}
    >
      <ExclamationFillIcon className="oui-text-base-contrast-54" size={16} />
    </button>
  ) : (
    <Tooltip
      // @ts-ignore
      content={
        <Text intensity={80} size="2xs">
          {t("orderEntry.slippage.tips")}
        </Text>
      }
      className="oui-w-[260px] oui-bg-base-6"
      arrow={{ className: "oui-fill-base-6" }}
    >
      <TooltipTrigger>
        <ExclamationFillIcon className="oui-text-base-contrast-54" size={16} />
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
