import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Spin, Skeleton } from 'antd';
import moment from 'moment';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const { Option } = Select;

const WarrantyClaimForm = ({
  visible,
  onSubmit,
  onCancel,
  initialValues = {},
  loading = false,
  products = [],
  customers = [],
  suppliers = [],
  users = [],
  autoFill,
  autoFillLoading = false
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues && Object.keys(initialValues).length > 0) {
        form.setFieldsValue({
          ...initialValues,
          warranty_start_date: initialValues.warranty_start_date ? moment(initialValues.warranty_start_date) : null,
          warranty_end_date: initialValues.warranty_end_date ? moment(initialValues.warranty_end_date) : null,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleSerialChange = (value) => {
    if (autoFill) autoFill(value);
  };

  const handleFinish = async (values) => {
    try {
      await onSubmit(values);
      toast.success('Lưu yêu cầu bảo hành thành công!');
    } catch (error) {
      toast.error('Lỗi khi lưu yêu cầu bảo hành!');
    }
  };

  return (
    <Modal
      open={visible}
      title={initialValues && initialValues.id ? 'Cập nhật yêu cầu bảo hành' : 'Tạo yêu cầu bảo hành mới'}
      onCancel={onCancel}
      onOk={() => form.submit()}
      footer={null}
      destroyOnClose
    >
      <Spin spinning={loading || autoFillLoading} tip="Đang xử lý...">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.3 }}>
          <Form
            form={form}
            layout="vertical"
            initialValues={initialValues}
            onFinish={handleFinish}
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <>
                <Form.Item name="serial_number" label="Serial Number" rules={[{ required: true, message: 'Nhập serial number!' }]}> 
                  <Input onBlur={e => handleSerialChange(e.target.value)} autoFocus />
                </Form.Item>
                <Form.Item name="product_id" label="Sản phẩm" rules={[{ required: true, message: 'Chọn sản phẩm!' }]}> 
                  <Select showSearch optionFilterProp="children">
                    {products.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}
                  </Select>
                </Form.Item>
                <Form.Item name="customer_id" label="Khách hàng" rules={[{ required: true, message: 'Chọn khách hàng!' }]}> 
                  <Select showSearch optionFilterProp="children">
                    {customers.map(c => <Option key={c.id} value={c.id}>{c.name} ({c.phone})</Option>)}
                  </Select>
                </Form.Item>
                <Form.Item name="supplier_id" label="Nhà cung cấp">
                  <Select showSearch optionFilterProp="children" allowClear>
                    {suppliers.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                  </Select>
                </Form.Item>
                <Form.Item name="warranty_start_date" label="Ngày bắt đầu bảo hành">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="warranty_end_date" label="Ngày kết thúc bảo hành">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="issue_description" label="Mô tả sự cố">
                  <Input.TextArea rows={3} />
                </Form.Item>
                <Form.Item>
                  <motion.div whileTap={{ scale: 0.97 }}>
                    <Button type="primary" htmlType="submit" block loading={loading}>Lưu</Button>
                  </motion.div>
                </Form.Item>
              </>
            )}
          </Form>
        </motion.div>
      </Spin>
    </Modal>
  );
};

export default WarrantyClaimForm; 