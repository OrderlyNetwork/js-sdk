import Button from "@/button";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/sheet";
import { AssetAndMarginSheet } from "./sections/assetAndMargin";
import { AccountInfo } from "./sections/accountInfo";

export const AccountStatus = () => {
  return (
    <div className="flex items-center justify-between">
      <Sheet>
        <SheetTrigger asChild>
          <div className="flex items-center" onClick={() => {}}>
            <div className="flex flex-col">
              <div className="text-xs">Total Value</div>
              <div>166,983.23</div>
            </div>
            <div className="px-3" />
            {/* <Divider/> */}
            <div>
              <div className="border border-solid rounded px-3 border-primary text-primary text-sm">
                1x
              </div>
            </div>
          </div>
        </SheetTrigger>
        <SheetContent>
          <AssetAndMarginSheet />
        </SheetContent>
      </Sheet>

      <div>
        <Sheet>
          <SheetTrigger asChild>
            <Button size={"small"}>0xF9E...c32</Button>
          </SheetTrigger>
          <SheetContent>
            <AccountInfo />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
