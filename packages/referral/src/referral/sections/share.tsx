import { ShareIcon } from "../icons/share";
import { ListTile } from "./listTile";

export const Share = () => {
  return (
    <ListTile
      icon={<ShareIcon className="lg:orderly-w-[80px] lg:orderly-h-[80px] orderly-fill-primary"/>}
      title="Share"
      subtitle="Unlock your affiliate link and share it with your community"
    />
  );
};
