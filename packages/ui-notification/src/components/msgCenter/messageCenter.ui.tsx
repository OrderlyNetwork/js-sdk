import { FC, useState } from "react";
import { type API } from "@orderly.network/types";
import {
  ExtensionPositionEnum,
  ExtensionSlot,
  ScrollArea,
  Text,
} from "@orderly.network/ui";
import { MsgItem } from "./msgItem";

const MessageContent: FC<{
  dataSource: API.AnnouncementRow[];
  current: string | number | null;
  onExpandToggle: (id: string | number | null) => void;
  onItemClick: (url: string) => void;
}> = (props) => {
  const { dataSource, current, onExpandToggle, onItemClick } = props;

  if (!Array.isArray(dataSource) || dataSource.length === 0) {
    return (
      <div className="oui-flex oui-h-[160px] oui-items-center oui-justify-center">
        <ExtensionSlot position={ExtensionPositionEnum.EmptyDataIdentifier} />
      </div>
    );
  }

  return (
    <div className="p-5 oui-flex oui-flex-col oui-space-y-1">
      {dataSource.map((item) => (
        <MsgItem
          url={item.url}
          onItemClick={onItemClick}
          key={item.announcement_id}
          message={item.message}
          updatedTime={item.updated_time ?? 0}
          expanded={current === item.announcement_id}
          type={item.type}
          onExpandToggle={() => {
            if (current === item.announcement_id) {
              onExpandToggle(null);
            } else {
              onExpandToggle(item.announcement_id);
            }
          }}
        />
      ))}
    </div>
  );
};

export const MessageCenterUI: FC<{
  dataSource: API.AnnouncementRow[];
  onItemClick: (url: string) => void;
}> = (props) => {
  const [expanded, setExpanded] = useState<string | number | null>(null);

  return (
    <>
      <div className="oui-px-5 oui-pt-4">
        <Text intensity={80} weight="bold">
          Announcement
        </Text>
      </div>

      <ScrollArea className="oui-flex oui-h-[300px] oui-flex-col oui-space-y-1 oui-p-3">
        <MessageContent
          dataSource={props.dataSource}
          current={expanded}
          onExpandToggle={setExpanded}
          onItemClick={props.onItemClick}
        />
      </ScrollArea>
    </>
  );
};
