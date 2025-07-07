import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function exportToExcel(data, filename = 'export.xlsx') {
  try {
    let worksheet;
    
    if (Array.isArray(data)) {
      // Simple array of objects
      worksheet = XLSX.utils.json_to_sheet(data);
    } else if (typeof data === 'object') {
      // Multiple sheets
      const workbook = XLSX.utils.book_new();
      
      Object.keys(data).forEach(sheetName => {
        const sheet = XLSX.utils.json_to_sheet(data[sheetName]);
        XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
      });
      
      XLSX.writeFile(workbook, filename);
      return;
    }
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Không thể xuất file Excel');
  }
}

export function exportToPDF(data, filename = 'export.pdf', options = {}) {
  try {
    const doc = new jsPDF();
    
    // Set Vietnamese font (if available)
    doc.setFont('helvetica');
    
    const {
      title = 'Báo cáo',
      columns = [],
      rows = [],
      orientation = 'portrait'
    } = options;
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, 20, 20);
    
    // Add table
    if (Array.isArray(data) && data.length > 0) {
      const tableColumns = columns.length > 0 ? columns : Object.keys(data[0]);
      const tableRows = rows.length > 0 ? rows : data.map(item => 
        tableColumns.map(col => item[col] || '')
      );
      
      doc.autoTable({
        head: [tableColumns],
        body: tableRows,
        startY: 30,
        styles: {
          font: 'helvetica',
          fontSize: 8
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255
        }
      });
    }
    
    doc.save(filename);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Không thể xuất file PDF');
  }
}

export function exportToCSV(data, filename = 'export.csv') {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Dữ liệu không hợp lệ');
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Không thể xuất file CSV');
  }
}

export function printReport(elementId, title = 'Báo cáo') {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Không tìm thấy element để in');
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${element.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  } catch (error) {
    console.error('Error printing report:', error);
    throw new Error('Không thể in báo cáo');
  }
} 