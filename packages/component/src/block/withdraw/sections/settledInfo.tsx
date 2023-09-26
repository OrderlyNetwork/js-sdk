import Button from "@/button";
import { modal } from "@/modal";
import { AssetsContext } from "@/provider/assetsProvider";
import { Numeral } from "@/text";
import { RotateCw } from "lucide-react";
import { FC, useCallback, useContext } from "react";

interface UnsettledInfoProps {
  unsettledPnL: number;
}

export const UnsettledInfo: FC<UnsettledInfoProps> = (props) => {
  const { onSettle } = useContext(AssetsContext);
  const onSettleClick = useCallback(() => {
    modal
      .confirm({
        title: "Settle PnL",
        content: (
          <span className="text-base-contrast/50">
            Are you sure you want to settle your PnL? Settlement will take up to
            1 minute before you can withdraw your available balance.
          </span>
        ),
        onCancel() {
          return Promise.reject("cancel");
        },
        onOk() {
          return onSettle();
        },
      })
      .then(
        () => {},
        (error) => {}
      );
  }, []);

  if (props.unsettledPnL === 0) return null;
  return (
    <div className="flex items-center justify-between mt-1">
      <div className="text-sm flex items-center space-x-1 text-base-contrast/30">
        <span>{`Unsettled:`}</span>
        <Numeral coloring precision={6}>
          {props.unsettledPnL}
        </Numeral>
        <span>USDC</span>
      </div>
      <Button
        className="text-primary-light"
        size="small"
        variant={"text"}
        leftIcon={<RotateCw size={15} />}
        onClick={onSettleClick}
      >
        Settle
      </Button>
    </div>
  );
};
