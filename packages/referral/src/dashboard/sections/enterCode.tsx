import { Button, Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle, Divider, Input, toast, useModal } from "@orderly.network/react";
import { create } from "@orderly.network/react";
import { useContext, useState } from "react";
import { CloseIcon } from "../icons/close";
import { useMutation } from "@orderly.network/hooks";
import { ReferralContext } from "../../hooks/referralContext";

export const InputCode = create<{
  mutate: any,
  bindReferralCodeState?: (success: boolean, error: any, hide: any) => void
}>((props) => {

  const { mutate } = props;
  const { visible, hide, resolve, reject, onOpenChange } = useModal();

  const [code, setCode] = useState("");

  const [
    bindCode,
    { error, isMutating },
  ] = useMutation('/v1/referral/bind', 'POST');


  const onClickConfirm = async () => {

    try {
      await bindCode({ "referral_code": code });
      toast.success("bind success");
      mutate();
      if (props.bindReferralCodeState) {
        props.bindReferralCodeState(true, null, hide);
      } else {
        hide();
      }
    } catch (e) {
      if (props.bindReferralCodeState) {
        props.bindReferralCodeState(false, e, hide);
      } else {
        toast.error(`${e}`);
      }
    }
  };

  return (
    <Dialog open={visible} onOpenChange={onOpenChange}>
      <DialogContent

        className="orderly-p-5 "
        maxWidth={"lg"}
        closable
      >
        <DialogTitle className="orderly-text-[20px]">
          <div className="orderly-mb-3">
            Bind a referral code
          </div>
          <Divider />
        </DialogTitle>

        <div className="orderly-mt-3 orderly-h-full orderly-flex orderly-flex-col orderly-justify-end">

          <div className="orderly-text-xs orderly-text-base-contrast-54">
            Bind a referral code to earn trading fee rebates.
          </div>
          <div className="orderly-text-xs orderly-text-base-contrast-54 orderly-mt-6">
            Enter referral code
          </div>

          <Input
            containerClassName="orderly-h-[40px] orderly-mt-3"
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            suffix={(<button className="orderly-mx-3" onClick={(e) => {
              e.stopPropagation();
              setCode("");
            }}><CloseIcon className="hover:orderly-fill-slate-300" /></button>)}
          />

          <Button
            id="referral_bind_referral_code_btn"
            disabled={code.length == 0}
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