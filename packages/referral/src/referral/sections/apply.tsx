import { ApplyIcon } from "../icons/apply";
import { ListTile } from "./listTile";

export const Apply = () => {
  return (
    <ListTile
      icon={<ApplyIcon className="lg:orderly-w-[80px] lg:orderly-h-[80px] orderly-fill-primary"/>}
      title="Apply"
      subtitle="Fill out the application form"
    />
  );
};
