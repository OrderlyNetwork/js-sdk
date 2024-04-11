
import { EarnIcon } from "../icons/earn";
import { ListTile } from "./listTile";

export const Earn = () => {
  return (
    <ListTile
      icon={<EarnIcon className="lg:orderly-w-[80px] lg:orderly-h-[80px] orderly-fill-primary"/>}
      title="Earn"
      subtitle="Get paid and receive special treatment 24/7, 365"
    />
  );
};
