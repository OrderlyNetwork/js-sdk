import { FC, ReactNode, useState } from "react";
import {
  Box,
  cn,
  Flex,
  Popover,
  Select,
  SelectItem,
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
  const [open, setOpen] = useState(false);
  return (
    <Flex pl={3} justify={"between"} className="oui-py-[6px]">
      <Flex
        gap={1}
        className={cn("oui-basis-7/12", showTotal && "oui-basis-1/2")}
      >
        <Box width={"100%"}>
          <Title id="oui-order-book-header-price">
            {`${t("common.price")}(${props.quote})`}
          </Title>
        </Box>
        <Box width={"100%"}>
          <Title id="oui-order-book-header-qty" justifyEnd>
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
          {/* <Popover open={open} onOpenChange={setOpen} content={<div>5678</div>}>
            <Flex> */}
          <Title id="oui-order-book-header-total-base" justifyEnd>
            {`${t("common.total")}(${props.base})`}
          </Title>
          {/* </Flex>
          </Popover> */}
          {/* <Select valueFormatter={() => <div>123</div>} size="xs">
            <SelectItem value="1">1</SelectItem>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
          </Select> */}
        </Box>
        {showTotal && (
          <Box width={"100%"}>
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
}> = (props) => {
  const { children, justifyEnd = false } = props;
  return (
    <Flex
      id={props.id}
      className={cn(
        "oui-text-base-contrast-36 oui-text-xs oui-items-end",
        justifyEnd && "oui-justify-end"
      )}
    >
      {children}
    </Flex>
  );
};
