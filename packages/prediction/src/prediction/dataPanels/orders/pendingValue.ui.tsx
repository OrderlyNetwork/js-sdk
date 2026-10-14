import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";
import { Trans, useTranslation } from "@orderly.network/i18n";
import {
  Button,
  cn,
  PopoverAnchor,
  PopoverContent,
  PopoverRoot,
  Slider,
  Text,
  toast,
} from "@orderly.network/ui";
import {
  EditableCellInput,
  OrderEditConfirmation,
} from "@orderly.network/ui-orders";
import { commify, Decimal } from "@orderly.network/utils";
import { binaryOrderDisplayPrice } from "../../binary/binaryOrderDisplay";
import { validatePendingOrderDraft } from "../../binary/binaryOrderRules";
import { TableNumber } from "../../cells";
import type {
  PredictionAccountActions,
  PredictionOpenOrder,
} from "../../prediction.types";

export const PendingValue = ({
  state,
  order,
  field,
}: {
  state: PredictionAccountActions & { isRegionRestricted: boolean };
  order: PredictionOpenOrder;
  field: "price" | "quantity";
}) => {
  const { t, i18n } = useTranslation();
  const displayValue =
    field === "price"
      ? binaryOrderDisplayPrice(order, order.price)
      : order.quantity;
  const disabled =
    !state.isOrderTradable(order.symbol) || state.isRegionRestricted;
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(displayValue));
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLButtonElement>(null);
  const quantityControlsRef = useRef<HTMLDivElement>(null);
  const restorePreviewFocusRef = useRef(false);
  // Drafts are validated against the same envelope the submission path
  // enforces, so over-limit or off-tick values error inline and never
  // reach the confirmation popover.
  const editLimits =
    editing && !disabled
      ? state.getOrderEditQuantityLimits?.(order.id)
      : undefined;
  const quantityLimits = field === "quantity" && !open ? editLimits : undefined;
  const showQuantityControls = quantityLimits != null;
  // A live order update or permission change invalidates the current draft.
  const editorKey = `${order.id}:${field}:${displayValue}:${disabled}`;
  const [previousKey, setPreviousKey] = useState(editorKey);
  if (previousKey !== editorKey) {
    setPreviousKey(editorKey);
    setValue(String(displayValue));
    setEditing(false);
    setOpen(false);
  }

  const cancelEditing = useCallback(() => {
    if (submittingRef.current) return;
    setOpen(false);
    setEditing(false);
    setValue(String(displayValue));
  }, [displayValue]);

  useLayoutEffect(() => {
    if (!editing && restorePreviewFocusRef.current) {
      restorePreviewFocusRef.current = false;
      previewRef.current?.focus();
    }
  }, [editing]);

  useEffect(() => {
    if (!editing || open || typeof document === "undefined") return;
    const onMouseDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !quantityControlsRef.current?.contains(event.target as Node)
      ) {
        cancelEditing();
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [editing, open, cancelEditing]);

  const numericValue = Number(value);
  const draftRejection = validatePendingOrderDraft({
    order,
    field,
    value: numericValue,
    limits: editLimits,
  });
  const error = !draftRejection
    ? undefined
    : draftRejection.key === "prediction.editOrder.error.quantityMax"
      ? t("prediction.editOrder.error.quantityMax", {
          maxQuantity: commify(draftRejection.maxQuantity),
        })
      : draftRejection.key === "prediction.editOrder.error.tick"
        ? t("prediction.editOrder.error.tick", {
            tick: draftRejection.tick,
          })
        : t("prediction.invalidOrder");
  const requestConfirmation = (event: SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (disabled || submittingRef.current || draftRejection) return;
    if (new Decimal(value).eq(displayValue)) {
      restorePreviewFocusRef.current = true;
      cancelEditing();
      return;
    }
    setOpen(true);
  };

  const rawQuantityPercent =
    quantityLimits &&
    quantityLimits.maxQuantity > 0 &&
    Number.isFinite(numericValue)
      ? new Decimal(numericValue).div(quantityLimits.maxQuantity).mul(100)
      : new Decimal(0);
  const quantityPercent = rawQuantityPercent.lt(0)
    ? 0
    : rawQuantityPercent.gt(100)
      ? 100
      : rawQuantityPercent.toNumber();
  const setQuantityPercent = (percent: number) => {
    if (!quantityLimits || submittingRef.current) return;
    setValue(
      new Decimal(quantityLimits.maxQuantity)
        .mul(percent)
        .div(100)
        .div(quantityLimits.quantityTick)
        .toDecimalPlaces(0, Decimal.ROUND_DOWN)
        .mul(quantityLimits.quantityTick)
        .toString(),
    );
  };
  const focusInlineInput = () =>
    containerRef.current?.querySelector("input")?.focus();

  const confirmEdit = async () => {
    if (disabled || submittingRef.current || draftRejection) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const updated = await state.editPendingOrder(
        order.id,
        field === "price"
          ? binaryOrderDisplayPrice(order, numericValue)
          : order.price,
        field === "quantity" ? numericValue : order.quantity,
      );
      if (updated) {
        setOpen(false);
        setEditing(false);
      } else {
        // Keep the draft inline so a rejected edit can be corrected.
        setOpen(false);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("prediction.invalidOrder"),
      );
      setOpen(false);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <PopoverRoot
      open={open || showQuantityControls}
      onOpenChange={(next) => {
        if (!next) cancelEditing();
      }}
    >
      <PopoverAnchor asChild>
        <div ref={containerRef} onClick={(event) => event.stopPropagation()}>
          {editing && !disabled ? (
            <EditableCellInput
              value={value}
              onChange={(next) => {
                if (!submittingRef.current) setValue(next);
              }}
              onClick={requestConfirmation}
              error={error}
              handleKeyDown={(event) => {
                if (event.key === "Enter") requestConfirmation(event);
                if (event.key === "Escape") {
                  event.stopPropagation();
                  event.preventDefault();
                  if (!submittingRef.current)
                    restorePreviewFocusRef.current = true;
                  cancelEditing();
                }
              }}
            />
          ) : (
            <div
              className={cn(
                "oui-flex oui-max-w-[110px] oui-items-center oui-gap-1 oui-font-semibold",
                field === "quantity" &&
                  (order.side === "buy"
                    ? "oui-text-trade-profit"
                    : "oui-text-trade-loss"),
                disabled && "oui-text-base-contrast-20",
              )}
            >
              {field === "quantity" && (
                <>
                  <TableNumber value={order.filledQuantity} /> /{" "}
                </>
              )}
              <button
                ref={previewRef}
                type="button"
                disabled={disabled}
                className={cn(
                  "oui-text-2xs oui-flex oui-h-[28px] oui-min-w-[70px] oui-items-center oui-rounded",
                  !disabled &&
                    "oui-cursor-pointer oui-border oui-border-line-12 oui-bg-base-7 oui-px-2",
                  disabled && "oui-cursor-not-allowed",
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  if (disabled) return;
                  setValue(String(displayValue));
                  setEditing(true);
                }}
              >
                <TableNumber value={displayValue} />
              </button>
            </div>
          )}
        </div>
      </PopoverAnchor>
      {showQuantityControls && (
        <PopoverContent
          key="quantity"
          data-testid="prediction-order-quantity-controls"
          className="oui-w-[360px] oui-rounded-xl"
          align="start"
          side="bottom"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            if (containerRef.current?.contains(event.target as Node))
              event.preventDefault();
          }}
          onEscapeKeyDown={() => {
            restorePreviewFocusRef.current = true;
          }}
        >
          <div
            ref={quantityControlsRef}
            className="oui-flex oui-items-start oui-gap-2 oui-p-1"
          >
            <Text.numeral
              size="xs"
              intensity={98}
              className="oui-min-w-[30px]"
              dp={2}
              padding={false}
              unit="%"
              rm={Decimal.ROUND_DOWN}
            >
              {quantityPercent}
            </Text.numeral>
            <div className="oui-mt-[6px] oui-flex oui-w-full oui-flex-col oui-gap-2">
              <Slider
                markCount={4}
                value={[quantityPercent]}
                disabled={quantityLimits.maxQuantity <= 0}
                onValueChange={([percent]) => setQuantityPercent(percent)}
                onValueCommit={focusInlineInput}
              />
              <div className="oui-flex oui-gap-2">
                {[0, 25, 50, 75, 100].map((percent) => (
                  <Button
                    key={percent}
                    type="button"
                    variant="outlined"
                    color="secondary"
                    size="xs"
                    className="oui-w-1/5"
                    disabled={quantityLimits.maxQuantity <= 0}
                    onClick={() => {
                      setQuantityPercent(percent);
                      focusInlineInput();
                    }}
                  >
                    {percent === 100 ? t("common.max") : `${percent}%`}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      )}
      {open && (
        <PopoverContent
          key="confirmation"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            // A rejection returns to the inline input; otherwise focus its trigger.
            (
              containerRef.current?.querySelector("input") ?? previewRef.current
            )?.focus();
          }}
          onInteractOutside={(event) => {
            if (submittingRef.current) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (submittingRef.current) event.preventDefault();
            else restorePreviewFocusRef.current = true;
          }}
        >
          <OrderEditConfirmation
            cancelPopover={cancelEditing}
            isSubmitting={submitting}
            onConfirm={confirmEdit}
          >
            <Trans
              i18n={i18n}
              t={t}
              i18nKey={
                field === "price"
                  ? "prediction.editOrder.confirm.price"
                  : "prediction.editOrder.confirm.quantity"
              }
              values={{ value: commify(value) }}
              components={[
                <span key="0" className="oui-text-warning-darken" />,
              ]}
            />
          </OrderEditConfirmation>
        </PopoverContent>
      )}
    </PopoverRoot>
  );
};
