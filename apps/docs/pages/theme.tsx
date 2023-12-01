// import { Components } from "@/components/theming/components";
import { DemoContextProvider } from "@/components/demoContext";
import { NavBar } from "@/components/layout/navbar";
import { ThemeEditor } from "@/components/theming/editor";
import dynamic from "next/dynamic";

const Components = dynamic(() => import("@/components/theming/components"), {
  ssr: false,
});

export default function Page() {
  return (
    <DemoContextProvider>
      <div className="bg-base-600 min-h-screen components-page">
        <NavBar></NavBar>
        <div className="py-7">
          <div className="container mx-auto">
            <Components />
          </div>
        </div>
      </div>
    </DemoContextProvider>
  );
}
