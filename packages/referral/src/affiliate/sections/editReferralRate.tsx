import {
    create,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Input,
    toast,
    useModal
} from "@orderly.network/react";
import { useState } from "react";
import { cleanStringStyle, useMutation } from "@orderly.network/hooks";
import { ReferralCodeType } from "./referralCode";
import { commify } from "@orderly.network/utils";

export const EditReferralRate = create<{
    code: ReferralCodeType,
    mutate: any,
}>((props) => {

    const { code, mutate } = props;
    const { visible, hide, resolve, reject, onOpenChange } = useModal();
    const maxRate = code.max_rebate_rate * 100;
    const [refereeRebateRate, setRefereeRebateRate] = useState(`${code.referee_rebate_rate * 100}`);
    const [referrerRebateRate, setReferrerRebateRate] = useState(`${code.referrer_rebate_rate * 100}`);
    const [showError, setShowError] = useState(false);


    const [
        editRate,
        { error, isMutating },
    ] = useMutation('/v1/referral/edit_split', 'POST');

    const onClickConfirm = async () => {
        try {
            const r1 = Number.parseFloat(refereeRebateRate);
            const r2 = Number.parseFloat(referrerRebateRate);

            await editRate({
                "referral_code": code.code,
                "referee_rebate_rate": r2 / 100,
                "referrer_rebate_rate": r1 / 100,
            });
            toast.success("Referral code edited ");
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

                className="orderly-p-5 orderly-max-w-[320px]"
                maxWidth={"lg"}
                closable
            >
                <DialogTitle className="orderly-text-[20px]">
                    <div className="orderly-mb-3">
                        Settings
                    </div>
                    <Divider />
                </DialogTitle>

                <div className="orderly-mt-3 orderly-h-full orderly-flex orderly-flex-col orderly-justify-end">

                    <div className="orderly-text-xs orderly-text-base-contrast-54">
                        Set the ratio of referral rate shared with your referees
                    </div>
                    <div className="orderly-text-xs orderly-text-base-contrast-80 orderly-mt-6 orderly-flex">
                        {`Your max commission rate: `}
                        <div className="orderly-text-warning orderly-pl-1">{`${code.max_rebate_rate * 100}%`}</div>
                    </div>

                    <div className="orderly-text-2xs orderly-mt-6">You receive</div>
                    <Input
                        containerClassName="orderly-h-[40px] orderly-mt-3 orderly-bg-base-900"
                        placeholder="Enter code"
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={commify(referrerRebateRate)}
                        onChange={(e) => {

                            const text = cleanStringStyle(e.target.value);
                            const rate = Number.parseFloat(text);
                            setReferrerRebateRate(text);
                            if (!Number.isNaN(rate)) {
                                setRefereeRebateRate(`${Math.max(0, maxRate - rate)}`);
                                setShowError(maxRate - rate < 0);
                            }
                        }}
                        suffix={(<div className="orderly-px-3 orderly-text-base-contrast-54 orderly-text-[16px]">%</div>)}
                    />


                    <div className="orderly-text-2xs orderly-mt-6">Referee receives</div>
                    <Input
                        containerClassName="orderly-h-[40px] orderly-mt-3 orderly-bg-base-900"
                        placeholder="Enter code"
                        type="text"
                        inputMode="decimal"
                        value={commify(refereeRebateRate)}
                        onChange={(e) => {
                            const text = cleanStringStyle(e.target.value);
                            const rate = Number.parseFloat(text);
                            setRefereeRebateRate(text);
                            if (!Number.isNaN(rate)) {
                                setReferrerRebateRate(`${Math.max(0, maxRate - rate)}`);
                                setShowError(maxRate - rate < 0);
                            }
                        }}
                        suffix={(<div className="orderly-px-3 orderly-text-base-contrast-54 orderly-text-[16px]">%</div>)}
                    />

                    {showError && (
                        <div className="orderly-text-danger orderly-text-3xs orderly-mt-6">The total commission rate cannot exceed your maximum commission rate limit </div>
                    )}

                    <Button
                        id="referral_bind_referral_code_btn"
                        disabled={refereeRebateRate.length === 0 || referrerRebateRate.length === 0 || showError }
                        loading={isMutating}
                        className="orderly-my-6"
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