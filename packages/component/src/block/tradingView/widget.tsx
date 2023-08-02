import React, { createRef, useEffect, forwardRef } from "react";

interface WidgetProps {
  scriptHTML: any;
  scriptSRC: string;
  containerId?: string;
  type?: "Widget" | "MediumWidget";
}

declare const TradingView: any;

export const Widget = forwardRef<any, WidgetProps>(
  ({ scriptHTML, scriptSRC, containerId, type }, ref) => {
    const containerRef: { current: HTMLDivElement | null } = createRef();

    useEffect(() => {
      let refValue: any;

      if (containerRef.current) {
        const script = document.createElement("script");
        script.setAttribute("data-nscript", "afterInteractive");
        script.src = scriptSRC;
        script.async = true;
        script.type = "text/javascript";

        if (type === "Widget" || type === "MediumWidget") {
          script.onload = () => {
            if (typeof TradingView !== undefined) {
              script.innerHTML = JSON.stringify(
                type === "Widget"
                  ? (ref = new TradingView.widget(scriptHTML))
                  : type === "MediumWidget"
                  ? (ref = new TradingView.MediumWidget(scriptHTML))
                  : undefined
              );
            }
          };
        } else {
          script.innerHTML = JSON.stringify(scriptHTML);
        }
        containerRef.current.appendChild(script);
        refValue = containerRef.current;
      }
      return () => {
        if (refValue) {
          while (refValue.firstChild) {
            refValue.removeChild(refValue.firstChild);
          }
        }
      };
    }, [containerRef, scriptHTML, type, scriptSRC]);

    return (
      <div className="w-full h-full" ref={containerRef} id={containerId} />
    );
  }
);
