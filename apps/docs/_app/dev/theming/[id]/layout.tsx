import { BuilderNavBar } from "@/components/theming/builder/navBar";
import { ThemeProvider } from "@/components/theming/themeContext";
import { appRouter } from "@/server/routers/_app";
// @ts-ignore
import { use } from "react";
import { ThemePreview } from "@/components/theming/preview/preview";
import "react-color-palette/lib/css/styles.css";

const getThemeById = async (id: string) => {
  const caller = appRouter.createCaller({});

  return await caller.theme.byId({
    id,
  });
};

export default function BuilderLayout({
  children, // will be a page or nested layout
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const theme = use(getThemeById(params.id));

  // console.log("theme =====>>>>", theme);

  if (!theme) {
    throw new Error("theme not found");
  }

  return (
    <ThemeProvider theme={theme}>
      <BuilderNavBar />
      <div className={"flex"}>
        {children}
        <div className={"flex-1"}>
          <ThemePreview />
        </div>
      </div>
    </ThemeProvider>
  );
}
