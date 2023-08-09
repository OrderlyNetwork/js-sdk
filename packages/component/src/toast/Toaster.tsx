import {
  ToastBar,
  toast,
  Toaster as PrimitiveToaster,
  ToastOptions,
} from "react-hot-toast";
import { FC } from "react";

interface ToastProps extends ToastOptions {}
export const Toaster: FC<ToastProps> = (props) => {
  return (
    <PrimitiveToaster
      toastOptions={{
        duration: 10000,
      }}
      {...props}
    >
      {(t) => (
        <ToastBar
          toast={t}
          // style={{
          //   alignItems: "start",
          // }}
        >
          {({ icon, message }) => (
            <>
              {icon}
              {message}
              {t.type !== "loading" && (
                <button onClick={() => toast.dismiss(t.id)}>X</button>
              )}
            </>
          )}
        </ToastBar>
      )}
    </PrimitiveToaster>
  );
};
