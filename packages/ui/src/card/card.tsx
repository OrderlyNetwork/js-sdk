import { PropsWithChildren, ReactElement, forwardRef } from "react";
import {
  CardBase,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./cardBase";
import type { ComponentPropsWithout } from "../helpers/component-props";

type CardProps = {
  title?: string | ReactElement;
  footer?: ReactElement;
  footerClassName?: string;
  // color?: number;
} & ComponentPropsWithout<"div", "title" | "color">;

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
