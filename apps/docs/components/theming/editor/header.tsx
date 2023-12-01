import { useState } from "react";
import { SimpleDialog } from "@orderly.network/react";
import { CSSCodeHighline } from "@/components/cssHighline";

// import { getHighlighter } from "shiki";

export const EditorHeader = () => {
  const [open, setOpen] = useState(false);

  const [code, setCode] = useState("");

  const getThemeCode = () => {
    const rootEl = document.getElementById("theme-root-el");
    if (!rootEl) return "";

    const style = rootEl.style;

    // style
    console.log("style", style.cssText);
    // getHighlighter({
    //   theme: "nord",
    //   langs: ["css"],
    // }).then((highlighter) => {
    //   const code = highlighter.codeToHtml(style.cssText, { lang: "css" });
    //   setCode(code);
    // });

    setCode(style.cssText.replaceAll(";", ";\r\n").trimEnd());
  };

  return (
    <>
      <div className="p-3 flex text-base-contrast">
        <div className="flex gap-2 flex-1">
          <span>🎨</span>
          <span>Theme builder</span>
        </div>
        <div className="text-base-contrast-54">
          <button
            onClick={() => {
              getThemeCode();
              setOpen(true);
            }}
          >
            code
          </button>
        </div>
      </div>
      <SimpleDialog
        open={open}
        title={"Code"}
        onOpenChange={(open) => {
          useState(open);
        }}
      >
        <div className="p-5 text-sm">
          <div>Copy and paste the following code into your CSS file.</div>
          <CSSCodeHighline code={code} />
        </div>
      </SimpleDialog>
    </>
  );
};
