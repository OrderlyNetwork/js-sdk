import { ArrowDownUpIcon, CaretDownIcon, Input } from "@orderly.network/ui";

export const PriceInput = () => {
  return (
    <Input
      size="sm"
      value={"Market"}
      suffix={
        <button className="oui-px-1">
          <CaretDownIcon size={12} color="white" />
        </button>
      }
    />
  );
};
