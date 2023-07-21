import {
  FC,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TabIndicator } from "./indicator";
import { Tab } from "./tab";

export type TabItem = {
  title: string;
  value?: string;
  disabled?: boolean;
};

interface TabListProps {
  tabs: TabItem[];
  value?: string;
  //   activeIndex: number;
  onTabChange?: (value: string) => void;
  tabBarExtra?: ReactNode;
}

export const TabList: FC<TabListProps> = (props) => {
  const [left, setLeft] = useState(0);

  const boxRef = useRef<HTMLDivElement>(null);

  const calcLeft = useCallback((target: HTMLButtonElement) => {
    const { left, width } = target.getBoundingClientRect();
    const parentLeft = boxRef.current?.getBoundingClientRect().left || 0;

    setLeft(left - parentLeft + (width - 30) / 2);
  }, []);

  useEffect(() => {
    let activeTab = boxRef.current?.querySelector(".actived");
    if (!activeTab) {
      activeTab = boxRef.current?.childNodes[0] as HTMLButtonElement;
    }
    calcLeft(activeTab as HTMLButtonElement);
  }, [calcLeft, props.value]);

  const onItemClick = useCallback(
    (value, event) => {
      if (typeof props.onTabChange === "undefined") return;
      calcLeft(event.target);
      props.onTabChange?.(value);
    },
    [props.onTabChange]
  );

  return (
    <div className="flex border-b">
      <div className="pb-1 relative flex-1">
        <div className="flex" ref={boxRef}>
          {props.tabs.map((item, index) => {
            return (
              <Tab
                key={index}
                title={item.title}
                value={item.value}
                disabled={item.disabled}
                active={
                  !!item.value && !!props.value && item.value === props.value
                }
                onClick={onItemClick}
              />
            );
          })}
        </div>
        <TabIndicator left={left} />
      </div>
      {typeof props.tabBarExtra !== "undefined" && props.tabBarExtra}
    </div>
  );
};
