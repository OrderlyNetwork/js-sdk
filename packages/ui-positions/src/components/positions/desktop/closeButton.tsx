import { FC, useMemo, useState } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useOrderEntryFormErrorMsg } from "@orderly.network/react-app";
import { OrderEntity, OrderSide, OrderType } from "@orderly.network/types";
import {
  Button,
  toast,
  Text,
  CloseIcon,
  Flex,
  Divider,
  Badge,
  SimpleDialog,
  ThrottledButton,
  Box,
} from "@orderly.network/ui";
import { commify, commifyOptional, Decimal } from "@orderly.network/utils";
import { useSymbolContext } from "../../../providers/symbolProvider";
import { usePositionsRowContext } from "./positionRowContext";

export const CloseButton = () => {
  const [open, setOpen] = useState(false);
  const {
    onSubmit,
    price,
    quantity,
    closeOrderData,
    type,
    submitting,
    quoteDp,
    errors,
  } = usePositionsRowContext();
  const { base, quote } = useSymbolContext();
  const [orderConfirm] = useLocalStorage("orderly_order_confirm", true);

  const { t } = useTranslation();
  const { parseErrorMsg } = useOrderEntryFormErrorMsg(errors);

  const onConfirm = () => {
    return onSubmit()
      .then(
        (res) => {
          setOpen(false);
        },
        (error: any) => {
          if (typeof error === "string") {
            toast.error(error);
          } else {
            toast.error(error.message);
          }
        },
      )
      .catch((error) => {
        if (typeof error === "string") {
          toast.error(error);
        } else {
          toast.error(error.message);
        }
      });
  };

  const onClose = () => {
    setOpen(false);
  };

  const disabled = useMemo(() => {
    if (type === OrderType.MARKET) {
      if (!quantity) {
        return true;
      }
      return false;
    }

    return !price || !quantity;
  }, [price, quantity, type]);

  return (
    <>
      <Button
        variant="outlined"
        size="sm"
        color="secondary"
        disabled={disabled || submitting}
        loading={submitting}
        onClick={(e) => {
          e.stopPropagation();
          const quantityMsg = parseErrorMsg("order_quantity");
          const priceMsg = parseErrorMsg("order_price");
          const msg = quantityMsg || priceMsg;
          if (msg) {
            toast.error(msg);
            return;
          }
          if (!orderConfirm) {
            onSubmit();
            return;
          }
          setOpen(true);
        }}
      >
        {t("positions.column.close")}
      </Button>
      <SimpleDialog open={open} onOpenChange={setOpen} size="sm">
        {type === OrderType.MARKET ? (
          <MarketCloseConfirm
            base={base}
            quantity={quantity}
            onClose={onClose}
            onConfirm={onConfirm}
            submitting={submitting}
            classNames={{
              root: "oui-items-start",
            }}
            hideCloseIcon
          />
        ) : (
          <LimitConfirmDialog
            base={base}
            quantity={quantity}
            price={price}
            onClose={onClose}
            onConfirm={onConfirm}
            submitting={submitting}
            quoteDp={quoteDp}
            order={closeOrderData}
            hideCloseIcon
          />
        )}
      </SimpleDialog>
    </>
  );
};

export const ConfirmHeader: FC<{
  onClose?: () => void;
  title: string;
  hideCloseIcon?: boolean;
}> = (props) => {
  const { hideCloseIcon = false } = props;
  return (
    <div className="oui-pb-3 oui-border-b oui-border-line-4 oui-relative oui-w-full">
      <Text size={"base"}>{props.title}</Text>
      {!hideCloseIcon && (
        <button
          onClick={props.onClose}
          className="oui-absolute oui-right-0 oui-top-0 oui-text-base-contrast-54 hover:oui-text-base-contrast-80 oui-p-2"
        >
          <CloseIcon size={18} color="white" />
        </button>
      )}
    </div>
  );
};

export const ConfirmFooter: FC<{
  onConfirm?: () => Promise<any>;
  onCancel?: () => void;
  submitting?: boolean;
}> = ({ onCancel, onConfirm, submitting }) => {
  const { t } = useTranslation();

  return (
    <Flex
      id="oui-positions-confirm-footer"
      gap={2}
      width={"100%"}
      className="oui-mt-3 oui-pb-1"
    >
      <Button
        id="oui-positions-confirm-footer-cancel-button"
        color={"secondary"}
        fullWidth
        onClick={onCancel}
        size="md"
      >
        {t("common.cancel")}
      </Button>
      <ThrottledButton
        id="oui-positions-confirm-footer-confirm-button"
        onClick={onConfirm}
        fullWidth
        loading={submitting}
        size="md"
      >
        {t("common.confirm")}
      </ThrottledButton>
    </Flex>
  );
};

