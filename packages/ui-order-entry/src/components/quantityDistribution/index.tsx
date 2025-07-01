import { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { DistributionType } from "@orderly.network/types";
import { Checkbox, cn, Flex } from "@orderly.network/ui";

type QuantityDistributionProps = {
  value?: DistributionType;
  onValueChange: (value: DistributionType) => void;
  className?: string;
};

export const QuantityDistribution = (props: QuantityDistributionProps) => {
  const { value, onValueChange } = props;
  const { t } = useTranslation();

  const onChange = (value: DistributionType) => (checked: boolean) => {
    onValueChange(value);
  };

  const distributionTypeMap = useMemo(() => {
    return {
      [DistributionType.FLAT]: t("orderEntry.distributionType.flat"),
      [DistributionType.ASCENDING]: t("orderEntry.distributionType.ascending"),
      [DistributionType.DESCENDING]: t(
        "orderEntry.distributionType.descending",
      ),
      [DistributionType.CUSTOM]: t("orderEntry.distributionType.custom"),
    };
  }, [t]);

  return (
    <Flex gapX={2} className={props.className} wrap="wrap">
      {Object.values(DistributionType).map((type) => {
        return (
          <Flex itemAlign={"center"} key={type}>
            <Checkbox
              id={`distribution-type-${type}`}
              color={"white"}
              variant={"radio"}
              checked={value === type}
              onCheckedChange={onChange(type)}
            />
            <label
              htmlFor={`distribution-type-${type}`}
              className={cn(
                "oui-text-2xs",
                "oui-ml-1",
                "oui-whitespace-nowrap oui-break-normal",
              )}
            >
              {distributionTypeMap[type]}
            </label>
          </Flex>
        );
      })}
    </Flex>
  );
};
