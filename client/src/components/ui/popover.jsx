import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

export function Popover({ children }) {
  return <div className="relative">{children}</div>;
}

export function PopoverTrigger({ children, asChild, ...props }) {
  return (
    <button
      type="button"
      className={cn("inline-flex items-center justify-center")}
      {...props}
    >
      {children}
    </button>
  );
}

export function PopoverContent({ 
  children, 
  className, 
  align = "center", 
  side = "bottom",
  sideOffset = 4,
  ...props 
}) {
  return (
    <div
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-950 shadow-md",
        "dark:bg-gray-950 dark:text-gray-50",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        side === "bottom" && "top-full",
        side === "top" && "bottom-full",
        side === "left" && "right-full",
        side === "right" && "left-full",
        align === "center" && "left-1/2 -translate-x-1/2",
        align === "start" && "left-0",
        align === "end" && "right-0",
        className
      )}
      style={{
        marginTop: side === "bottom" ? sideOffset : undefined,
        marginBottom: side === "top" ? sideOffset : undefined,
        marginLeft: side === "right" ? sideOffset : undefined,
        marginRight: side === "left" ? sideOffset : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  );
} 