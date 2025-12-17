import { FC } from "react";
import {
  Box,
  CheckIcon,
  CircleOutlinedIcon,
  cn,
  Divider,
  Spinner,
  Text,
} from "@veltodefi/ui";

type StepItemProps = {
  active?: boolean;
  isLoading?: boolean;
  isCompleted?: boolean;
  title: string;
  description: string;
  showDivider?: boolean;
};

export const StepItem = (props: StepItemProps) => {
  const { title, description, showDivider, isCompleted } = props;
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
      <div
        className={`oui-left-${isCompleted ? "1" : "0"} oui-absolute oui-top-1 oui-z-10`}
      >
        <Identifier {...props} />
      </div>
      {showDivider && (
        <Box position={"absolute"} left={12} top={23} bottom={-21} zIndex={0}>
          <Divider
            lineStyle={"dashed"}
            direction={"vertical"}
            intensity={16}
            className="oui-h-full"
          />
        </Box>
      )}
    </Box>
  );
};

const Identifier = (props: {
  active?: boolean;
  isLoading?: boolean;
  isCompleted?: boolean;
}) => {
  const { active, isLoading, isCompleted } = props;

  if (isLoading) {
    return <Spinner size={"sm"} className={"oui-ml-1"} />;
  }

  if (isCompleted) {
    return (
      <span
        style={{
          position: "relative",
          display: "inline-block",
          width: 18,
          height: 18,
          verticalAlign: "middle",
        }}
        className="oui-flex oui-items-center oui-align-middle"
      >
        <CircleOutlinedIcon
          className="oui-text-primary"
          style={{ width: 18, height: 18, display: "block" }}
        />
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 18,
            width: 18,
            pointerEvents: "none",
          }}
        >
          <CheckIcon
            className="oui-text-primary"
            style={{ width: 12, height: 12, display: "block" }}
          />
        </span>
      </span>
    );
  }

  return <Dot active={!!active} />;

  // return (
  //   <Match
  //     className={"oui-absolute oui-left-0 oui-top-1 oui-z-10"}
  //     value={() => {
  //       if (isCompleted) {
  //         return "completed";
  //       }
  //       if (isLoading) {
  //         return "loading";
  //       }

  //       if (active) {
  //         return "active";
  //       }

  //       return "normal";
  //     }}
  //     case={{
  //       loading: (
  //         <div>
  //           <Spinner size={"sm"} className={"oui-ml-1"} />
  //         </div>
  //       ),
  //       completed: (
  //         <div>
  //           <CheckedCircleFillIcon opacity={1} className="oui-text-primary" />
  //         </div>
  //       ),
  //     }}
  //     default={<Dot active={!!active} />}
  //   />
  // );
};

const Dot: FC<{ active: boolean; className?: string }> = ({
  active,
  className,
}) => {
  return (
    <div
      className={cn(
        "oui-ml-2 oui-mt-1 oui-size-[12px] oui-rounded-full",
        className,
        active ? "oui-bg-primary-light" : "oui-bg-base-2",
      )}
    />
  );
};
