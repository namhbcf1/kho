import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Delete, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const NumberPad = ({ 
  title = 'Nhập số', 
  value = '', 
  onValueChange, 
  onConfirm, 
  onCancel,
  maxLength = 10,
  allowDecimal = false,
  prefix = '',
  suffix = ''
}) => {
  const [displayValue, setDisplayValue] = useState(value.toString());

  const handleNumberClick = (number) => {
    if (displayValue.length >= maxLength) return;
    
    const newValue = displayValue + number;
    setDisplayValue(newValue);
    onValueChange?.(newValue);
  };

  const handleDecimalClick = () => {
    if (!allowDecimal || displayValue.includes('.')) return;
    
    const newValue = displayValue + '.';
    setDisplayValue(newValue);
    onValueChange?.(newValue);
  };

  const handleBackspace = () => {
    const newValue = displayValue.slice(0, -1);
    setDisplayValue(newValue);
    onValueChange?.(newValue);
  };

  const handleClear = () => {
    setDisplayValue('');
    onValueChange?.('');
  };

  const handleConfirm = () => {
    onConfirm?.(displayValue);
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const formatDisplayValue = () => {
    if (!displayValue) return '0';
    
    // Format number with thousand separators
    const numValue = parseFloat(displayValue);
    if (isNaN(numValue)) return displayValue;
    
    return numValue.toLocaleString('vi-VN');
  };

  const buttonVariants = {
    tap: { scale: 0.95 },
    hover: { scale: 1.05 }
  };

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-center">{title}</CardTitle>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary bg-muted p-4 rounded-lg">
            {prefix}{formatDisplayValue()}{suffix}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Number Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <motion.div
              key={number}
              variants={buttonVariants}
              whileTap="tap"
              whileHover="hover"
            >
              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 text-lg font-semibold"
                onClick={() => handleNumberClick(number.toString())}
              >
                {number}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Decimal Point */}
          <motion.div
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
          >
            <Button
              variant="outline"
              size="lg"
              className={cn(
                "w-full h-12 text-lg font-semibold",
                !allowDecimal && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleDecimalClick}
              disabled={!allowDecimal}
            >
              .
            </Button>
          </motion.div>

          {/* Zero */}
          <motion.div
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
          >
            <Button
              variant="outline"
              size="lg"
              className="w-full h-12 text-lg font-semibold"
              onClick={() => handleNumberClick('0')}
            >
              0
            </Button>
          </motion.div>

          {/* Backspace */}
          <motion.div
            variants={buttonVariants}
            whileTap="tap"
            whileHover="hover"
          >
            <Button
              variant="outline"
              size="lg"
              className="w-full h-12"
              onClick={handleBackspace}
            >
              <Delete className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            size="lg"
            className="h-12"
            onClick={handleClear}
          >
            Xóa hết
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12"
            onClick={handleCancel}
          >
            <X className="h-4 w-4 mr-2" />
            Hủy
          </Button>
        </div>

        {/* Confirm Button */}
        <Button
          size="lg"
          className="w-full h-12"
          onClick={handleConfirm}
          disabled={!displayValue}
        >
          <Check className="h-4 w-4 mr-2" />
          Xác nhận
        </Button>
      </CardContent>
    </Card>
  );
};

export default NumberPad; 