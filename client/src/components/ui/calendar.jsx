import React from 'react';
import { cn } from '../../lib/utils';

export function Calendar({ className, selected, onSelect, ...props }) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const days = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }
  
  const handleDateClick = (day) => {
    if (day && onSelect) {
      const date = new Date(currentYear, currentMonth, day);
      onSelect(date);
    }
  };
  
  return (
    <div className={cn("p-4 border rounded-lg bg-white dark:bg-gray-800", className)} {...props}>
      <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium mb-2">
        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
          <div key={day} className="p-2 text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(day)}
            className={cn(
              "p-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700",
              day ? "cursor-pointer" : "cursor-default",
              selected && selected.getDate() === day && selected.getMonth() === currentMonth
                ? "bg-blue-500 text-white"
                : "text-gray-900 dark:text-gray-100"
            )}
            disabled={!day}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
} 