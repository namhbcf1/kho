import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Delete } from 'lucide-react';

export function NumberPad({ onNumber, onClear, onEnter }) {
  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'], 
    ['7', '8', '9'],
    ['0', '.', 'clear']
  ];

  const handleClick = (value) => {
    if (value === 'clear') {
      onClear?.();
    } else if (value === 'enter') {
      onEnter?.();
    } else {
      onNumber?.(value);
    }
  };

  return (
    <Card className="w-full max-w-xs">
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {numbers.flat().map((num, index) => (
            <Button
              key={index}
              variant={num === 'clear' ? 'destructive' : 'outline'}
              className="h-12 text-lg font-semibold"
              onClick={() => handleClick(num)}
            >
              {num === 'clear' ? <Delete className="h-5 w-5" /> : num}
            </Button>
          ))}
          <Button
            className="col-span-3 h-12 text-lg font-semibold"
            onClick={() => handleClick('enter')}
          >
            Enter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 