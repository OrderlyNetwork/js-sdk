import { useScreen } from "@orderly.network/ui";
import { SelectOption } from "@orderly.network/ui/src/select/withOptions";
import { useConvertScript } from "./convert.script";
import { ConvertDesktopUI } from "./convert.ui.desktop";
import { ConvertMobileUI } from "./convert.ui.mobile";

export const ConvertHistoryWidget = ({
  memoizedOptions,
}: {
  memoizedOptions: SelectOption[];
}) => {
  const convertState = useConvertScript();
  const { isMobile } = useScreen();

  if (isMobile) {
    return (
      <ConvertMobileUI
        convertState={convertState}
        memoizedOptions={memoizedOptions}
      />
    );
  }

  return (
    <ConvertDesktopUI
      convertState={convertState}
      memoizedOptions={memoizedOptions}
    />
  );
};
