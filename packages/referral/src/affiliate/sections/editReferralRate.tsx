import {
  create,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Input,
  toast,
  useModal,
} from "@orderly.network/react";
import { useEffect, useRef, useState } from "react";
import { cleanStringStyle, useMutation } from "@orderly.network/hooks";
import { ReferralCodeType } from "./referralCode";
import { Decimal } from "@orderly.network/utils";

export const EditReferralRate = create<{
  code: ReferralCodeType;
  mutate: any;
}>((props) => {
  const { code, mutate } = props;
  const { visible, hide, resolve, reject, onOpenChange } = useModal();
  const maxRate = new Decimal(code.max_rebate_rate).mul(100);
  const [refereeRebateRate, setRefereeRebateRate] = useState(
    `${new Decimal(code.referee_rebate_rate).mul(100)}`
  );
  const [referrerRebateRate, setReferrerRebateRate] = useState(
    `${new Decimal(code.referrer_rebate_rate).mul(100)}`
  );
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef?.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length
      );
    }
  }, [inputRef]);

  useEffect(() => {
    setRefereeRebateRate(`${new Decimal(code.referee_rebate_rate).mul(100)}`);
    setReferrerRebateRate(`${new Decimal(code.referrer_rebate_rate).mul(100)}`);
  }, [code]);

  const [editRate, { error, isMutating }] = useMutation(
    "/v1/referral/edit_split",
    "POST"
  );

  const onClickConfirm = async () => {
    try {
      const r1 = Number.parseFloat(refereeRebateRate);
      const r2 = Number.parseFloat(referrerRebateRate);

      await editRate({
        referral_code: code.code,
        referee_rebate_rate: r1 / 100,
        referrer_rebate_rate: r2 / 100,
      });
      toast.success("Referral code edited");
      mutate();
      hide();
    } catch (e) {
      // @ts-ignore
      toast.error(e?.message || e || "");
    }
  };

  return (
    <Dialog open={visible} onOpenChange={onOpenChange}>
      <DialogContent
        className="orderly-px-6 orderly-max-w-[320px] orderly-bg-base-800 orderly-shadow-[0px_12px_20px_0px_rgba(0,0,0,0.25)]"
        maxWidth={"lg"}
        closable
      >
        <DialogTitle className="orderly-text-[20px]">
          <div className="orderly-mb-3">Settings</div>
          <Divider />
        </DialogTitle>

        <div className="orderly-mt-3 orderly-h-full orderly-flex orderly-flex-col orderly-justify-end">
          <div className="orderly-text-xs orderly-text-base-contrast-54">
            Set the ratio of referral rate shared with your referees
          </div>
          <div className="orderly-text-xs orderly-text-base-contrast-80 orderly-mt-2 orderly-flex">
            {`Your max commission rate: `}
            <div className="orderly-text-warning-darken orderly-pl-1">{`${new Decimal(
              code.max_rebate_rate
            )
              .mul(100)
              .toFixed(0, Decimal.ROUND_DOWN)}%`}</div>
          </div>

          <div className="orderly-text-2xs orderly-mt-6 orderly-text-base-contrast-80">
            You receive
          </div>
          <Input
            ref={inputRef}
            containerClassName="orderly-h-[40px] orderly-mt-3 orderly-bg-base-700 orderly-outline orderly-outline-1 orderly-outline-base-contrast-12 focus-within:orderly-outline-primary-darken"
            placeholder="Enter code"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={referrerRebateRate}
            onChange={(e) => {
              const text = cleanStringStyle(e.target.value);
              const rate = Number.parseFloat(text);
              setReferrerRebateRate(text);
              if (!Number.isNaN(rate)) {
                setRefereeRebateRate(
                  `${maxDecimal(new Decimal(0), maxRate.sub(rate))}`
                );
                setShowError(maxRate.sub(rate) < new Decimal(0));
              } else {
                setRefereeRebateRate("");
                setReferrerRebateRate("");
              }
            }}
            suffix={
              <div className="orderly-px-3 orderly-text-base-contrast-54 orderly-text-[16px]">
                %
              </div>
            }
          />

          <div className="orderly-text-2xs orderly-mt-6 orderly-text-base-contrast-80">
            Referee receives
          </div>
          <Input
            containerClassName="orderly-h-[40px] orderly-mt-3 orderly-bg-base-700 orderly-outline orderly-outline-1 orderly-outline-base-contrast-12 focus-within:orderly-outline-primary-darken"
            placeholder="Enter code"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            autoFocus={false}
            value={refereeRebateRate}
            onChange={(e) => {
              const text = cleanStringStyle(e.target.value);
              const rate = Number.parseFloat(text);
              setRefereeRebateRate(text);
              if (!Number.isNaN(rate)) {
                setReferrerRebateRate(
                  `${maxDecimal(new Decimal(0), maxRate.sub(rate))}`
                );
                setShowError(maxRate.sub(rate) < new Decimal(0));
              } else {
                setRefereeRebateRate("");
                setReferrerRebateRate("");
              }
            }}
            suffix={
              <div className="orderly-px-3 orderly-text-base-contrast-54 orderly-text-[16px]">
                %
              </div>
            }
          />

          {showError && (
            <div className="orderly-text-danger orderly-text-3xs orderly-mt-3 orderly-items-start orderly-relative">
              <div className="orderly-bg-danger orderly-rounded-full orderly-w-[4px] orderly-h-[4px] orderly-mr-1 orderly-mt-2 orderly-absolute orderly-top-0"></div>
              <div className="orderly-ml-2">{`The total commission rate must equal to your maximum commission rate limit`}</div>
            </div>
          )}

          <Button
            id="referral_bind_referral_code_btn"
            disabled={
              refereeRebateRate.length === 0 ||
              referrerRebateRate.length === 0 ||
              showError
            }
            loading={isMutating}
            className="orderly-mt-6 orderly-mb-4"
            onClick={(e) => {
              e.stopPropagation();
              onClickConfirm();
            }}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

function maxDecimal(a: Decimal, b: Decimal) {
  return a > b ? a : b;
}
