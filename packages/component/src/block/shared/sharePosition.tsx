import { useModal } from "@/modal";
import { create } from "@/modal/modalHelper";
import { Sheet, SheetContent, SheetHeader } from "@/sheet/sheet";
import { Dialog, DialogContent } from "@/dialog/dialog";
import {
  useAccountInfo,
  useLeverage,
  useMediaQuery,
  useQuery,
  useReferralInfo,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { MEDIA_TABLET } from "@orderly.network/types";
import {
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DesktopSharePnLContent } from "./desktopSharePnl";
import { MobileSharePnLContent } from "./mobileSharePnl";
import { OrderlyAppContext } from "@/provider";

export const SharePoisitionView = create<{
  position: any;
}>((props) => {
  const isTablet = useMediaQuery(MEDIA_TABLET);
  const { position } = props;
  // const [leverage] = useLeverage();
  const symbolInfo = useSymbolsInfo();
  const { data: info } = useAccountInfo();

  const maxAccountLeverage = info?.max_leverage;

  const res = useQuery<any>(`/v1/public/info/${position.symbol}`, {
    focusThrottleInterval: 1000 * 60 * 60 * 24,
    dedupingInterval: 1000 * 60 * 60 * 24,
    revalidateOnFocus: false,
  });

  const maxSymbolLeverage = useMemo(() => {
    const base = res?.data?.base_imr;
    if (base) return 1 / base;
  }, [res]);

  const maxLeverage = useMemo(() => {
    if (!maxAccountLeverage || !maxSymbolLeverage) {
      return "-";
    }

    return Math.min(maxAccountLeverage, maxSymbolLeverage);
  }, [maxAccountLeverage, maxSymbolLeverage]);

  const { getFirstRefCode } = useReferralInfo();

  if (symbolInfo.isNil) return null;

  const base_dp = symbolInfo[position.symbol]("base_dp");
  const quote_dp = symbolInfo[position.symbol]("quote_dp");
  const { referral } = useContext(OrderlyAppContext);

  const refLink = useMemo(() => {
    function generateNewUrl(url: string, refCode: string): string {
      let newUrl: string;
      if (url.includes("?")) {
        newUrl = `${url}&ref=${refCode}`;
      } else {
        newUrl = `${url}?ref=${refCode}`;
      }
      return newUrl;
    }

    const code = getFirstRefCode()?.code;
    const link = referral?.refLink;

    if (typeof code !== "undefined" && typeof link !== "undefined") {
      return generateNewUrl(link, code);
    }

    return undefined;
  }, [getFirstRefCode, referral]);

  return isTablet ? (
    <MobileSharePnL
      position={position}
      leverage={maxLeverage}
      baseDp={base_dp}
      quoteDp={quote_dp}
      refLink={refLink}
    />
  ) : (
    <DesktopSharePnL
      position={position}
      leverage={maxLeverage}
      baseDp={base_dp}
      quoteDp={quote_dp}
      refLink={refLink}
    />
  );
});

const MobileSharePnL: FC<
  PropsWithChildren<{
    className?: string;
    position: any;
    leverage: number | string;
    baseDp?: number;
    quoteDp?: number;
    refLink?: string;
  }>
> = (props) => {
  const { leverage, position, baseDp, quoteDp, refLink } = props;
  const { visible, hide, resolve, reject, onOpenChange } = useModal();

  return (
    <Sheet open={visible} onOpenChange={onOpenChange}>
      <SheetContent
        id="orderly-referral-mweb-bg"
        className="orderly-px-4"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader
          id="orderly-asset-and-margin-sheet-title"
          // leading={<Logo.secondary size={30} />}
        >
          PnL Sharing
        </SheetHeader>
        <MobileSharePnLContent
          position={position}
          leverage={leverage}
          hide={hide}
          baseDp={baseDp}
          quoteDp={quoteDp}
          refLink={refLink}
        />
      </SheetContent>
    </Sheet>
  );
};

const DesktopSharePnL: FC<
  PropsWithChildren<{
    className?: string;
    position: any;
    leverage: number | string;
    baseDp?: number;
    quoteDp?: number;
    refLink?: string;
  }>
> = (props) => {
  const { leverage, position, baseDp, quoteDp, refLink } = props;
  const { visible, hide, resolve, reject, onOpenChange } = useModal();

  const [viewportHeight, setViewportHeight] = useState(
    window.innerHeight < 900 ? 660 : 807
  );

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight < 900 ? 660 : 807);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Dialog open={visible} onOpenChange={onOpenChange}>
      <DialogContent
        className="orderly-shadow-lg orderly-w-[640px] orderly-bg-base-800 desktop:orderly-max-w-[640px] orderly-py-0"
        style={{ height: `${viewportHeight}px` }}
        autoFocus={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div
          id="orderly-referral-desktop-bg"
          style={{ height: `${viewportHeight}px` }}
        >
          <DesktopSharePnLContent
            position={position}
            leverage={leverage}
            hide={hide}
            baseDp={baseDp}
            quoteDp={quoteDp}
            refLink={refLink}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
