import { Checkbox } from "@/checkbox";
import { CircleCloseIcon } from "@/icon";
import { Input } from "@/input";
import { toast } from "@/toast";
import { FC, useRef, useState } from "react";

export const Message: FC<{
    message: string;
    setMessage: any;
    check: boolean;
    setCheck: any;
  }> = (props) => {
    const { message, setMessage, check, setCheck } = props;
    const [focus, setFocus] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    return (
      <div className="orderly-mt-4 orderly-mb-7 orderly-flex orderly-items-center">
        <Checkbox
          checked={check}
          onCheckedChange={(e: boolean) => {
            setCheck(e);
          }}
        />
        <div
          className="orderly-text-xs orderly-text-base-contrast-54 orderly-ml-2 hover:orderly-cursor-pointer"
          onClick={() => {
            setCheck(!props.check);
          }}
        >
          Your message
        </div>
        <div className="orderly-bg-base-900 orderly-mx-2 orderly-rounded-sm">
          <Input
            ref={inputRef}
            placeholder="Max 25 characters"
            containerClassName="orderly-bg-transparent orderly-h-[32px] orderly-w-[295px]"
            value={message}
            autoFocus={false}
            suffix={
              focus && (
                <button
                  className="orderly-mr-3 orderly-cursor-pointer"
                  onMouseDown={(e) => {
                    console.log("set message to empty");
  
                    setMessage("");
                    setTimeout(() => {
                      inputRef.current?.focus();
                    }, 50);
                    e.stopPropagation();
                  }}
                >
                  <CircleCloseIcon size={18} />
                </button>
              )
            }
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            onChange={(e) => {
              if (e.target.value.length > 25) {
                toast.error("Maximum support of 25 characters");
                return;
              }
              setCheck(e.target.value.length > 0);
              setMessage(e.target.value);
            }}
          />
        </div>
      </div>
    );
  };
  