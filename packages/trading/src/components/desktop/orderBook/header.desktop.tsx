import React, { FC, ReactNode } from "react";
import {
  Box,
  CaretDownIcon,
  CaretUpIcon,
  cn,
  Flex,
  Popover,
} from "@orderly.network/ui";
import {
  ORDERBOOK_COIN_TYPE_KEY,
  useOrderBookContext,
} from "../../base/orderBook/orderContext";
import { useTranslation } from "@orderly.network/i18n";
import { useLocalStorage } from "@orderly.network/hooks";

interface DesktopHeaderProps {
  quote: string;
  base: string;
}

const Option: React.FC<{
  item: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
}> = (props) => {
  const { item, onClick } = props;
  const { t } = useTranslation();
  const [coinType, setCoinType] = useLocalStorage(
    ORDERBOOK_COIN_TYPE_KEY,
    "ETH"
  );
  return (
    <Flex
      justify="between"
      itemAlign="center"
      className={cn(
        "oui-w-full oui-px-2 oui-py-[3px]",
        "oui-cursor-pointer",
        "oui-text-xs",
        "oui-text-base-contrast-54",
        "hover:oui-bg-base-6",
        "oui-rounded-[3px]",
        "oui-transition-all",
        coinType === item ? "oui-bg-base-5" : undefined
      )}
      onClick={(e) => {
        setCoinType(item);
        onClick?.(e);
      }}
    >
      {t("common.total")}({item})
      <div
        className="oui-transition-all oui-w-1 oui-h-1 oui-rounded-full"
        style={{
          backgroundImage:
            coinType === item
              ? `linear-gradient(270deg, #59B0FE 0%, #26FEFE 100%)`
              : "none",
        }}
      />
    </Flex>
  );
};

export const DesktopHeader: FC<DesktopHeaderProps> = (props) => {
  const { showTotal } = useOrderBookContext();
  const { t } = useTranslation();
  const [popoverOpen, setOpen] = React.useState<boolean>(false);
  const [coinType] = useLocalStorage<string>(ORDERBOOK_COIN_TYPE_KEY, "ETH");
  const TriggerIcon = popoverOpen ? CaretUpIcon : CaretDownIcon;
  return (
    <Flex pl={3} justify={"between"} className="oui-py-[6px]">
      <Flex
        gap={1}
        className={cn("oui-basis-7/12", showTotal && "oui-basis-1/2")}
      >
        <Box width={"100%"}>
          <Title
            id="oui-order-book-header-price"
            className="oui-text-base-contrast-36"
          >
            {`${t("common.price")}(${props.quote})`}
          </Title>
        </Box>
        <Box width={"100%"}>
          <Title
            justifyEnd
            id="oui-order-book-header-qty"
            className="oui-text-base-contrast-36"
          >
            {`${t("common.qty")}(${props.base})`}
          </Title>
        </Box>
      </Flex>
      <Flex
        gap={1}
        pr={3}
        className={cn("oui-basis-5/12", showTotal && "oui-basis-1/2")}
      >
        <Box width={"100%"}>
          <Popover
            open={popoverOpen}
            onOpenChange={setOpen}
            contentProps={{ className: cn("oui-p-1 oui-w-28") }}
            content={
              <Flex
                direction="column"
                itemAlign="start"
                className={cn("oui-w-full oui-gap-0.5")}
              >
                {[props.base, props.quote].map((item) => {
                  return (
                    <Option
                      key={`type-${item}`}
                      item={item}
                      onClick={() => setOpen(false)}
                    />
                  );
                })}
              </Flex>
            }
          >
            <Flex
              justify="end"
              itemAlign="center"
              className="oui-transition-all oui-cursor-pointer oui-select-none oui-text-base-contrast-36 hover:oui-text-base-contrast"
            >
              <Title justifyEnd id="oui-order-book-header-total-base">
                {`${t("common.total")}(${coinType})`}
              </Title>
              <TriggerIcon
                color="inherit"
                className="oui-text-3xs oui-w-4 oui-h-4"
              />
            </Flex>
          </Popover>
        </Box>
        {showTotal && (
          <Box className="oui-text-base-contrast-36" width={"100%"}>
            <Title id="oui-order-book-header-total-quote" justifyEnd>
              {`${t("common.total")}(${props.quote})`}
            </Title>
          </Box>
        )}
      </Flex>
    </Flex>
  );
};

const Title: FC<{
  justifyEnd?: boolean;
  id?: string;
  children: ReactNode;
  className?: string;
}> = (props) => {
  const { children, className, justifyEnd = false } = props;
  return (
    <Flex
      id={props.id}
      className={cn(
        className,
        "oui-text-xs oui-items-end",
        justifyEnd && "oui-justify-end"
      )}
    >
      {children}
    </Flex>
  );
};
