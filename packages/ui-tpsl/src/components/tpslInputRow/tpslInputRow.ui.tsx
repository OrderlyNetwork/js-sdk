import { useOrderEntryFormErrorMsg } from "@orderly.network/react-app";
import { OrderType } from "@orderly.network/types";
import { Flex, Text, Grid } from "@orderly.network/ui";
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
      <Text>{props.type === "tp" ? "Take profit" : "Stop loss"}</Text>
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
            type={"TP price"}
            value={values.trigger_price}
            error={parseErrorMsg("tp_trigger_price")}
            onValueChange={(value) => {
              // props.onPriceChange("tp_trigger_price", value);
            }}
            quote_dp={2}
          />
          <PnlInputWidget
            type={"TP"}
            onChange={() => {}}
            quote={"USDT"}
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
            label={props.priceType === OrderType.LIMIT ? "Limit" : "Market"}
            value={values.order_price}
            error={parseErrorMsg("order_price")}
            onValueChange={(value) => {
              // props.onPriceChange("tp_trigger_price", value);
            }}
            quote_dp={2}
          />
          <OrderPriceType
            type={props.priceType}
            onChange={(value) => {
              props.setPriceType(value as OrderType);
            }}
          />
        </Grid>
      </Flex>
    </Flex>
  );
};
