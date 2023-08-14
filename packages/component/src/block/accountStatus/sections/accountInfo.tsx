import { Avatar } from "@/avatar";
import Button, { IconButton } from "@/button";
import { Share, Copy } from "lucide-react";

export const AccountInfo = () => {
  return (
    <div>
      <div className="flex py-5">
        <div className="flex-1 flex ">
          <Avatar />
          <div className="flex flex-col">
            <div>0x78E5...c86f</div>
            <div className="text-xs">Arbitrum</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconButton>
            <Copy size={20} stroke="currentcolor" />
          </IconButton>
          <IconButton>
            <Share size={20} />
          </IconButton>
        </div>
      </div>
      <Button variant={"outlined"} color={"sell"} fullWidth>
        Disconnect
      </Button>
    </div>
  );
};
