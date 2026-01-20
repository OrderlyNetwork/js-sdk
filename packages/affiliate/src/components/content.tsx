import { cn } from "@orderly.network/ui";

type ContentProps = {
  children: React.ReactNode;
  className?: string;
};
export const Content = ({ children, className }: ContentProps) => {
  return (
    <div
      className={cn(
        "oui-w-full oui-px-5 md:oui-mx-auto md:oui-max-w-[1040px]",
        className,
      )}
    >
      {children}
    </div>
  );
};
