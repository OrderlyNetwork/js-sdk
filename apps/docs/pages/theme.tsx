// import { Components } from "@/components/theming/components";
import { DemoContextProvider } from "@/components/demoContext";
import { NavBar } from "@/components/layout/navbar";
import { ThemeEditor } from "@/components/theming/editor";
import dynamic from "next/dynamic";
import { Toolbar } from "@/components/theming/toolbar";
import { useMemo } from "react";
import { ThemePreview } from "@/components/theming/preview/preview";

const Components = dynamic(() => import("@/components/theming/components"), {
  ssr: false,
});

export default function Page() {
  // const previewElement= useMemo(() => {
  return (
    <DemoContextProvider>
      <div className="bg-neutral-950 min-h-screen components-page">
        <NavBar />

        <Toolbar />
        <div className="mr-[420px] ml-3">
          <ThemePreview />
        </div>

        <div className="fixed right-5 top-[110px]">
          <ThemeEditor />
        </div>
      </div>
    </DemoContextProvider>
  );
}
