import { useTranslation } from "@orderly.network/i18n";
import { TokenIcon } from "@orderly.network/ui";
import { SelectOption } from "@orderly.network/ui/src/select/withOptions";
import { useConvertScript } from "./convert.script";

type ConvertMobileUIProps = {
  convertState: ReturnType<typeof useConvertScript>;
  memoizedOptions: SelectOption[];
};

type ConvertMobileItemProps = {
  item?: any;
};

type ConvertMobileFieldProps = {
  label: string;
  value: string;
  className?: string;
};

export const ConvertMobileUI: React.FC<ConvertMobileUIProps> = (props) => {
  const { t } = useTranslation();

  return (
    <div className="oui-flex oui-flex-col oui-gap-1 oui-px-3">
      <div>filter</div>
      <div>
        <ConvertMobileItem item={9} />
      </div>
    </div>
  );
};

const ConvertMobileField: React.FC<ConvertMobileFieldProps> = ({
  label,
  value,
  className = "",
}) => {
  return (
    <div
      className={`oui-text-2xs oui-font-semibold oui-text-base-contrast-80 [&_p]:oui-text-base-contrast-36 ${className}`}
    >
      <p>{label}</p>
      <div>{value}</div>
    </div>
  );
};

const ConvertMobileItem: React.FC<ConvertMobileItemProps> = (props) => {
  const { item } = props;
  const { t } = useTranslation();

  if (!item) {
    return null;
  }

  return (
    <div className="oui-flex oui-flex-col oui-gap-2 oui-rounded-xl oui-bg-base-9 oui-p-2">
      <div className="oui-flex oui-justify-between">
        <div className="oui-flex oui-items-center">
          <div>
            <TokenIcon name={"USDC"} size="sm" />
          </div>
          <div>USDC</div>
          <div>Details</div>
        </div>
        <div>2022-08-30 17:19:47</div>
      </div>

      {/* 5 fields in grid container: 3 per row, wrap to next line */}
      <div className="oui-grid oui-grid-cols-3 oui-gap-2">
        <ConvertMobileField label="USDC amount" value="100 USDC" />
        <ConvertMobileField label={t("common.fee")} value="100 USDC" />
        <ConvertMobileField label="Type" value="Automatic" />
        <ConvertMobileField label="Status" value="Success" />
        <ConvertMobileField label="Convert ID" value="Success" />
      </div>
    </div>
  );
};
