import { FC } from "react";
import { Box, cn, Flex } from "@orderly.network/ui";
import { useOrderBookContext } from "../../base/orderBook/orderContext";

interface Props {
  quote: string;
  base: string;
}

export const DesktopHeader: FC<Props> = (props) => {
  const { showTotal } = useOrderBookContext();
  return (
    <Flex pl={3} justify={"between"} className="oui-py-[6px]">
      <Flex gap={1} className={cn("oui-basis-7/12", showTotal && "oui-basis-1/2")}>
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
      <Flex gap={1} pr={3} className={cn("oui-basis-5/12", showTotal && "oui-basis-1/2")}>
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
