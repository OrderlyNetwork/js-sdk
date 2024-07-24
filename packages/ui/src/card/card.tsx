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
  classes?: {
    root?: string;
    header?: string;
    content?: string;
    footer?: string;
  };
  // color?: number;
} & BaseCardProps;

const Card = forwardRef<React.ElementRef<"div">, PropsWithChildren<CardProps>>(
  (props, ref) => {
    const { title, children, footer, classes, ...rest } = props;
    return (
      <CardBase {...rest} className={classes?.root} ref={ref}>
        <CardHeader className={classes?.header}>
          {typeof props.title === "string" ? (
            <CardTitle>{title}</CardTitle>
          ) : (
            title
          )}
        </CardHeader>
        <CardContent className={classes?.content}>{children}</CardContent>
        {footer && (
          <CardFooter className={classes?.footer}>{footer}</CardFooter>
        )}
      </CardBase>
    );
  }
);

Card.displayName = "Card";

export { Card };
