import React from 'react';
import { cn } from '@/lib/utils';

const SelectContext = React.createContext();

const Select = ({ value, onValueChange, defaultValue, children, ...props }) => {
  const [selectedValue, setSelectedValue] = React.useState(defaultValue || value);
  const [isOpen, setIsOpen] = React.useState(false);
  
  const handleValueChange = React.useCallback((newValue) => {
    if (onValueChange) {
      onValueChange(newValue);
    } else {
      setSelectedValue(newValue);
    }
    setIsOpen(false);
  }, [onValueChange]);
  
  const currentValue = value !== undefined ? value : selectedValue;
  
  return (
    <SelectContext.Provider value={{ 
      value: currentValue, 
      onValueChange: handleValueChange,
      isOpen,
      setIsOpen
    }}>
      <div className="relative" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
        'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={() => context?.setIsOpen(!context?.isOpen)}
      {...props}
    >
      {children}
      <svg
        className="h-4 w-4 opacity-50"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = ({ placeholder, ...props }) => {
  const context = React.useContext(SelectContext);
  
  return (
    <span {...props}>
      {context?.value || placeholder}
    </span>
  );
};

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  
  if (!context?.isOpen) return null;
  
  return (
    <>
      <div 
        className="fixed inset-0 z-40"
        onClick={() => context?.setIsOpen(false)}
      />
      <div
        ref={ref}
        className={cn(
          'absolute top-full z-50 mt-1 max-h-60 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
          'w-full overflow-y-auto',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
});
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const context = React.useContext(SelectContext);
  const isSelected = context?.value === value;
  
  return (
    <div
      ref={ref}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
        'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        isSelected && 'bg-accent text-accent-foreground',
        className
      )}
      onClick={() => context?.onValueChange(value)}
      {...props}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="m9 12 2 2 4-4" />
          </svg>
        </span>
      )}
      {children}
    </div>
  );
});
SelectItem.displayName = 'SelectItem';

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
}; 