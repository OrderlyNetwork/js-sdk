import { FC, useContext, useMemo } from "react";
import { OrderBookContext } from "../orderContext";
import { Box, cn, Flex } from "@orderly.network/ui";

interface Props {
  quote: string;
  base: string;
}

export const DesktopHeader: FC<Props> = (props) => {
  const { showTotal } = useContext(OrderBookContext);
  return (
    <Flex justify={"between"} gap={1} className="oui-py-[6px]">
      <Flex gap={1} className={cn("oui-w-2/3", showTotal && "oui-basis-1/2")}>
        <Box width={"100%"}>
          <Title
            name="Price"
            token={props.quote}
            id="oui-order-book-header-price"
          />
        </Box>
        <Box width={"100%"}>
          <Title
            name="Qty"
            token={props.base}
            id="oui-order-book-header-qty"
            justifyEnd
          />
        </Box>
      </Flex>
      <Flex gap={1} className={cn("oui-w-1/3", showTotal && "oui-basis-1/2")}>
        <Box width={"100%"}>
          <Title
            name="Total"
            token={props.base}
            id="oui-order-book-header-total-base"
            justifyEnd
          />
        </Box>
        {showTotal && (
          <Box width={"100%"}>
            <Title
              name="Total"
              token={props.quote}
              id="oui-order-book-header-total-quote"
              justifyEnd
            />
          </Box>
        )}
      </Flex>
    </Flex>
  );
};

const Title: FC<{
  name: string;
  token: string;
  justifyEnd?: boolean;
  id?: string;
}> = (props) => {
  const { name, token, justifyEnd = false } = props;
  return (
    <Flex
      id={props.id}
      className={cn(
        "oui-text-base-contrast-36 oui-text-xs oui-items-end",
        justifyEnd && "oui-justify-end"
      )}
    >
      <span>{name}</span>
      <span>{`(${token})`}</span>
    </Flex>
  );
};
