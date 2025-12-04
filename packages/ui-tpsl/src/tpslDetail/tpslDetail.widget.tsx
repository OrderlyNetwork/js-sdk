import { AlgoOrder, API } from "@veltodefi/types";
import { registerSimpleDialog, registerSimpleSheet } from "@veltodefi/ui";
import { useTPSLDetail } from "./tpslDetail.script";
import { TPSLDetailProvider } from "./tpslDetailProvider";
import { TPSLDetailUI } from "./tsplDetail.ui";

export type TPSLDetailProps = {
  position: API.Position;
  order: AlgoOrder;
  baseDP: number;
  quoteDP: number;
};

export const TPSLDetailWidget = (props: TPSLDetailProps) => {
  const state = useTPSLDetail(props);
  return (
    <TPSLDetailProvider
      symbol={props.position.symbol}
      position={props.position}
    >
      <TPSLDetailUI {...state} />
    </TPSLDetailProvider>
  );
};
export const TPSLDetailDialogId = "TPSLDetailDialogId ";
export const TPSLDetailSheetId = "TPSLDetailSheetId";
registerSimpleDialog(TPSLDetailDialogId, TPSLDetailWidget, {
  classNames: {
    content: "oui-w-[420px] lg:oui-pt-4 lg:oui-pb-2 !oui-px-0",
    body: "lg:oui-py-0",
  },
});

registerSimpleSheet(TPSLDetailSheetId, TPSLDetailWidget, {
  classNames: {
    content: "!oui-p-0",
  },
});
