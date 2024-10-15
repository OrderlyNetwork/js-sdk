import { modal, SimpleDialog } from "@orderly.network/ui";
import { TPSLWidget, TPSLWidgetProps } from "../tpsl.widget";
import { TPSLEditorBuilderState } from "./tpslDialog.script";
import { PositionTPSLConfirm } from "../tpsl.ui";
import { OrderSide } from "@orderly.network/types";

type Props = {
  // onConfirm: () => Promise<boolean>;
} & TPSLWidgetProps &
  TPSLEditorBuilderState;

export const TPSLDialog = (props: Props) => {
  const { open, needConfirm, ...rest } = props;
  // const
  return (
    <>
      <SimpleDialog open={open}>
        <TPSLWidget
          {...rest}
          onConfirm={() => {
            console.log("onConfirm ********", props);

            if (!needConfirm) {
              return Promise.resolve(true);
            }

            return modal.confirm({
              content: (
                <PositionTPSLConfirm
                  symbol={rest.order?.symbol!}
                  qty={rest.order?.quantity as number}
                  maxQty={0}
                  side={rest.order?.side as OrderSide}
                  dp={2}
                />
              ),
            });
          }}
        />
      </SimpleDialog>
      {/* <SimpleDialog>
        <PositionTPSLConfirm
          symbol={"PERP_ETH_USDC"}
          isPosition={false}
          qty={0}
        />
      </SimpleDialog> */}
    </>
  );
};
