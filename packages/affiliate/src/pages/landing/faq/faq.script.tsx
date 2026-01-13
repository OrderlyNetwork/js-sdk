import { useState, useMemo, useCallback } from "react";

type FaqItem = {
  id: string;
  number: number;
  question: string;
  answer: string;
  expanded: boolean;
};

export const useFaqScript = () => {
  // Define FAQ items
  const faqItemsData = useMemo<Omit<FaqItem, "expanded">[]>(() => {
    return [
      {
        id: "faq-1",
        number: 1,
        question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
      },
      {
        id: "faq-2",
        number: 2,
        question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
      },
      {
        id: "faq-3",
        number: 3,
        question: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
        answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
      },
    ];
  }, []);

  // State to track which items are expanded
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Toggle expanded state
  const toggleItem = useCallback((id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const faqItems = useMemo(() => {
    return faqItemsData.map((item) => ({
      ...item,
      expanded: expandedItems.has(item.id),
    }));
  }, [faqItemsData, expandedItems]);

  return {
    faqItems,
    toggleItem,
    expandedItems,
  };
};

export type FaqState = ReturnType<typeof useFaqScript>;
