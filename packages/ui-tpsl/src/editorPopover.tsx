import { ReactNode } from "react";
import { ComputedAlgoOrder, useLocalStorage } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { AlgoOrderRootType, API, PositionType } from "@orderly.network/types";
import { Box, Button, modal, toast } from "@orderly.network/ui";
import { ButtonProps } from "@orderly.network/ui";
import { TPSLDialogId } from "./tpsl.widget";

export const PositionTPSLPopover = (props: {
  position: API.Position;
  order?: API.AlgoOrder;
  label?: string;
  baseDP?: number;
  quoteDP?: number;
  /**
   * Button props
   */
  buttonProps?: ButtonProps;
  isEditing?: boolean;
  children?: ReactNode;
}) => {
  const { position, order, baseDP, quoteDP, buttonProps, isEditing } = props;

  const [needConfirm] = useLocalStorage("orderly_order_confirm", true);

  const { t } = useTranslation();

  const isPositionTPSL = isEditing
    ? order?.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
    : undefined;

  const onEdit = () => {
    modal.show(TPSLDialogId, {
      order: order,
      symbol: position.symbol,
      baseDP: baseDP,
      quoteDP: quoteDP,
      positionType: isPositionTPSL ? PositionType.FULL : PositionType.PARTIAL,
      isEditing: isEditing,
    });
  };

  return (
    <Box onClick={onEdit} className="oui-cursor-pointer">
      {props.children || (
        <Button
          variant="outlined"
          size="sm"
          color="secondary"
          {...buttonProps}
          // onClick={() => {
          //   setOpen(true);
          // }}
        >
          {props.label}
        </Button>
      )}
    </Box>
  );
};
