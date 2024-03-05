import { FC } from "react";
interface NoticeProps {
  warningMessage?: string;
}

export const Notice: FC<NoticeProps> = (props) => {
  const { warningMessage } = props;

  if (warningMessage) {
    return (
      <div className="orderly-text-center orderly-text-warning orderly-text-3xs desktop:orderly-text-2xs">
        {warningMessage}
      </div>
    );
  }

  return <div></div>;
};
