import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

export function DropdownMenu({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { isOpen, setIsOpen })
      )}
    </div>
  );
}

export function DropdownMenuTrigger({ children, isOpen, setIsOpen, asChild, ...props }) {
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn("inline-flex items-center justify-center")}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({ 
  children, 
  className, 
  isOpen, 
  align = "center",
  ...props 
}) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-950 shadow-md",
        "dark:bg-gray-950 dark:text-gray-50",
        "animate-in fade-in-0 zoom-in-95",
        "top-full mt-1",
        align === "center" && "left-1/2 -translate-x-1/2",
        align === "start" && "left-0",
        align === "end" && "right-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ 
  children, 
  className, 
  onClick,
  ...props 
}) {
  return (
    <div
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "transition-colors focus:bg-gray-100 focus:text-gray-900",
        "dark:focus:bg-gray-800 dark:focus:text-gray-50",
        "hover:bg-gray-100 hover:text-gray-900",
        "dark:hover:bg-gray-800 dark:hover:text-gray-50",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "px-2 py-1.5 text-sm font-semibold text-gray-900 dark:text-gray-50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className, ...props }) {
  return (
    <div
      className={cn("-mx-1 my-1 h-px bg-gray-100 dark:bg-gray-800", className)}
      {...props}
    />
  );
} 