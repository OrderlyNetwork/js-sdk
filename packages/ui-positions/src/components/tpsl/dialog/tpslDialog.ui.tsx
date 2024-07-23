import { modal, SimpleDialog } from "@orderly.network/ui";
import { TPSLWidget, TPSLWidgetProps } from "../tpsl.widget";
import { TPSLEditorBuilderState } from "./tpslDialog.script";
import { PositionTPSLConfirm } from "../tpsl.ui";

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
            console.log("onConfirm ********", needConfirm);

            if (!needConfirm) {
              return Promise.resolve(true);
            }

            return modal.confirm({
              content: (
                <PositionTPSLConfirm
                  symbol={"PERP_ETH_USDC"}
                  isPosition={false}
                  qty={0}
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
