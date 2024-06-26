import { DropdownMenu } from "./menu";

type CheckBoxMenuProps = {
  items: string[];
  selectedItems: string[];
  onChange: (selectedItems: string[]) => void;
};

export const CheckBoxMenu = (props: CheckBoxMenuProps) => {
  return <DropdownMenu />;
};
