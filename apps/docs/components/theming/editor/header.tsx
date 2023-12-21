import { useState } from "react";
import { SimpleDialog, toast, Dialog } from "@orderly.network/react";
import { CSSCodeHighline } from "@/components/cssHighline";
import { Code, Copy, ListRestart } from "lucide-react";
import { useDemoContext } from "@/components/demoContext";

export const EditorHeader = () => {
  const [open, setOpen] = useState(false);
  const { resetTheme } = useDemoContext();

  const [code, setCode] = useState("");

  const getThemeCode = () => {
    const rootEl = document.getElementById("theme-root-el");
    if (!rootEl) return "";

    const style = rootEl.style;

    setCode(
      `:root {\r\n${style.cssText
        .replaceAll("; ", ";\r\n")
        .replaceAll("--", "    --")
        .trimEnd()}\r\n}`
    );
  };

  return (
    <>
      <div className="p-3 flex text-base-contrast">
        <div className="flex gap-2 flex-1">
          <span>🎨</span>
          <span>Theme builder</span>
        </div>
        <div className="text-base-contrast-54 flex items-center gap-3">
          <button
            className="rounded hover:bg-white/10 active:bg-base-300 p-1"
            onClick={() => {
              resetTheme();
            }}
          >
            <ListRestart size={20} />
          </button>
          <button
            className="rounded hover:bg-white/10 active:bg-base-300 p-1"
            onClick={() => {
              getThemeCode();
              setOpen(true);
            }}
          >
            <Code size={20} />
          </button>
        </div>
      </div>
      <SimpleDialog
        open={open}
        title={"Theme"}
        onOpenChange={(open) => {
          setOpen(open);
        }}
        closable
      >
        <div className="p-5 text-sm">
          <div className="text-sm mb-3 text-base-contrast-54">
            Copy and paste the following code into your CSS file.
          </div>
          <div className="relative">
            <div className="overflow-auto h-[400px] border border-base-300 rounded shadow-2xl shadow-base-900 shadow-inner">
              <CSSCodeHighline code={code} className="p-3" />
              <button
                className="absolute top-3 right-3 p-2 rounded z-10 bg-white/5 hover:bg-white/10 active:bg-primary/20"
                onClick={(event) => {
                  event.preventDefault();
                  navigator.clipboard.writeText(code);
                  toast.success("Copied to clipboard");
                }}
              >
                <Copy size={18} />
              </button>
            </div>
          </div>
        </div>
      </SimpleDialog>
    </>
  );
};
