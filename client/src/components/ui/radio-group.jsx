import React from 'react';
import { cn } from '@/lib/utils';

const RadioGroupContext = React.createContext();

const RadioGroup = ({ value, onValueChange, className, ...props }) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={cn('grid gap-2', className)} {...props} />
    </RadioGroupContext.Provider>
  );
};

const RadioGroupItem = React.forwardRef(({ className, value, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext);
  const isSelected = context?.value === value;

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onClick={() => context?.onValueChange?.(value)}
      {...props}
    >
      {isSelected && (
        <div className="flex items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-current" />
        </div>
      )}
    </button>
  );
});
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem }; 