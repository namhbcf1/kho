import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

export function Sheet({ children, open, onOpenChange }) {
  const [isOpen, setIsOpen] = useState(open || false);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleClose = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  return (
    <>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { isOpen, setIsOpen, onClose: handleClose })
      )}
    </>
  );
}

export function SheetTrigger({ children, isOpen, setIsOpen, asChild, ...props }) {
  return (
    <button
      type="button"
      onClick={() => setIsOpen(true)}
      className={cn("inline-flex items-center justify-center")}
      {...props}
    >
      {children}
    </button>
  );
}

export function SheetContent({ 
  children, 
  className, 
  isOpen, 
  onClose,
  side = "right",
  ...props 
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/80"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div
        className={cn(
          "fixed z-50 gap-4 bg-white p-6 shadow-lg transition ease-in-out",
          "dark:bg-gray-950",
          "animate-in slide-in-from-right duration-300",
          side === "right" && "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" && "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" && "inset-x-0 top-0 border-b",
          side === "bottom" && "inset-x-0 bottom-0 border-t",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
}

export function SheetHeader({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SheetTitle({ children, className, ...props }) {
  return (
    <h2
      className={cn("text-lg font-semibold text-gray-950 dark:text-gray-50", className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export function SheetDescription({ children, className, ...props }) {
  return (
    <p
      className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function SheetFooter({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
} 