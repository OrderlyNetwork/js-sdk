import { cn } from "@kodiak-finance/orderly-ui";
import { MainNavItem, NavItem } from "./mainMenus/navItem";

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
          navItem: cn("oui-text-base-contrast-54 -oui-ml-2", props.className),
        }}
      />
    </>
  );
};
