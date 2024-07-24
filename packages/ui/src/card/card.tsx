import {
  PropsWithChildren,
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
  title?: ReactNode;
  footer?: ReactNode;
  // footerClassName?: string;
  classNames?: {
    root?: string;
    header?: string;
    content?: string;
    footer?: string;
  };
  // color?: number;
} & BaseCardProps;

const Card = forwardRef<React.ElementRef<"div">, PropsWithChildren<CardProps>>(
  (props, ref) => {
    const { title, children, footer, classNames, ...rest } = props;
    return (
      <CardBase {...rest} className={classNames?.root} ref={ref}>
        <CardHeader className={classNames?.header}>
          {typeof props.title === "string" ? (
            <CardTitle>{title}</CardTitle>
          ) : (
            title
          )}
        </CardHeader>
        <CardContent className={classNames?.content}>{children}</CardContent>
        {footer && (
          <CardFooter className={classNames?.footer}>{footer}</CardFooter>
        )}
      </CardBase>
    );
  }
);

Card.displayName = "Card";

export { Card };
