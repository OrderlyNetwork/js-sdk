import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/dialog";

import { FC, PropsWithChildren, useState } from "react";
import { Slippage, SlippageProps } from "./slippage";

interface SlippageDialogProps extends SlippageProps {}

export const SlippageDialog: FC<PropsWithChildren<SlippageDialogProps>> = (
  props
) => {
  const [visible, setVisible] = useState(false);

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent maxWidth={"xs"}>
        <DialogHeader>
          <DialogTitle className="orderly-text-xs">Slippage tolerance</DialogTitle>
        </DialogHeader>
        <DialogBody className="orderly-py-5">
          <Slippage
            {...props}
            onConfirm={(value: number) => {
              props.onConfirm?.(value);
              setVisible(false);
            }}
          />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};
