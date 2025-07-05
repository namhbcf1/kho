import React from 'react';
import { Modal, Table, Input, Button, Spin } from 'antd';

const CustomerSelectModal = ({ visible, onOk, onCancel, customers, loading, onSearch, filteredCustomers, selectCustomer }) => {
  const columns = [
    { title: 'Tên khách hàng', dataIndex: 'name', key: 'name' },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
    { title: 'Hành động', key: 'action', render: (_, record) => <Button type="link" onClick={() => selectCustomer(record)}>Chọn</Button> },
  ];

  return (
    <Modal
      open={visible}
      title="Chọn khách hàng"
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <Spin spinning={loading} tip="Đang tải khách hàng...">
        <Input.Search
          placeholder="Tìm theo tên hoặc số điện thoại"
          onSearch={onSearch}
          style={{ marginBottom: 16 }}
        />
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredCustomers}
          pagination={{ pageSize: 8 }}
        />
      </Spin>
    </Modal>
  );
};

export default CustomerSelectModal; 