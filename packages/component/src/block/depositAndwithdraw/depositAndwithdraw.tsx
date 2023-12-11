import { TabPane, Tabs } from "@/tab";
import { ArrowDownToLine, ArrowUpToLine } from "lucide-react";
import { FC, useState } from "react";
import { Withdraw } from "../withdraw";
import { Deposit } from "../deposit/deposit";
import { create } from "@/modal/modalHelper";
import { useModal } from "@/modal";
import { Sheet, SheetContent } from "@/sheet";
import { AssetsProvider } from "@/provider/assetsProvider";
import { Dialog, DialogContent } from "@/dialog";

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
        value={value}
        onTabChange={setValue}
        tabBarClassName="orderly-border-b-0 orderly-px-0"
      >
        <TabPane
          title={
            <div className="orderly-flex orderly-items-center orderly-gap-1 orderly-text-xs desktop:orderly-text-xl">
              {/* @ts-ignore */}
              <ArrowDownToLine size={15} /> <span>Deposit</span>
            </div>
          }
          value="deposit"
        >
          <div className="orderly-py-3 orderly-px-[2px]">
            <Deposit
              onOk={props.onOk}
              // @ts-ignore
              dst={{
                chainId: 0,
                address: "",
                decimals: 0,
                symbol: "",
                network: "",
              }}
            />
          </div>
        </TabPane>
        <TabPane
          title={
            <div className="orderly-flex orderly-items-center orderly-gap-1 orderly-text-xs desktop:orderly-text-xl">
              {/* @ts-ignore */}
              <ArrowUpToLine size={15} /> <span>Withdraw</span>
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

export const DepositAndWithdrawWithSheet = create<DepositAndWithdrawProps>(
  (props) => {
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
  }
);

export const DepositAndWithdrawWithDialog = create<DepositAndWithdrawProps>(
  (props) => {
    const { visible, hide, resolve, reject, onOpenChange } = useModal();

    const onOk = (data?: any) => {
      resolve(data);
      hide();
    };

    return (
      <Dialog open={visible} onOpenChange={onOpenChange}>
        <DialogContent className="orderly-p-5" maxWidth={"md"}>
          <DepositAndWithdraw activeTab={props.activeTab} onOk={onOk} />
        </DialogContent>
      </Dialog>
    );
  }
);
