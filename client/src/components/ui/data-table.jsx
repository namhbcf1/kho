import React from 'react';
import { cn } from '../../lib/utils';

export function DataTable({ 
  columns, 
  data, 
  className,
  onRowClick,
  ...props 
}) {
  return (
    <div className={cn("overflow-x-auto", className)} {...props}>
      <table className="w-full border-collapse border border-gray-200 dark:border-gray-700">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800">
            {columns.map((column, index) => (
              <th
                key={index}
                className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left font-medium text-gray-900 dark:text-gray-100"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                "hover:bg-gray-50 dark:hover:bg-gray-800",
                onRowClick && "cursor-pointer"
              )}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100"
                >
                  {column.cell 
                    ? column.cell(row[column.accessorKey], row)
                    : row[column.accessorKey]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 