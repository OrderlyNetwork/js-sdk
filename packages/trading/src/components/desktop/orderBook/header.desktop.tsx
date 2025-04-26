import React, { FC, ReactNode } from "react";
import {
  Box,
  CaretDownIcon,
  CaretUpIcon,
  cn,
  Flex,
  Popover,
} from "@orderly.network/ui";
import { useOrderBookContext } from "../../base/orderBook/orderContext";
import { useTranslation } from "@orderly.network/i18n";

interface Props {
  quote: string;
  base: string;
}

export const DesktopHeader: FC<Props> = (props) => {
  const { showTotal } = useOrderBookContext();
  const { t } = useTranslation();
  const [popoverOpen, setOpen] = React.useState<boolean>(false);
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
            content={<div>123456</div>}
          >
            <Flex
              justify="end"
              itemAlign="center"
              className="oui-transition-all oui-cursor-pointer oui-select-none oui-text-base-contrast-36 hover:oui-text-base-contrast"
            >
              <Title
                justifyEnd
                id="oui-order-book-header-total-base"
                className=""
              >
                {`${t("common.total")}(${props.base})`}
              </Title>
              {popoverOpen ? (
                <CaretUpIcon
                  color="inherit"
                  className="oui-text-3xs oui-w-4 oui-h-4"
                />
              ) : (
                <CaretDownIcon
                  color="inherit"
                  className="oui-text-3xs oui-w-4 oui-h-4"
                />
              )}
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
