import React from 'react';
import { Drawer, Descriptions, Spin, Tag, Skeleton } from 'antd';
import { motion } from 'framer-motion';

const SerialDetailDrawer = ({ visible, onClose, serial, loading }) => {
  return (
    <Drawer
      open={visible}
      title={`Chi tiết Serial: ${serial?.serial_number || ''}`}
      onClose={onClose}
      width={480}
      destroyOnClose
    >
      <Spin spinning={loading} tip="Đang tải...">
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.3 }}>
          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : serial ? (
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Sản phẩm">{serial.product_name}</Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{serial.customer_name}</Descriptions.Item>
              <Descriptions.Item label="Nhà cung cấp">{serial.supplier_name}</Descriptions.Item>
              <Descriptions.Item label="Tình trạng">
                <Tag color={serial.status === 'sold' ? 'blue' : 'green'}>{serial.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày mua">{serial.purchase_date}</Descriptions.Item>
              <Descriptions.Item label="Ngày hết hạn BH">{serial.warranty_end_date}</Descriptions.Item>
              <Descriptions.Item label="Ghi chú">{serial.note}</Descriptions.Item>
            </Descriptions>
          ) : (
            <div>Không có dữ liệu serial.</div>
          )}
        </motion.div>
      </Spin>
    </Drawer>
  );
};

export default SerialDetailDrawer; 