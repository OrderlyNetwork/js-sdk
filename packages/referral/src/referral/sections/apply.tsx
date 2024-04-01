import { ApplyIcon } from "../icons/apply";
import { ListTile } from "./listTile";

export const Apply = () => {
  return (
    <ListTile
      icon={<ApplyIcon />}
      title="Apply"
      subtitle="Fill out the application form"
    />
  );
};
