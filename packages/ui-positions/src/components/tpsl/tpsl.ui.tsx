import {
  Button,
  Divider,
  Flex,
  Grid,
  Input,
  Slider,
  Text,
  cn,
} from "@orderly.network/ui";
import { PnlInputWidget } from "./pnlInput/pnlInput.widget";
import { TPSLBuilderState } from "./useTPSL.script";

export const TPSL = (props: TPSLBuilderState) => {
  return (
    <div id="orderly-tp_sl-order-edit-content">
      {!props.isEditing && (
        <TPSLQuantity
          maxQty={props.maxQty}
          tick={props.symbolInfo("base_tick")}
        />
      )}

      <Divider my={4} intensity={8} />
      <TPSLPrice />
      <Grid cols={2} gap={3} mt={4}>
        <Button size={"md"} color={"secondary"}>
          Cancel
        </Button>
        <Button size={"md"}>Confirm</Button>
      </Grid>
    </div>
  );
};

const TPSLQuantity = (props: { maxQty: number; tick: number }) => {
  return (
    <>
      <Flex gap={2}>
        <div className={"oui-flex-1"}>
          <Input
            prefix={"Quantity"}
            size={"md"}
            align="right"
            autoComplete="off"
          />
        </div>
        <Button
          variant={"outlined"}
          size={"md"}
          className={cn("oui-border-primary-light oui-text-primary-light")}
        >
          Position
        </Button>
      </Flex>
      <Flex mt={2} itemAlign={"center"} height={"15px"}>
        <Slider
          markCount={5}
          color="primaryLight"
          max={props.maxQty}
          min={0}
          onValueChange={(value) => {
            console.log(value);
          }}
        />
      </Flex>
      <Flex justify={"between"}>
        <Text.numeral rule={"percentages"} color={"primaryLight"} size={"2xs"}>
          0
        </Text.numeral>
        <Flex itemAlign={"center"} gap={1}>
          <button className={"oui-leading-none"} style={{ lineHeight: 0 }}>
            <Text color={"primaryLight"} size={"2xs"}>
              Max
            </Text>
          </button>
          <Text.numeral
            rule={"price"}
            size={"2xs"}
            intensity={54}
            tick={props.tick}
          >
            {props.maxQty}
          </Text.numeral>
        </Flex>
      </Flex>
    </>
  );
};

// ------------ TPSL Price and PNL input start------------
const TPSLPrice = () => {
  return (
    <>
      <div>
        <Flex justify={"between"}>
          <Text size={"sm"}>Task profit</Text>
          <Flex>
            <Text size={"2xs"} intensity={36}>
              Est. PNL:
            </Text>
            <Text.numeral size={"2xs"} coloring showIdentifier>
              196.55
            </Text.numeral>
          </Flex>
        </Flex>
        <Grid cols={2} gap={2} pt={2} pb={4}>
          <PriceInput type={"TP"} />
          <PnlInputWidget type={"TP"} />
        </Grid>
      </div>
      <div>
        <Flex justify={"between"}>
          <Text size={"sm"}>Stop loss</Text>
          <Flex>
            <Text size={"2xs"} intensity={36}>
              Est. PNL:
            </Text>
            <Text.numeral size={"2xs"} coloring showIdentifier>
              196.55
            </Text.numeral>
          </Flex>
        </Flex>
        <Grid cols={2} gap={2} pt={2} pb={4}>
          <PriceInput type={"SL"} />
          <PnlInputWidget type={"SL"} />
        </Grid>
      </div>
    </>
  );
};
// ------------ TPSL Price and PNL input end------------
// ------------ TPSL Price input start------------
const PriceInput = (props: { type: string }) => {
  return (
    <Input
      prefix={`${props.type} price`}
      size={"md"}
      placeholder={"USDC"}
      align={"right"}
      autoComplete={"off"}
    />
  );
};
// ------------ TPSL Price input end------------

export const TPSLButton = () => {
  return (
    <Button variant="outlined" size="sm" color="secondary">
      TP/SL
    </Button>
  );
};
