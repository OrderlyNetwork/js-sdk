import { useOrderEntryFormErrorMsg } from "@orderly.network/react-app";
import { OrderType } from "@orderly.network/types";
import { Flex, Text, Grid, Checkbox } from "@orderly.network/ui";
import { PnlInputWidget } from "../../pnlInput/pnlInput.widget";
import { PriceInput } from "../../tpsl.ui";
import { OrderPriceType } from "../orderPriceType";
import { useTPSLInputRowScript } from "./tpslInputRow.script";

type Props = ReturnType<typeof useTPSLInputRowScript>;
export const TPSLInputRowUI = (props: Props) => {
  const { parseErrorMsg } = useOrderEntryFormErrorMsg(null);
  const { values } = props;
  return (
    <Flex direction={"column"} gap={2} itemAlign={"start"}>
      <Flex>
        <Checkbox
          size={18}
          className="oui-size-[18px]"
          data-testid={`oui-testid-orderEntry-${props.type}-enable-checkBox`}
          id={`enable_${props.type}`}
          color={"white"}
          checked={values.enable}
          onCheckedChange={(checked: boolean) => {
            props.onChange("enable", !!checked);
          }}
        />
        <label
          htmlFor={`enable_${props.type}`}
          className={"oui-ml-1 oui-text-sm oui-text-base-contrast-36"}
        >
          {props.type === "tp" ? "Take profit" : "Stop loss"}
        </label>
      </Flex>
      <Flex
        direction={"column"}
        itemAlign={"start"}
        className="oui-w-full oui-gap-0.5"
      >
        <Text className="oui-text-2xs oui-text-base-contrast-36">
          Trigger price
        </Text>
        <Grid cols={2} gap={2}>
          <PriceInput
            type={`${props.type} price`}
            value={values.trigger_price}
            error={parseErrorMsg(`${props.type}_trigger_price`)}
            onValueChange={(value) => {
              props.onChange(`${props.type}_trigger_price`, value);
            }}
            quote_dp={2}
          />
          <PnlInputWidget
            type={props.type === "tp" ? "TP" : "SL"}
            onChange={(key, value) => {
              console.log("key", key, "value", value);
              props.onChange(key, value as string);
            }}
            quote={"USDC"}
            quote_dp={2}
            values={values}
          />
        </Grid>
      </Flex>
      <Flex
        direction={"column"}
        className="oui-w-full oui-gap-0.5"
        itemAlign={"start"}
      >
        <Text className="oui-text-2xs oui-text-base-contrast-36">
          Order price
        </Text>

        <Grid cols={2} gap={2}>
          <PriceInput
            type={"order price"}
            label={values.order_type === OrderType.LIMIT ? "Limit" : "Market"}
            value={values.order_price}
            error={parseErrorMsg(`${props.type}_order_price`)}
            onValueChange={(value) => {
              props.onChange(`${props.type}_order_price`, value);
            }}
            quote_dp={2}
          />
          <OrderPriceType
            type={values.order_type}
            onChange={(value) => {
              props.onChange(`${props.type}_order_type`, value as OrderType);
            }}
          />
        </Grid>
      </Flex>
    </Flex>
  );
};
