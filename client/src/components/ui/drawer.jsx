import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

export function Drawer({ children, open, onOpenChange }) {
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

export function DrawerTrigger({ children, isOpen, setIsOpen, asChild, ...props }) {
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

export function DrawerContent({ 
  children, 
  className, 
  isOpen, 
  onClose,
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
      
      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-white",
          "dark:bg-gray-950",
          "animate-in slide-in-from-bottom duration-300",
          className
        )}
        {...props}
      >
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-gray-300 dark:bg-gray-600" />
        {children}
      </div>
    </>
  );
}

export function DrawerHeader({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "grid gap-1.5 p-4 text-center sm:text-left",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DrawerTitle({ children, className, ...props }) {
  return (
    <h2
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export function DrawerDescription({ children, className, ...props }) {
  return (
    <p
      className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function DrawerFooter({ children, className, ...props }) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    >
      {children}
    </div>
  );
} 