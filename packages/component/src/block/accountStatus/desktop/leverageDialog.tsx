import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import { useLeverage } from "@orderly.network/hooks";
import { useMarginRatio } from "@orderly.network/hooks";
import Button from "@/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/dialog";
import { Numeral } from "@/text/numeral";
import { toast } from "@/toast";
import { LeverageEditor } from "../sections/leverageEditor";

export const LeverageDialog: FC<PropsWithChildren> = (props) => {
  const [open, setOpen] = useState(false);
  const { currentLeverage } = useMarginRatio();

  const { update, maxLeverage, isLoading, leverageLevers } = useLeverage();

  const nextLeverage = useRef(maxLeverage ?? 0);

  useEffect(() => {
    nextLeverage.current = maxLeverage;
  }, [maxLeverage]);

  const onSave = (value: { leverage: number }) => {
    return Promise.resolve().then(() => {
      //   console.log("value", value);
      nextLeverage.current = value.leverage;
    });
  };

  const onSubmit = () => {
    update({ leverage: nextLeverage.current }).then(
      (res: any) => {
        setOpen(false);
        toast.success("Leverage updated");
      },
      (err: Error) => {
        console.dir(err);
        toast.error(err.message);
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} closable>
        <DialogHeader>
          <DialogTitle>Account Leverage</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="orderly-flex orderly-text-base-contrast-54 orderly-py-5 desktop:orderly-text-xs">
            <div className="orderly-flex-1">Max account leverage</div>
            <div className="orderly-flex orderly-gap-1">
              <span>Current:</span>
              <Numeral className="orderly-text-base-contrast" surfix={"x"}>
                {currentLeverage!}
              </Numeral>
            </div>
          </div>
          <div className="ordelry-my-5 orderly-h-[80px]">
            <LeverageEditor
              maxLeverage={maxLeverage}
              leverageLevers={leverageLevers}
              onSave={onSave}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            id="orderly-desktop-leverage-dialog-cancel"
            fullWidth
            color="tertiary"
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            id="orderly-desktop-leverage-dialog-save"
            fullWidth
            onClick={() => onSubmit()}
            loading={isLoading}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
