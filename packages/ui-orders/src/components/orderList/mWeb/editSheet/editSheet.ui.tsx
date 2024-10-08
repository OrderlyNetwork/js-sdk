import { FC } from "react";
import {
  Badge,
  Button,
  Divider,
  Flex,
  Input,
  inputFormatter,
  Slider,
  Text,
} from "@orderly.network/ui";
import { EditSheetState } from "./editSheet.script";
import { Decimal } from "@orderly.network/utils";

export const EditSheet: FC<EditSheetState> = (props) => {
  const { item } = props;
  const isBuy = item.quantity > 0;
  return (
    <Flex
      direction={"column"}
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
        {props.isAlgoOrder && (
          <Input
            prefix="Trigger price"
            suffix={props.quote}
            align="right"
            fullWidth
            autoComplete="off"
            formatters={[
              inputFormatter.numberFormatter,
              inputFormatter.dpFormatter(props.quote_dp),
            ]}
            value={props.triggerPrice}
            onValueChange={(e) => props.setTriggerPrice(e)}
          />
        )}
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
          disabled={!props.priceEdit}
          value={props.price}
          onValueChange={(e) => props.setPrice(e)}
        />
        <Input
          prefix="Quantity"
          suffix={props.base}
          align="right"
          fullWidth
          autoComplete="off"
          formatters={[
            inputFormatter.numberFormatter,
            inputFormatter.dpFormatter(props.base_dp),
            inputFormatter.rangeFormatter({ max: props.maxQty }),
          ]}
          value={props.quantity}
          onValueChange={(e) => props.setQuantity(e)}
        />
        <Slider
          markCount={4}
          value={[props.sliderValue ?? 0]}
          onValueChange={(e) => {
            props.setSliderValue(e[0]);
            const qty = new Decimal(e[0])
              .div(100)
              .mul(props.maxQty)
              .toFixed(props.base_dp, Decimal.ROUND_DOWN);
            props.setQuantity(qty);
          }}
        />
        <Flex width={"100%"} justify={"between"}>
          <Text.numeral
            color="primary"
            size="2xs"
            dp={props.base_dp}
            padding={false}
            rule="percentages"
          >{`${props.percentages ?? 0}`}</Text.numeral>
          <Flex gap={1}>
            <Text size="2xs" color="primary">
              Max
            </Text>
            <Text.numeral intensity={54} size="2xs" dp={props.base_dp}>
              {props.maxQty}
            </Text.numeral>
          </Flex>
        </Flex>
      </Flex>
      <Flex width={"100%"} gap={3} mt={2}>
        <Button
          fullWidth
          color="secondary"
          onClick={(e) => {
            props.onClose();
          }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          Confirm
        </Button>
      </Flex>
    </Flex>
  );
};
