import {
  ToastBar,
  toast,
  Toaster as PrimitiveToaster,
  ToastOptions,
} from "react-hot-toast";
import React, { FC } from "react";
import { X } from "lucide-react";

interface ToastProps extends ToastOptions {}

export const Toaster: FC<ToastProps> = (props) => {
  return (
    <PrimitiveToaster
      toastOptions={{
        duration: 2500,
        success: {
          iconTheme: {
            primary: "rgba(39, 222, 200, 1)",
            secondary: "rgba(0, 0, 0, 1)",
          },
        },
        error: {
          iconTheme: {
            primary: "rgba(255, 68, 124, 1)",

            secondary: "rgba(0, 0, 0, 1)",
          },
        },
      }}
      {...props}
    >
      {(t) => (
        <ToastBar
          toast={t}
          style={{
            ...t.style,
            background: "rgba(51, 57, 72, 1)",
            color: "rgba(255, 255, 255, 1)",
            // alignItems: "start",
            borderRadius: "4px",
            // animation: t.visible
            //   ? "animate-in fade-in"
            //   : "animate-out fade-out",
          }}
        >
          {({ icon, message }) => (
            <>
              {icon}
              {message}
              {t.type !== "loading" && (
                <button onClick={() => toast.dismiss(t.id)}>
                  <X size={18} color="rgba(255, 255, 255, 0.2)" />
                </button>
              )}
            </>
          )}
        </ToastBar>
      )}
    </PrimitiveToaster>
  );
};
