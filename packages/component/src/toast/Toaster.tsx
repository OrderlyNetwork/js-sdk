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
    // @ts-ignore
    <PrimitiveToaster
      toastOptions={{
        duration: 2500,
        success: {
          iconTheme: {
            primary: "rgba(0, 181, 159, 1)",
            secondary: "rgba(57, 52, 74, 1)",
          },
          style: {
            fontSize: "14px",
            color: "rgba(255, 255, 255, 0.98)",
          },
        },
        error: {
          iconTheme: {
            primary: "rgba(255, 103, 194, 1)",
            secondary: "rgba(57, 52, 74, 1)",
          },
          style: {
            fontSize: "14px",
            color: "rgba(255, 255, 255, 0.98)",
          },
        },
      }}
      {...props}
    >
      {(t) => (
        // @ts-ignore
        <ToastBar
          toast={t}
          style={{
            ...t.style,
            background: "rgba(57, 52, 74, 1)",
            color: "rgba(255, 255, 255, 0.98)",
            // alignItems: "start",
            borderRadius: "6px",
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
                  {/* @ts-ignore */}
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
