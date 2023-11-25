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
    <>
      <NavBar></NavBar>
      <DemoContextProvider>
        <div className="bg-base-500 min-h-screen py-7">
          <div className="container mx-auto">
            <Components />
          </div>
        </div>
      </DemoContextProvider>
    </>
  );
}
