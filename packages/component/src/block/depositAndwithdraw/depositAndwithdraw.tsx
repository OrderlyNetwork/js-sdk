import { TabPane, Tabs } from "@/tab";
import { FC, useEffect, useState } from "react";
import { Withdraw } from "../withdraw";
import { useModal, modal } from "@orderly.network/ui";
import { Sheet, SheetContent } from "@/sheet";
import { AssetsProvider } from "@/provider/assetsProvider";
import { Dialog, DialogContent } from "@/dialog";
import { DepositSlot } from "./slot";
import { ArrowDownToLineIcon } from "@/icon";
import { Deposit } from "../deposit";

type activeName = "deposit" | "withdraw";

interface DepositAndWithdrawProps {
  activeTab: activeName;
  // mode?: "sheet" | "dialog";
  onCancel?: () => void;
  onOk?: () => void;
}

export const DepositAndWithdraw: FC<DepositAndWithdrawProps> = (props) => {
  const [value, setValue] = useState<any>(() => props.activeTab ?? "deposit");

  return (
    <AssetsProvider>
      <Tabs
        id="orderly-deposit-and-withdraw"
        value={value}
        onTabChange={setValue}
        tabBarClassName="orderly-border-b-0 orderly-px-0"
      >
        <TabPane
          id="orderly-deposit-pane"
          title={
            <div className="orderly-flex orderly-items-center orderly-gap-1 orderly-text-xs desktop:orderly-text-lg">
              <ArrowDownToLineIcon className="orderly-w-[10px] orderly-h-[10px] desktop:orderly-w-[16px] desktop:orderly-h-[16px]" />
              <span>Deposit</span>
            </div>
          }
          value="deposit"
        >
          <div className="orderly-py-3 orderly-px-[2px]">
            {/* <DepositSlot onOk={props.onOk!} /> */}
            <Deposit onOk={props.onOk} />
          </div>
        </TabPane>
        <TabPane
          id="orderly-withdraw-pane"
          title={
            <div className="orderly-flex orderly-items-center orderly-gap-1 orderly-text-xs desktop:orderly-text-lg">
              <ArrowDownToLineIcon className="orderly-w-[10px] orderly-h-[10px] desktop:orderly-w-[16px] desktop:orderly-h-[16px] orderly-rotate-180" />
              <span>Withdraw</span>
            </div>
          }
          value="withdraw"
        >
          <div className="orderly-py-3 orderly-px-[2px]">
            <Withdraw onOk={props.onOk} />
          </div>
        </TabPane>
      </Tabs>
    </AssetsProvider>
  );
};

export const DepositAndWithdrawWithSheet =
  modal.create<DepositAndWithdrawProps>((props) => {
    const { visible, hide, resolve, reject, onOpenChange } = useModal();

    const onOk = (data?: any) => {
      resolve(data);
      hide();
    };

    return (
      <Sheet open={visible} onOpenChange={onOpenChange}>
        <SheetContent>
          <DepositAndWithdraw activeTab={props.activeTab} onOk={onOk} />
        </SheetContent>
      </Sheet>
    );
  });

// export const DepositAndWithdrawWithDialog =
//   modal.create<DepositAndWithdrawProps>((props) => {
//     const { visible, hide, resolve, reject, onOpenChange } = useModal();
//     const [top, setTop] = useState<string | number>("20%");

//     const onOk = (data?: any) => {
//       resolve(data);
//       hide();
//     };

//     useEffect(() => {
//       setTop((window.innerHeight - 500) * 0.5);
//     }, [window.innerHeight]);

//     return (
//       <Dialog open={visible} onOpenChange={onOpenChange}>
//         <DialogContent
//           style={{ top }}
//           className="orderly-p-5 orderly-top-[20%] orderly-translate-y-0"
//           maxWidth={"lg"}
//           closable
//         >
//           <DepositAndWithdraw activeTab={props.activeTab} onOk={onOk} />
//         </DialogContent>
//       </Dialog>
//     );
//   });
