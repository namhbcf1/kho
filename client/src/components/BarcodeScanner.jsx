import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, Zap, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const BarcodeScanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setHasPermission(true);
        setIsScanning(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Không thể truy cập camera. Vui lòng cấp quyền truy cập camera.');
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const handleManualInput = () => {
    const barcode = prompt('Nhập mã vạch thủ công:');
    if (barcode && barcode.trim()) {
      onScan(barcode.trim());
    }
  };

  // Simulate barcode detection (in real app, you'd use a barcode detection library)
  const simulateScan = () => {
    // Generate a random barcode for demo
    const demoBarcode = `${Math.floor(Math.random() * 9000000000000) + 1000000000000}`;
    onScan(demoBarcode);
  };

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="space-y-3">
            <Button 
              onClick={startCamera} 
              className="w-full"
              variant="outline"
            >
              <Camera className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
            <Button 
              onClick={handleManualInput} 
              className="w-full"
            >
              Nhập mã thủ công
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full h-64 bg-black rounded-lg object-cover"
          autoPlay
          playsInline
          muted
        />
        
        {/* Scanning overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Scanning frame */}
            <div className="w-48 h-32 border-2 border-primary rounded-lg relative">
              <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-primary"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-primary"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-primary"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-primary"></div>
              
              {/* Scanning line animation */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="w-full h-0.5 bg-primary animate-pulse"></div>
              </div>
            </div>
            
            {/* Instructions */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-sm text-white bg-black/50 px-3 py-1 rounded">
                Đưa mã vạch vào khung hình
              </p>
            </div>
          </div>
        </div>
        
        {/* Scanner icon */}
        <div className="absolute top-4 right-4">
          <ScanLine className="h-6 w-6 text-white animate-pulse" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Button
          onClick={simulateScan}
          className="flex-1"
          variant="outline"
        >
          <Zap className="h-4 w-4 mr-2" />
          Quét thử (Demo)
        </Button>
        <Button
          onClick={handleManualInput}
          className="flex-1"
          variant="outline"
        >
          Nhập thủ công
        </Button>
      </div>

      {/* Status */}
      {isScanning && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Đang quét...
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner; 