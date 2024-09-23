import {
  Badge,
  Button,
  Checkbox,
  Divider,
  Flex,
  Grid,
  Text,
  textVariants,
} from "@orderly.network/ui";
import { API, OrderSide, OrderType } from "@orderly.network/types";

type Props = {
  symbol: string;
  quote: string;
  base: string;
  side: OrderSide;
  type: OrderType;
  qty: number;
  price: number;
  total: number;
  tpPrice?: number;
  slPrice?: number;
  // symbolInfo:API.SymbolExt;
  quoteDP: number;
  baseDP: number;

  onConfirm: () => Promise<void>;
  onCancel: () => void;
};

export const OrderConfirmDialog = (props: Props) => {
  const {
    quote,
    base,
    baseDP,
    quoteDP,
    side,
    type,
    qty,
    price,
    tpPrice,
    slPrice,
    total,
    symbol,
  } = props;
  return (
    <div>
      <Flex justify={"between"}>
        <Text.formatted rule={"symbol"} showIcon>
          {symbol}
        </Text.formatted>
        <Flex justify={"end"} gapX={1}>
          {side === OrderSide.BUY ? (
            <Badge color={"buy"} size={"sm"}>
              Buy
            </Badge>
          ) : (
            <Badge color={"sell"} size={"sm"}>
              Sell
            </Badge>
          )}

          <Badge color={"neutral"} size={"sm"}>
            {type}
          </Badge>
        </Flex>
      </Flex>
      <Divider className="oui-my-4" />
      <div
        className={textVariants({
          size: "sm",
          intensity: 54,
          className: "oui-space-y-1",
        })}
      >
        <Flex justify={"between"}>
          <Text>Qty.</Text>
          <Text.numeral
            unit={"ETH"}
            rule={"price"}
            dp={baseDP}
            coloring
            unitClassName={"oui-text-base-contrast-36 oui-ml-1"}
          >
            {qty}
          </Text.numeral>
        </Flex>
        <Flex justify={"between"}>
          <Text>Order price</Text>
          <Text.numeral
            unit={"USDC"}
            rule={"price"}
            className={"oui-text-base-contrast"}
            unitClassName={"oui-text-base-contrast-36 oui-ml-1"}
          >
            {price}
          </Text.numeral>
        </Flex>
        <Flex justify={"between"}>
          <Text>Est. Total</Text>
          <Text.numeral
            unit={"USDC"}
            rule={"price"}
            dp={quoteDP}
            className={"oui-text-base-contrast"}
            unitClassName={"oui-text-base-contrast-36 oui-ml-1"}
          >
            {total}
          </Text.numeral>
        </Flex>
      </div>
      {tpPrice || slPrice ? (
        <>
          <Divider className="oui-my-4" />
          <div
            className={textVariants({
              size: "sm",
              intensity: 54,
              className: "oui-space-y-1",
            })}
          >
            {tpPrice && (
              <Flex justify={"between"}>
                <Text>TP Price</Text>
                <Text.numeral
                  unit={"ETH"}
                  rule={"price"}
                  coloring
                  dp={quoteDP}
                  unitClassName={"oui-text-base-contrast-36 oui-ml-1"}
                >
                  {tpPrice}
                </Text.numeral>
              </Flex>
            )}
            {slPrice && (
              <Flex justify={"between"}>
                <Text>SL Price</Text>
                <Text.numeral
                  unit={"ETH"}
                  rule={"price"}
                  coloring
                  unitClassName={"oui-text-base-contrast-36 oui-ml-1"}
                >
                  {slPrice}
                </Text.numeral>
              </Flex>
            )}
          </div>
        </>
      ) : null}

      <Flex gapX={1} pt={8} pb={3}>
        <Checkbox id="orderConfirm" color={"white"} />
        <label
          htmlFor="orderConfirm"
          className={textVariants({
            size: "xs",
            intensity: 54,
          })}
        >
          Disable order confirmation
        </label>
      </Flex>
      <Grid cols={2} gapX={3}>
        <Button color={"secondary"} size={"md"}>
          Cancel
        </Button>
        <Button size={"md"}>Confirm</Button>
      </Grid>
    </div>
  );
};
