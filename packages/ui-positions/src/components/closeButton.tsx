import { Button, Popover } from "@orderly.network/ui";

export const CloseButton = () => {
  // console.log("CloseButton");
  return (
    <Popover
      content={<div className="oui-text-sm oui-text-base-contrast-54"></div>}
    >
      <Button variant="outlined" size="sm" color="secondary">
        Close
      </Button>
    </Popover>
  );
};
