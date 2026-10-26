import { BaseLayout } from "../../../components/layout/baseLayout";
import { AnnouncementWidget } from "./announcement.widget";

export default function AnnouncementPage() {
  return (
    <BaseLayout
      classNames={{
        root: "lg:oui-overflow-y-scroll",
        bottomNav: "oui-hidden",
      }}
    >
      <AnnouncementWidget />
    </BaseLayout>
  );
}
