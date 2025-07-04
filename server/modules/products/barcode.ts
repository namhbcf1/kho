import QRCode from 'qrcode';

export async function generateQRCode(data: string): Promise<string> {
  return await QRCode.toDataURL(data);
}

// TODO: Thêm hàm tạo mã vạch (barcode) nếu cần dùng thư viện khác 