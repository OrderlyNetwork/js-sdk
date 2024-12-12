import { FC } from "react";
import {
  Box,
  CheckedCircleFillIcon,
  cn,
  Match,
  Spinner,
  Text,
} from "@orderly.network/ui";

type StepItemProps = {
  active?: boolean;
  isLoading?: boolean;
  isCompleted?: boolean;
  title: string;
  description: string;
};

export const StepItem = (props: StepItemProps) => {
  const { title, description } = props;

  // console.log(props);

  return (
    <Box position="relative" className="oui-pl-8">
      <Box>
        <Text as="div" intensity={98} size={"sm"}>
          {title}
        </Text>
        <Text as="div" intensity={54} size={"2xs"}>
          {description}
        </Text>
      </Box>
      <Identifier {...props} />
    </Box>
  );
};

const Identifier = (props: {
  active?: boolean;
  isLoading?: boolean;
  isCompleted?: boolean;
}) => {
  const { active, isLoading, isCompleted } = props;

  return (
    <Match
      className={"oui-absolute oui-left-0 oui-top-1 oui-z-10"}
      value={() => {
        if (isCompleted) {
          return "completed";
        }
        if (isLoading) {
          return "loading";
        }

        if (active) {
          return "active";
        }

        return "normal";
      }}
      case={{
        loading: (
          <div>
            <Spinner size={"sm"} className={"oui-ml-1"} />
          </div>
        ),
        completed: (
          <div>
            <CheckedCircleFillIcon opacity={1} className="oui-text-primary" />
          </div>
        ),
      }}
      default={<Dot active={!!active} />}
    />
  );
};

const Dot: FC<{ active: boolean; className?: string }> = ({
  active,
  className,
}) => {
  return (
    <div
      className={cn(
        "oui-w-[8.3px] oui-h-[8.3px] oui-rounded-full oui-ml-2 oui-mt-1",
        className,
        active ? "oui-bg-primary-light" : "oui-bg-base-2"
      )}
    />
  );
};
