import React from 'react';
import { Modal, Table, Button, Spin } from 'antd';

const SerialSelectModal = ({ visible, onOk, onCancel, serials, selectedSerials, setSelectedSerials, loading }) => {
  const columns = [
    { title: 'Serial', dataIndex: 'serial_number', key: 'serial_number' },
    { title: 'Tình trạng', dataIndex: 'status', key: 'status' },
    { title: 'Ngày nhập', dataIndex: 'import_time', key: 'import_time' },
  ];

  return (
    <Modal
      open={visible}
      title="Chọn Serial cho sản phẩm"
      onOk={() => onOk(selectedSerials)}
      onCancel={onCancel}
      width={600}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onCancel}>Hủy</Button>,
        <Button key="ok" type="primary" onClick={() => onOk(selectedSerials)} disabled={selectedSerials.length === 0}>Thêm vào giỏ</Button>
      ]}
    >
      <Spin spinning={loading} tip="Đang tải serial...">
        <Table
          rowKey="serial_number"
          columns={columns}
          dataSource={serials}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedSerials.map(s => s.serial_number),
            onChange: (selectedRowKeys, selectedRows) => setSelectedSerials(selectedRows)
          }}
          pagination={false}
          size="small"
        />
      </Spin>
    </Modal>
  );
};

export default SerialSelectModal; 