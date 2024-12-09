import { Divider } from "@orderly.network/ui";
import { MainNavItem, NavItem } from "./mainMenus/navItem";
import { cn } from "@orderly.network/ui";

export type CampaignProps = {
  item: MainNavItem;
  className?: string;
  onItemClick?: (item: MainNavItem[]) => void;
  current?: string[];
  // classNames?: MainNavClassNames;
};

export const CampaignButton = (props: CampaignProps) => {
  return (
    <>
      <NavItem
        item={props.item}
        onClick={props.onItemClick}
        classNames={{
          navItem: cn("oui-gradient-primary oui-text-white", props.className),
        }}
      />
      <Divider direction="vertical" className="oui-h-8" intensity={8} />
    </>
  );
};
