import React, { useEffect } from "react";
import { createPortal } from "react-dom";

interface DrawerProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function Drawer({ children, isOpen, onClose }: DrawerProps) {
  // 控制页面滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // 清理函数，组件卸载时恢复滚动
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="oui-fixed oui-inset-0 oui-z-[60]">
      {/* 遮罩层 */}
      <div 
        className="oui-absolute oui-inset-0 oui-bg-[rgba(0,0,0,0.48)] oui-transition-opacity"
        onClick={onClose}
      />
      
      {/* 抽屉主体 */}
      <div className={`
        oui-overflow-hidden
        oui-fixed oui-top-0 oui-top-1/2 oui-translate-y-[-50%] oui-right-0  
        oui-bg-[#131519] oui-shadow-lg
        oui-border oui-border-line-12
        oui-h-screen  oui-w-[276px]
        md:oui-h-[calc(100vh-72px)] md:oui-w-[300px]
        oui-rounded-2xl
        md:oui-rounded-0
        oui-p-4
        oui-transform oui-transition-transform oui-duration-300 oui-ease-in-out
        oui-flex oui-flex-col oui-justify-between
        ${isOpen ? 'oui-translate-x-0' : 'oui--translate-x-full'}
      `}>
        {children}
      </div>
    </div>,
    document.body
  );
}

