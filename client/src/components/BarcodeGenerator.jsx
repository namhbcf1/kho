import React, { useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Download, Copy } from 'lucide-react';
import { toast } from 'sonner';

export function BarcodeGenerator({ value, onChange, onGenerate }) {
  const canvasRef = useRef(null);

  // Simple barcode generation (Code 128-like pattern)
  const generateBarcode = (text) => {
    const canvas = canvasRef.current;
    if (!canvas || !text) return;

    const ctx = canvas.getContext('2d');
    const width = 300;
    const height = 100;
    
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);

    // Generate bars based on text
    const bars = [];
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      // Create a pattern based on character code
      const pattern = (charCode % 8) + 1;
      for (let j = 0; j < pattern; j++) {
        bars.push(j % 2 === 0 ? 1 : 0);
      }
    }

    // Draw bars
    ctx.fillStyle = 'black';
    const barWidth = width / bars.length;
    bars.forEach((bar, index) => {
      if (bar === 1) {
        ctx.fillRect(index * barWidth, 10, barWidth, height - 30);
      }
    });

    // Draw text
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, width / 2, height - 5);
  };

  useEffect(() => {
    if (value) {
      generateBarcode(value);
    }
  }, [value]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `barcode_${value || 'generated'}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast.success('Barcode đã được tải xuống!');
  };

  const handleCopy = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        toast.success('Barcode đã được sao chép!');
      });
    } catch (error) {
      toast.error('Không thể sao chép barcode');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Tạo mã vạch</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="barcode-text">Nội dung mã vạch</Label>
          <Input
            id="barcode-text"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder="Nhập nội dung để tạo mã vạch"
          />
        </div>

        {value && (
          <div className="space-y-2">
            <div className="flex justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <canvas
                ref={canvasRef}
                className="border border-gray-200 dark:border-gray-700"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Tải xuống
              </Button>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Sao chép
              </Button>
            </div>
          </div>
        )}

        {onGenerate && (
          <Button
            onClick={() => onGenerate(value)}
            disabled={!value}
            className="w-full"
          >
            Tạo mã vạch
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 