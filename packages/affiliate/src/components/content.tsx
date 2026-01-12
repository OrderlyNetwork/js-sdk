import { cn } from "@orderly.network/ui";

type ContentProps = {
  children: React.ReactNode;
  className?: string;
};
export const Content = ({ children, className }: ContentProps) => {
  return (
    <div className={cn("oui-w-full md:oui-max-w-[1000px]", className)}>
      {children}
    </div>
  );
};
