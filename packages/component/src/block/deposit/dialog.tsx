import { useModal } from "@/modal";
import { create } from "@/modal/modalHelper";
import { Deposit } from "./deposit";
import type { DepositProps } from "./deposit";
import { Sheet, SheetContent } from "@/sheet/sheet";
import { Dialog, DialogContent } from "@/dialog/dialog";

export const DepositWithSheet = create<DepositProps>((props) => {
  const { visible, hide, resolve, reject, onOpenChange } = useModal();

  const onOk = (data?: any) => {
    resolve(data);
    hide();
  };

  return (
    <Sheet open={visible} onOpenChange={onOpenChange}>
      <SheetContent>
        <Deposit
          onOk={onOk}
          // @ts-ignore
          dst={{
            chainId: 0,
            address: "",
            decimals: 0,
            symbol: "",
            network: "",
          }}
        />
      </SheetContent>
    </Sheet>
  );
});

export const DepositWithDialog = create<DepositProps>((props) => {
  const { visible, hide, resolve, reject, onOpenChange } = useModal();

  const onOk = (data?: any) => {
    resolve(data);
    hide();
  };

  return (
    <Dialog open={visible} onOpenChange={onOpenChange}>
      <DialogContent className="orderly-p-5" maxWidth={"lg"}>
        <Deposit
          onOk={onOk}
          // @ts-ignore
          dst={{
            chainId: 0,
            address: "",
            decimals: 0,
            symbol: "",
            network: "",
          }}
        />
      </DialogContent>
    </Dialog>
  );
});
