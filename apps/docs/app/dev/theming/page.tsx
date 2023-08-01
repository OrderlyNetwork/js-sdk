import { CreateThemeGuide } from "@/components/theming/builder/createGuide";
import { ThemeList } from "@/components/theming/themeList";

export default function Page() {
  return (
    <>
      <ThemeList />
      <CreateThemeGuide />
    </>
  );
}
