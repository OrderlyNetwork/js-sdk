import React, { useState } from "react";
import { cn, Flex, Input, Switch } from "@orderly.network/ui";
import { Grid } from "@orderly.network/ui";

export const OrderTPSL = (props: {
  onTPSLToggle: (checked: boolean) => void;
}) => {
  const [open, setOpen] = useState(false);
  const tpslFormRef = React.useRef<HTMLDivElement>(null);

  return (
    <div>
      <Flex itemAlign={"center"} gapX={1}>
        <Switch
          id={"tpsl"}
          onCheckedChange={(checked) => {
            // console.log(checked);
            setOpen(checked);
            // props.onTPSLToggle(checked);
          }}
        />
        <label htmlFor={"tpsl"} className={"oui-text-xs"}>
          TP/SL
        </label>
      </Flex>
      <div
        className={cn(
          "oui-max-h-0 oui-overflow-hidden oui-transition-all",
          open && "oui-max-h-[100px]"
        )}
        onTransitionEnd={() => {
          console.log("transition end");
          tpslFormRef.current?.style.setProperty("opacity", open ? "1" : "0");
        }}
      >
        <TPSLInputForm
          ref={tpslFormRef}
          onChange={(key, value) => {
            console.log(key, value);
          }}
        />
      </div>
    </div>
  );
};

const TPSLInputForm = React.forwardRef<
  HTMLDivElement,
  {
    onChange: (key: string, value: any) => void;
  }
>((props, ref) => {
  return (
    <div
      ref={ref}
      className={"oui-transition-all oui-pt-2 oui-pb-2 oui-px-1 oui-space-y-1"}
    >
      <TPSLInputRow type={"TP"} />
      <TPSLInputRow type={"SL"} />
    </div>
  );
});

const TPSLInputRow = (props: { type: "TP" | "SL" }) => {
  return (
    <div>
      <Grid cols={2} gapX={1}>
        <div>
          <Input
            prefix={"TP Price"}
            size={"md"}
            classNames={{ additional: "oui-text-base-contrast-54" }}
          />
        </div>
        <div>
          <Input
            size={"md"}
            classNames={{ additional: "oui-text-base-contrast-54" }}
          />
        </div>
      </Grid>
    </div>
  );
};
