import { FC, useState } from "react";
import {
  Badge,
  Button,
  Divider,
  Flex,
  Input,
  inputFormatter,
  SimpleSheet,
  Slider,
  Text,
  toast,
} from "@orderly.network/ui";
import { LimitCloseBtnState } from "./limitCloseBtn.script";
import { usePositionsRowContext } from "../../desktop/positionRowContext";
import { useSymbolContext } from "../../../providers/symbolProvider";
import { Decimal } from "@orderly.network/utils";

export const LimitCloseBtn: FC<LimitCloseBtnState> = (props) => {
  const { item, open, setOpen, updatePriceChange } = props;
  const isBuy = item.position_qty > 0;

  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => {
          updatePriceChange("limit");
          setOpen(true);
        }}
      >
        Limit Close
      </Button>

      {open && (
        <SimpleSheet
          title={"Limit close"}
          open={open}
          onClose={() => setOpen(false)}
        >
          <Flex
            direction={"column"}
            p={4}
            gap={3}
            width={"100%"}
            itemAlign={"start"}
            className="oui-text-sm"
          >
            <Flex width={"100%"} justify={"between"}>
              <Text.formatted rule={"symbol"} showIcon>
                {item.symbol}
              </Text.formatted>
              <Flex gap={1}>
                <Badge color="neutural" size="xs">
                  Limit
                </Badge>
                {isBuy && (
                  <Badge color="success" size="xs">
                    Buy
                  </Badge>
                )}
                {!isBuy && (
                  <Badge color="danger" size="xs">
                    Sell
                  </Badge>
                )}
              </Flex>
            </Flex>
            <Divider className="oui-w-full" />
            <Flex width={"100%"} justify={"between"}>
              <Text>Last price</Text>
              <Text.numeral dp={(props.item as any)?.symbolInfo?.duote_dp}>
                {props.curMarkPrice}
              </Text.numeral>
            </Flex>
            <Flex width={"100%"} direction={"column"} gap={2}>
              <Input
                prefix="Price"
                suffix={props.quote}
                align="right"
                fullWidth
                autoComplete="off"
                formatters={[
                  inputFormatter.numberFormatter,
                  inputFormatter.dpFormatter(props.quote_dp),
                ]}
                value={props.price}
                onValueChange={(e) => props.updatePriceChange(e)}
              />
              <Input
                prefix="Quantity"
                suffix={props.base}
                align="right"
                fullWidth
                autoComplete="off"
                formatters={[
                  inputFormatter.numberFormatter,
                  inputFormatter.dpFormatter(props.quote_dp),
                ]}
                value={props.quantity}
                onValueChange={(e) => props.updateQuantity(e)}
              />
              <Slider
                markCount={4}
                value={[props.sliderValue]}
                onValueChange={(e) => {
                  console.log("slider ", e);
                  props.setSliderValue(e[0]);
                  const qty = new Decimal(e[0])
                    .div(100)
                    .mul(props.item.position_qty)
                    .toFixed(props.base_dp, Decimal.ROUND_DOWN);
                  props.updateQuantity(qty);
                }}
              />
              <Flex width={"100%"} justify={"between"}>
                <Text
                  color="primary"
                  size="2xs"
                >{`${props.sliderValue}%`}</Text>
                <Flex gap={1}>
                  <Text size="2xs" color="primary">
                    Max
                  </Text>
                  <Text.numeral intensity={54} size="2xs">
                    {props.item.position_qty}
                  </Text.numeral>
                </Flex>
              </Flex>
            </Flex>
            <Flex width={"100%"} gap={3} mt={2}>
                <Button fullWidth color="secondary">Cancel</Button>
                <Button fullWidth >Confirm</Button>
            </Flex>
          </Flex>
        </SimpleSheet>
      )}
    </>
  );
};
