import React, { FC, ReactNode } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
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

interface DesktopHeaderProps {
  quote: string;
  base: string;
}

const Option: React.FC<{
  item: string;
  base: string;
  onClick: React.MouseEventHandler<HTMLElement>;
}> = (props) => {
  const { item, base, onClick } = props;
  const { t } = useTranslation();
  const [coinType, setCoinType] = useLocalStorage(
    ORDERBOOK_COIN_TYPE_KEY,
    base,
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
        coinType === item && "oui-bg-base-5",
      )}
      onClick={(e) => {
        setCoinType(item);
        onClick(e);
      }}
    >
      {t("common.total")}({item})
      <div
        className={cn(
          "oui-transition-all",
          "oui-w-1",
          "oui-h-1",
          "oui-rounded-full",
          "oui-bg-gradient-to-r",
          coinType === item &&
            "oui-from-[rgb(var(--oui-gradient-brand-start))] oui-to-[rgb(var(--oui-gradient-brand-end))]",
        )}
      />
    </Flex>
  );
};

export const DesktopHeader: FC<DesktopHeaderProps> = (props) => {
  const { base, quote } = props;
  const { showTotal } = useOrderBookContext();
  const { t } = useTranslation();
  const [popoverOpen, setOpen] = React.useState<boolean>(false);
  const [coinType] = useLocalStorage(ORDERBOOK_COIN_TYPE_KEY, base);
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
            {`${t("common.price")}(${quote})`}
          </Title>
        </Box>
        <Box width={"100%"}>
          <Title
            justifyEnd
            id="oui-order-book-header-qty"
            className="oui-text-base-contrast-36"
          >
            {`${t("common.qty")}(${base})`}
          </Title>
        </Box>
      </Flex>
      <Flex
        gap={1}
        pr={3}
        className={cn("oui-basis-5/12", showTotal && "oui-basis-1/2")}
      >
        {showTotal ? (
          <>
            <Box className="oui-text-base-contrast-36" width={"100%"}>
              <Title id="oui-order-book-header-total-quote" justifyEnd>
                {`${t("common.total")}(${base})`}
              </Title>
            </Box>
            <Box className="oui-text-base-contrast-36" width={"100%"}>
              <Title justifyEnd id="oui-order-book-header-total-base">
                {`${t("common.total")}(${quote})`}
              </Title>
            </Box>
          </>
        ) : (
          <Box width={"100%"}>
            <Popover
              open={popoverOpen}
              onOpenChange={setOpen}
              contentProps={{ className: cn("oui-w-28 oui-p-1") }}
              content={
                <Flex
                  direction="column"
                  itemAlign="start"
                  className={cn("oui-w-full oui-gap-0.5")}
                >
                  {[base, quote].map((item) => {
                    return (
                      <Option
                        key={`type-${item}`}
                        item={item}
                        base={base}
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
                className="oui-cursor-pointer oui-select-none oui-text-base-contrast-36 oui-transition-all hover:oui-text-base-contrast"
              >
                <Title justifyEnd id="oui-order-book-header-total-base">
                  {`${t("common.total")}(${coinType})`}
                </Title>
                <TriggerIcon
                  color="inherit"
                  className="oui-size-4 oui-text-3xs"
                />
              </Flex>
            </Popover>
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
        "oui-items-end oui-text-xs",
        justifyEnd && "oui-justify-end",
      )}
    >
      {children}
    </Flex>
  );
};
