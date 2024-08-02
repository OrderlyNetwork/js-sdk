import Button from "@/button";
import { modal } from "@orderly.network/ui";
import { AssetsContext } from "@/provider/assetsProvider";
import { Numeral } from "@/text";
import { RotateCw } from "lucide-react";
import { FC, useCallback, useContext } from "react";
import { SettlePnlContent } from "../settlePnlContent";

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
        content: <SettlePnlContent />,
        // maxWidth: "xs",
        onCancel() {
          return Promise.reject("cancel");
        },
        onOk() {
          return onSettle().catch((e) => {});
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
        id="orderly-deposit-content-settle-button"
        className="orderly-text-primary-light orderly-text-4xs desktop:orderly-text-3xs"
        size="small"
        variant={"text"}
        // @ts-ignore
        leftIcon={<RotateCw size={15} />}
        onClick={onSettleClick}
      >
        Settle
      </Button>
    </div>
  );
};
