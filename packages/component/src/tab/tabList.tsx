import {
  FC,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  MouseEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { TabIndicator } from "./indicator";
import { Tab } from "./tab";
import { TabContext, TabContextState } from "./tabContext";
import { cn } from "@/utils/css";

export type TabItem = {
  title: string;
  value?: string;
  disabled?: boolean;
};

export type TabBarExtraRender = (tabContext: TabContextState) => ReactNode;

interface TabListProps {
  tabs: TabItem[];
  value?: string;
  //   activeIndex: number;
  onTabChange?: (value: string) => void;
  tabBarExtra?: ReactNode | TabBarExtraRender;
  className?: string;
  showIdentifier?: boolean;
}

export const TabList: FC<TabListProps> = (props) => {
  const [left, setLeft] = useState(0);

  const boxRef = useRef<HTMLDivElement>(null);
  const tabContext = useContext(TabContext);

  const calcLeft = useCallback((target: HTMLButtonElement) => {
    const { left, width } = target.getBoundingClientRect();
    const parentLeft = boxRef.current?.getBoundingClientRect().left || 0;

    setLeft(left - parentLeft + (width - 30) / 2);
  }, []);

  useEffect(() => {
    let activeTab = boxRef.current?.querySelector(".active");
    if (!activeTab) {
      activeTab = boxRef.current?.childNodes[0] as HTMLButtonElement;
    }
    calcLeft(activeTab as HTMLButtonElement);
  }, [calcLeft, props.value]);

  const onItemClick = useCallback(
    (value: any, event: MouseEvent<HTMLButtonElement>) => {
      if (typeof props.onTabChange === "undefined") return;
      calcLeft(event.target);
      props.onTabChange?.(value);
    },
    [props.onTabChange]
  );

  const extraNode = useMemo(() => {
    if (typeof props.tabBarExtra === "undefined") return null;
    if (typeof props.tabBarExtra === "function") {
      return props.tabBarExtra(tabContext);
    }
    return props.tabBarExtra;
  }, [props.tabBarExtra, tabContext]);

  return (
    <div className={cn("flex border-b border-b-divider px-2", props.className)}>
      <div className="pb-1 relative flex-1">
        <div className="flex" ref={boxRef}>
          {props.tabs.map((item, index) => {
            return (
              <Tab
                key={index}
                title={item.title}
                value={item.value ?? index}
                disabled={item.disabled}
                active={
                  !!item.value && !!props.value && item.value === props.value
                }
                onClick={onItemClick}
              />
            );
          })}
        </div>
        {props.showIdentifier && <TabIndicator left={left} />}
      </div>
      {extraNode}
    </div>
  );
};
