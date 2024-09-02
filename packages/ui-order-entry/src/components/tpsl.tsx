import React, { useState } from "react";
import { cn, Flex, Input, Switch } from "@orderly.network/ui";
import { Grid } from "@orderly.network/ui";

export const OrderTPSL = () => {
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
          }}
        />
        <label htmlFor={"tpsl"} className={"oui-text-xs"}>
          TP/SL
        </label>
      </Flex>
      <div
        className={cn(
          "oui-h-0 oui-overflow-hidden oui-transition-all oui-p-1",
          open && "oui-h-[50px]"
        )}
        onTransitionEnd={() => {
          console.log("transition end");
          tpslFormRef.current?.style.setProperty("opacity", open ? "1" : "0");
        }}
      >
        <TPSLInputForm ref={tpslFormRef} />
      </div>
    </div>
  );
};

const TPSLInputForm = React.forwardRef<HTMLDivElement, {}>((props, ref) => {
  return (
    <div ref={ref} className={"oui-transition-all"}>
      <Grid cols={2} gapX={1}>
        <Input />
        <Input />
      </Grid>
    </div>
  );
});
