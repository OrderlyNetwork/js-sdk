import { Button } from "..";

export const BottomSheetFooter = () => {
  return (
    <div className="flex gap-2">
      <Button fullWidth>Cancel</Button>
      <Button fullWidth>Confirm</Button>
    </div>
  );
};
