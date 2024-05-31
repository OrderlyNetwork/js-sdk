import { FC } from "react";
import { Flex } from "../../flex";
import { Text } from "../../typography";
import { Numeral } from "../../typography/numeral";
import { EyeCloseIcon, EyeIcon } from "../../icon";

type TotalValueProps = {
  totalValue?: number;
  visible?: boolean;
  onToggleVisibility?: () => void;
};

const TotalValue: FC<TotalValueProps> = (props) => {
  const { totalValue = 0, visible = true, onToggleVisibility } = props;
  return (
    <Flex
      direction={"column"}
      gap={0}
      className="oui-text-2xs"
      itemAlign={"end"}
    >
      <Flex gap={1} itemAlign={"center"}>
        <Text neutral={54} className="oui-whitespace-nowrap">
          Total Value
        </Text>
        <button onClick={() => onToggleVisibility?.()}>
          {visible ? (
            <EyeIcon size={12} className="oui-text-primary-light" opacity={1} />
          ) : (
            <EyeCloseIcon
              size={12}
              className="oui-text-primary-light"
              opacity={1}
            />
          )}
        </button>

        <Text neutral={54}>≈</Text>
      </Flex>
      <Numeral unit="USDC" unitClassName="oui-text-base-contrast-20" as="div">
        {totalValue}
      </Numeral>
    </Flex>
  );
};

export { TotalValue };
export type { TotalValueProps };
