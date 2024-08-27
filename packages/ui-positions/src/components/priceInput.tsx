import {
  CaretDownIcon,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  Input,
} from "@orderly.network/ui";

export const PriceInput = () => {
  return (
    <DropdownMenuRoot>
      <Input
        size="sm"
        value={"Market"}
        suffix={
          <DropdownMenuTrigger asChild>
            <button className="oui-px-1 oui-h-full">
              <CaretDownIcon size={12} color="white" />
            </button>
          </DropdownMenuTrigger>
        }
      />
      <DropdownMenuContent
        align="end"
        className="oui-w-[96px] oui-min-w-[96px]"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            size="xs"
            onSelect={(vent) => {
              console.log(vent);
            }}
          >
            <span>Market</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};
