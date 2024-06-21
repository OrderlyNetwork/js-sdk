import {
  PropsWithChildren,
  ReactElement,
  forwardRef,
  ElementType,
  ReactNode,
} from "react";
import {
  BaseCardProps,
  CardBase,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./cardBase";

type CardProps = {
  title?: ReactElement | string;
  footer?: ReactElement;
  footerClassName?: string;
  // color?: number;
} & BaseCardProps;

const Card = forwardRef<React.ElementRef<"div">, PropsWithChildren<CardProps>>(
  (props, ref) => {
    const { title, children, footer, footerClassName, ...rest } = props;
    return (
      <CardBase {...rest} ref={ref}>
        <CardHeader>
          {typeof props.title === "string" ? (
            <CardTitle>{title}</CardTitle>
          ) : (
            title
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
        {footer && (
          <CardFooter className={footerClassName}>{footer}</CardFooter>
        )}
      </CardBase>
    );
  }
);

Card.displayName = "Card";

export { Card };
