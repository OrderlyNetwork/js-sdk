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
import { CloseIcon } from "../icons/close";
import { useMutation } from "@orderly.network/hooks";

export const ReferralInputCode = create<{
  mutate: any,
  bindReferralCodeState?: (success: boolean, error: any, hide: any, queryParams: any) => void
}>((props) => {

  const { mutate } = props;
  const { visible, hide, resolve, reject, onOpenChange } = useModal();

  const [code, setCode] = useState("");

  const [errorInfo, setErrorInfo] = useState("");

  const [
    bindCode,
    { error, isMutating },
  ] = useMutation('/v1/referral/bind', 'POST');


  const onClickConfirm = async () => {

    try {
      await bindCode({ "referral_code": code });
      toast.success("Referral code bound");
      mutate();
      if (props.bindReferralCodeState) {
        props.bindReferralCodeState(true, null, hide, {tab: 1});
      } else {
        hide();
      }
    } catch (e: any) {
      let errorText = `${e}`;
      if ("message" in (e)) {
        errorText = e.message;
      }

      if ("referral code not exist" === errorText) {
        errorText = "This referral code does not exist";
      }
      
      if (props.bindReferralCodeState) {
        toast.error(errorText);
        props.bindReferralCodeState(false, e, hide, {});
      } else {
        toast.error(errorText);
      }
    }
  };

  const checkInput = (code: string) => {
    const regex = /^[A-Z0-9]+$/;
    
    if (regex.test(code) && code.length >= 4 && code.length <= 10) {
      setErrorInfo("");
    } else {
      // setErrorInfo("This referral code does not exist.");
    }
  };

  return (
    <Dialog open={visible} onOpenChange={onOpenChange}>
      <DialogContent

        className="orderly-p-6 orderly-bg-base-800"
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
          <div className="orderly-text-xs orderly-text-base-contrast-80 orderly-mt-6">
            Enter referral code
          </div>

          <Input
            containerClassName="orderly-h-[40px] orderly-mt-3 orderly-bg-base-700 orderly-outline orderly-outline-1 orderly-outline-base-contrast-12 focus-within:orderly-outline-primary-darken"
            placeholder="Enter code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              checkInput(e.target.value);
            }}
            suffix={(<button className="orderly-mx-3" onClick={(e) => {
              e.stopPropagation();
              setCode("");
            }}><CloseIcon className="hover:orderly-fill-slate-300" /></button>)}
          />

          {/* {errorInfo.length > 0 && (<div className="orderly-flex orderly-text-danger orderly-text-3xs orderly-mt-3 orderly-items-center">
            <div className="orderly-inline-block orderly-bg-danger orderly-rounded-full orderly-w-[4px] orderly-h-[4px] orderly-mr-1"></div>
            {errorInfo}
          </div>)} */}

          <Button
            id="referral_bind_referral_code_btn"
            disabled={code.length == 0 || errorInfo.length > 0}
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