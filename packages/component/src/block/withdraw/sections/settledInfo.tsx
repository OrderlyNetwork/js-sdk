import Button from "@/button";
import { modal } from "@/modal";
import { AssetsContext } from "@/provider/assetsProvider";
import { Numeral } from "@/text";
import { RotateCw } from "lucide-react";
import { FC, useCallback, useContext } from "react";

interface UnsettledInfoProps {
  unsettledPnL: number;
  hasPositions: boolean;
}

export const UnsettledInfo: FC<UnsettledInfoProps> = (props) => {
  const { onSettle } = useContext(AssetsContext);
  const onSettleClick = useCallback(() => {
    modal
      .confirm({
        title: "Settle PnL",
        content: (
          <span className="orderly-text-base-contrast-54 orderly-text-2xs">
            Are you sure you want to settle your PnL? It may take one minute
            before you can withdraw it.
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

  if (props.unsettledPnL === 0 && props.hasPositions === false) return null;
  return (
    <div className="orderly-flex orderly-items-center orderly-justify-between orderly-mt-1">
      <div className="orderly-text-4xs orderly-flex orderly-items-center orderly-space-x-1 orderly-text-base-contrast-36">
        <span>{`Unsettled:`}</span>
        <Numeral coloring precision={6}>
          {props.unsettledPnL}
        </Numeral>
        <span>USDC</span>
      </div>
      <Button
        className="orderly-text-primary-light orderly-text-4xs"
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
