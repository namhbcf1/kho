import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { exportToExcel, exportToCSV } from '../utils/export';
import { api } from '../services/api';

export function ImportExport({ open, onOpenChange, type = 'products' }) {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn file để import');
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const response = await api.post(`/${type}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(`Import ${response.data.imported || 0} ${type} thành công!`);
      onOpenChange(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error('Lỗi khi import: ' + (error.response?.data?.message || error.message));
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async (format = 'excel') => {
    setExporting(true);
    try {
      const response = await api.get(`/${type}/export`);
      const data = response.data;

      if (format === 'excel') {
        exportToExcel(data, `${type}_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      } else {
        exportToCSV(data, `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
      }

      toast.success(`Xuất ${format.toUpperCase()} thành công!`);
    } catch (error) {
      toast.error('Lỗi khi xuất dữ liệu: ' + (error.response?.data?.message || error.message));
    } finally {
      setExporting(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await api.get(`/${type}/template`);
      const templateData = response.data;
      
      exportToExcel(templateData, `${type}_template.xlsx`);
      toast.success('Tải template thành công!');
    } catch (error) {
      // Fallback template
      const templates = {
        products: [
          {
            name: 'Tên sản phẩm',
            sku: 'Mã SKU',
            barcode: 'Mã vạch',
            category: 'Danh mục',
            price: 'Giá bán',
            cost: 'Giá nhập',
            stock: 'Tồn kho',
            min_stock: 'Tồn kho tối thiểu',
            unit: 'Đơn vị',
            description: 'Mô tả'
          }
        ],
        orders: [
          {
            customer_name: 'Tên khách hàng',
            customer_phone: 'Số điện thoại',
            product_sku: 'Mã sản phẩm',
            quantity: 'Số lượng',
            price: 'Giá',
            payment_method: 'Phương thức thanh toán'
          }
        ]
      };

      exportToExcel(templates[type] || [], `${type}_template.xlsx`);
      toast.success('Tải template mẫu thành công!');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import/Export {type}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="import" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">Import dữ liệu</TabsTrigger>
            <TabsTrigger value="export">Export dữ liệu</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Lưu ý khi import:
                    </p>
                    <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                      <li>• File phải có định dạng Excel (.xlsx) hoặc CSV (.csv)</li>
                      <li>• Đảm bảo các cột bắt buộc có đầy đủ dữ liệu</li>
                      <li>• Tải template để xem định dạng chuẩn</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Chọn file import</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Đã chọn: {selectedFile.name}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Tải template
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!selectedFile || importing}
                  className="flex-1"
                >
                  {importing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang import...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-green-900 dark:text-green-100">
                      Export dữ liệu hiện tại
                    </p>
                    <p className="text-green-800 dark:text-green-200">
                      Xuất toàn bộ dữ liệu {type} hiện có trong hệ thống
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleExport('excel')}
                  disabled={exporting}
                  className="h-20 flex-col"
                >
                  {exporting ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-8 w-8 mb-2" />
                      Export Excel
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                  className="h-20 flex-col"
                >
                  {exporting ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-8 w-8 mb-2" />
                      Export CSV
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 