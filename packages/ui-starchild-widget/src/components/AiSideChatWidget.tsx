import React from "react";

export type AiSideChatRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface AiSideChatWidgetProps {
  /** Rectangle in viewport coordinates from useAiBoxRect */
  rect: AiSideChatRect | null | undefined;
  /** Optional label text inside the widget */
  text?: string;
  /** CSS z-index for stacking context */
  zIndex?: number;
  /** Positioning strategy */
  position?: "fixed" | "absolute" | "sticky";
}

export const AiSideChatWidget: React.FC<AiSideChatWidgetProps> = ({
  rect,
  text = "AI Side Chat",
  zIndex = 20,
  position = "fixed",
}) => {
  if (!rect) return null;

  const positionStyle: React.CSSProperties = {
    position,
    top: rect.y,
    left: rect.x,
    width: rect.width,
    height: rect.height,
    zIndex,
  };

  return (
    <div
      style={positionStyle}
      className="oui-flex oui-flex-col oui-overflow-hidden oui-rounded-xl oui-bg-base-9 oui-opacity-80"
      role="complementary"
      aria-label="AI Side Chat Widget"
    >
      {/* Header */}
      <div className="oui-flex oui-items-center oui-gap-2 oui-px-4 oui-py-3 oui-bg-black/20 oui-border-b oui-border-white/10">
        <div className="oui-w-6 oui-h-6 oui-rounded-full oui-bg-gradient-to-br oui-from-blue-500 oui-to-purple-600 oui-flex oui-items-center oui-justify-center oui-text-xs">
          ✨
        </div>
        <div className="oui-flex-1 oui-text-sm oui-font-semibold oui-text-white">
          {text}
        </div>
        <div className="oui-w-2 oui-h-2 oui-rounded-full oui-bg-green-500 oui-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
      </div>

      {/* Messages Area */}
      <div className="oui-flex-1 oui-flex oui-flex-col oui-gap-3 oui-p-4 oui-overflow-y-auto">
        <div className="oui-px-3 oui-py-2 oui-rounded-lg oui-bg-blue-500/15 oui-border oui-border-blue-500/20 oui-text-slate-200 oui-text-xs oui-leading-relaxed">
          👋 Hi! I am here to help you with trading insights and analysis.
        </div>
      </div>

      {/* Input Area */}
      <div className="oui-flex oui-items-center oui-gap-2 oui-px-4 oui-py-3 oui-bg-black/20 oui-border-t oui-border-white/10">
        <input
          type="text"
          placeholder="Type your message..."
          className="oui-flex-1 oui-px-3 oui-py-2 oui-rounded-lg oui-bg-white/5 oui-border oui-border-white/10 oui-text-white oui-text-xs oui-outline-none oui-placeholder-white/40"
          disabled
        />
        <button
          className="oui-px-4 oui-py-2 oui-rounded-lg oui-bg-gradient-to-br oui-from-blue-500 oui-to-blue-600 oui-border-none oui-text-white oui-text-xs oui-font-medium oui-cursor-pointer oui-transition-opacity"
          disabled
        >
          Send
        </button>
      </div>
    </div>
  );
};