export const OrderDetail = (props: {
  quantity: any;
  price: any;
  side: OrderSide;
  quoteDp: number;
  className?: string;
}) => {
  const { quantity, price, quoteDp, side } = props;
  const { t } = useTranslation();

  const total = useMemo(() => {
    if (price && quantity) {
      return new Decimal(price)
        .mul(quantity)
        .toFixed(quoteDp, Decimal.ROUND_DOWN);
    }
    return "--";
  }, [price, quantity]);

  return (
    <Flex
      direction={"column"}
      gap={1}
      width={"100%"}
      className="oui-text-sm oui-text-base-contrast-54"
      py={5}
    >
      <Flex justify={"between"} width={"100%"} gap={1}>
        <Text>{t("common.qty")}</Text>
        <Text color={side === OrderSide.BUY ? "success" : "danger"}>
          {quantity}
        </Text>
      </Flex>
      <Flex justify={"between"} width={"100%"} gap={1}>
        <Text>{t("common.price")}</Text>
        <Text.formatted
          intensity={98}
          suffix={<Text intensity={54}>USDC</Text>}
        >
          {price}
        </Text.formatted>
      </Flex>
      <Flex justify={"between"} width={"100%"} gap={1}>
        <Text>{t("common.notional")}</Text>
        <Text.formatted
          intensity={98}
          suffix={<Text intensity={54}>USDC</Text>}
        >
          {total}
        </Text.formatted>
      </Flex>
    </Flex>
  );
};

export const MarketCloseConfirm: FC<{
  base?: string;
  quantity?: string;
  onClose?: () => void;
  close?: () => void;
  onConfirm?: () => Promise<any>;
  submitting?: boolean;
  hideCloseIcon?: boolean;
  classNames?: {
    root?: string;
  };
}> = (props) => {
  const { t } = useTranslation();

  const onCancel = () => {
    const func = props?.onClose ?? props.close;
    func?.();
  };
  return (
    <Flex direction={"column"} className={props.classNames?.root}>
      <ConfirmHeader
        onClose={onCancel}
        title={t("positions.marketClose")}
        hideCloseIcon={props.hideCloseIcon}
      />
      <Text intensity={54} size="sm" className="oui-my-5">
        {t("positions.marketClose.description", {
          quantity: commifyOptional(props.quantity),
          base: props.base,
        })}
      </Text>
      <ConfirmFooter
        onCancel={onCancel}
        onConfirm={async () => {
          await props.onConfirm?.();
          onCancel();
        }}
        submitting={props.submitting}
      />
    </Flex>
  );
};

export const LimitConfirmDialog: FC<{
  base: string;
  quantity: string;
  price: string;
  onClose?: () => void;
  onConfirm: () => Promise<any>;
  order: OrderEntity;
  submitting: boolean;
  quoteDp?: number;
  hideCloseIcon?: boolean;
}> = (props) => {
  const { order, quoteDp, quantity, price, submitting } = props;
  const { side } = order;
  const { t } = useTranslation();

  const onCancel = () => {
    props.onClose?.();
  };

  return (
    <>
      <ConfirmHeader
        onClose={onCancel}
        title={t("positions.limitClose")}
        hideCloseIcon={props.hideCloseIcon}
      />
      <Box mt={5}>
        <Text intensity={54} size="sm">
          {t("positions.limitClose.description", {
            quantity: commify(props.quantity),
            base: props.base,
          })}
        </Text>
      </Box>

      <Flex gap={2} mb={4} mt={5} justify={"between"}>
        <Text.formatted
          rule="symbol"
          formatString="base-type"
          size="base"
          showIcon
        >
          {order.symbol}
        </Text.formatted>
        <Flex gap={1}>
          <Badge color="neutral" size="xs">
            {t("orderEntry.orderType.limit")}
          </Badge>
          <Badge
            color={side === OrderSide.BUY ? "success" : "danger"}
            size="xs"
          >
            {side === OrderSide.BUY ? t("common.buy") : t("common.sell")}
          </Badge>
        </Flex>
      </Flex>

      <Divider className="oui-w-full" />

      <OrderDetail
        className="oui-text-sm"
        price={price}
        quantity={quantity}
        side={order.side}
        quoteDp={quoteDp ?? 2}
      />
      <ConfirmFooter
        onCancel={onCancel}
        onConfirm={props.onConfirm}
        submitting={props.submitting}
      />
    </>
  );
};
