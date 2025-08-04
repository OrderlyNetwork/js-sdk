import { FC } from "react";
import { cn } from "@orderly.network/ui";

type DescriptionItem = {
  content: string;
  children?: DescriptionItem[];
};

export const DescriptionContent: FC<{
  description: DescriptionItem[];
}> = ({ description }) => {
  const renderContent = (contents: DescriptionItem[]) => {
    return (
      <ul className="oui-list-inside oui-list-disc">
        {contents.map((content) => (
          <li key={content.content}>
            {content.content}
            {content?.children?.length && (
              <div className="oui-ml-4">{renderContent(content.children)}</div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div
      className={cn(
        "oui-text-sm oui-font-semibold oui-leading-[28px] oui-text-base-contrast-54",
      )}
    >
      {renderContent(description)}
    </div>
  );
};
