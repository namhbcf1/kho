import React from 'react';

// Define Grid3X3 globally to be available for the core files
window.Grid3X3 = function Grid3X3({ className, size = 24, ...props }) {
  return React.createElement('svg', {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    ...props
  }, [
    React.createElement('rect', { key: 'rect', x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" }),
    React.createElement('line', { key: 'line1', x1: "9", y1: "3", x2: "9", y2: "21" }),
    React.createElement('line', { key: 'line2', x1: "15", y1: "3", x2: "15", y2: "21" }),
    React.createElement('line', { key: 'line3', x1: "3", y1: "9", x2: "21", y2: "9" }),
    React.createElement('line', { key: 'line4', x1: "3", y1: "15", x2: "21", y2: "15" })
  ]);
}; 