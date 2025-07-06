import React, { useState, useEffect } from 'react';
import {
  Steps,
  Card,
  Button,
  Form,
  Input,
  Select,
  Table,
  Modal,
  Space,
  Tag,
  Statistic,
  Row,
  Col,
  Typography,
  Alert,
  Divider,
  Switch,
  InputNumber,
  message,
  Tooltip,
  Badge,
  Timeline,
  Progress
} from 'antd';
import {
  RobotOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  BulbOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  FireOutlined,
  GiftOutlined,
  MailOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  CrownOutlined,
  FileTextOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { automationAPI } from '../services/api';

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AutomationPage = () => {
  const [rules, setRules] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [editingRule, setEditingRule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for demonstration
  const mockRules = [
    {
      id: 1,
      name: 'Low Stock Alert & Auto Reorder',
      description: 'Automatically create purchase order when inventory is low',
      trigger: 'inventory.low_stock',
      conditions: [
        { field: 'quantity', operator: '<=', value: '10' },
        { field: 'category', operator: '!=', value: 'discontinued' }
      ],
      actions: [
        { type: 'create_po_draft', config: { supplier_id: 'auto', quantity: 50 } },
        { type: 'send_notification', config: { message: 'Low stock alert for {product_name}' } }
      ],
      status: 'active',
      created_at: '2024-01-15T10:30:00Z',
      last_executed: '2024-01-20T14:22:00Z',
      execution_count: 15,
      success_rate: 100
    },
    {
      id: 2,
      name: 'VIP Customer Welcome',
      description: 'Send welcome message and discount to new VIP customers',
      trigger: 'customer.new_vip',
      conditions: [
        { field: 'total_spent', operator: '>=', value: '1000' }
      ],
      actions: [
        { type: 'send_email', config: { template: 'vip_welcome', discount: 15 } },
        { type: 'create_voucher', config: { type: 'percentage', value: 15, expires_days: 30 } }
      ],
      status: 'active',
      created_at: '2024-01-10T09:15:00Z',
      last_executed: '2024-01-19T16:45:00Z',
      execution_count: 8,
      success_rate: 87.5
    },
    {
      id: 3,
      name: 'High Value Order Notification',
      description: 'Notify management of high-value orders',
      trigger: 'order.high_value',
      conditions: [
        { field: 'total_amount', operator: '>', value: '500' }
      ],
      actions: [
        { type: 'send_notification', config: { message: 'High value order: ${total_amount}', priority: 'high' } },
        { type: 'send_email', config: { to: 'manager@company.com', subject: 'High Value Order Alert' } }
      ],
      status: 'paused',
      created_at: '2024-01-05T14:20:00Z',
      last_executed: '2024-01-18T11:30:00Z',
      execution_count: 23,
      success_rate: 95.7
    }
  ];

  const mockExecutions = [
    {
      id: 1,
      rule_id: 1,
      rule_name: 'Low Stock Alert & Auto Reorder',
      status: 'success',
      executed_at: '2024-01-20T14:22:00Z',
      duration: 1.2,
      trigger_data: { product_id: 123, product_name: 'Wireless Mouse', quantity: 8 },
      results: { po_created: true, notification_sent: true }
    },
    {
      id: 2,
      rule_id: 2,
      rule_name: 'VIP Customer Welcome',
      status: 'success',
      executed_at: '2024-01-19T16:45:00Z',
      duration: 0.8,
      trigger_data: { customer_id: 456, customer_name: 'John Doe', total_spent: 1250 },
      results: { email_sent: true, voucher_created: 'WELCOME15-789' }
    },
    {
      id: 3,
      rule_id: 3,
      rule_name: 'High Value Order Notification',
      status: 'failed',
      executed_at: '2024-01-18T11:30:00Z',
      duration: 0.3,
      trigger_data: { order_id: 789, total_amount: 750 },
      results: { error: 'Email service unavailable' }
    }
  ];

  const mockStats = {
    total_rules: 3,
    active_rules: 2,
    paused_rules: 1,
    success_rate: 94.3,
    daily_executions: 12,
    total_executions: 46
  };

  const triggerEvents = [
    { value: 'inventory.low_stock', label: 'Low Stock Alert', icon: <WarningOutlined />, color: 'orange' },
    { value: 'customer.new_vip', label: 'New VIP Customer', icon: <CrownOutlined />, color: 'gold' },
    { value: 'customer.loyal', label: 'Loyal Customer Milestone', icon: <FireOutlined />, color: 'red' },
    { value: 'order.completed', label: 'Order Completed', icon: <CheckCircleOutlined />, color: 'green' },
    { value: 'order.high_value', label: 'High Value Order', icon: <ThunderboltOutlined />, color: 'purple' },
    { value: 'product.out_of_stock', label: 'Product Out of Stock', icon: <CloseCircleOutlined />, color: 'red' }
  ];

  const actionTypes = [
    { value: 'create_po_draft', label: 'Create Purchase Order Draft', icon: <ShoppingCartOutlined />, color: 'blue' },
    { value: 'send_notification', label: 'Send In-App Notification', icon: <BulbOutlined />, color: 'orange' },
    { value: 'send_email', label: 'Send Email', icon: <MailOutlined />, color: 'green' },
    { value: 'send_sms', label: 'Send SMS', icon: <MessageOutlined />, color: 'cyan' },
    { value: 'apply_promotion', label: 'Apply Promotion', icon: <GiftOutlined />, color: 'magenta' },
    { value: 'create_voucher', label: 'Create Voucher', icon: <FileTextOutlined />, color: 'geekblue' },
    { value: 'update_customer_tier', label: 'Update Customer Tier', icon: <CrownOutlined />, color: 'gold' }
  ];

  const operators = [
    { value: '=', label: 'Equals (=)' },
    { value: '!=', label: 'Not Equals (≠)' },
    { value: '>', label: 'Greater Than (>)' },
    { value: '<', label: 'Less Than (<)' },
    { value: '>=', label: 'Greater or Equal (≥)' },
    { value: '<=', label: 'Less or Equal (≤)' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Use mock data for demonstration
      setRules(mockRules);
      setExecutions(mockExecutions);
      setStats(mockStats);
      
      // In real implementation, use:
      // const [rulesRes, executionsRes, statsRes] = await Promise.all([
      //   automationAPI.getRules(),
      //   automationAPI.getExecutions(),
      //   automationAPI.getStats()
      // ]);
      // setRules(rulesRes.data);
      // setExecutions(executionsRes.data);
      // setStats(statsRes.data);
    } catch (error) {
      message.error('Failed to load automation data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    setCurrentStep(0);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setCurrentStep(0);
    form.setFieldsValue({
      name: rule.name,
      description: rule.description,
      trigger: rule.trigger,
      conditions: rule.conditions,
      actions: rule.actions
    });
    setModalVisible(true);
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      // await automationAPI.deleteRule(ruleId);
      setRules(rules.filter(rule => rule.id !== ruleId));
      message.success('Rule deleted successfully');
    } catch (error) {
      message.error('Failed to delete rule');
    }
  };

  const handleToggleRule = async (ruleId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      // await automationAPI.updateRule(ruleId, { status: newStatus });
      setRules(rules.map(rule => 
        rule.id === ruleId ? { ...rule, status: newStatus } : rule
      ));
      message.success(`Rule ${newStatus === 'active' ? 'activated' : 'paused'} successfully`);
    } catch (error) {
      message.error('Failed to update rule status');
    }
  };

  const handleSaveRule = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingRule) {
        // await automationAPI.updateRule(editingRule.id, values);
        setRules(rules.map(rule => 
          rule.id === editingRule.id ? { ...rule, ...values } : rule
        ));
        message.success('Rule updated successfully');
      } else {
        // const response = await automationAPI.createRule(values);
        const newRule = {
          id: Date.now(),
          ...values,
          status: 'active',
          created_at: new Date().toISOString(),
          execution_count: 0,
          success_rate: 0
        };
        setRules([...rules, newRule]);
        message.success('Rule created successfully');
      }
      
      setModalVisible(false);
      setCurrentStep(0);
      form.resetFields();
    } catch (error) {
      message.error('Please fill in all required fields');
    }
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rule.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const ruleColumns = [
    {
      title: 'Rule Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.description}</Text>
        </div>
      )
    },
    {
      title: 'Trigger Event',
      dataIndex: 'trigger',
      key: 'trigger',
      render: (trigger) => {
        const event = triggerEvents.find(e => e.value === trigger);
        return event ? (
          <Tag icon={event.icon} color={event.color}>
            {event.label}
          </Tag>
        ) : trigger;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status === 'active' ? 'Active' : 'Paused'}
        </Tag>
      )
    },
    {
      title: 'Executions',
      dataIndex: 'execution_count',
      key: 'execution_count',
      render: (count, record) => (
        <div>
          <Text>{count} times</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.success_rate}% success
          </Text>
        </div>
      )
    },
    {
      title: 'Last Executed',
      dataIndex: 'last_executed',
      key: 'last_executed',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Never'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title={record.status === 'active' ? 'Pause Rule' : 'Activate Rule'}>
            <Button
              type="text"
              icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => handleToggleRule(record.id, record.status)}
            />
          </Tooltip>
          <Tooltip title="Edit Rule">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditRule(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Rule">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteRule(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const executionColumns = [
    {
      title: 'Rule',
      dataIndex: 'rule_name',
      key: 'rule_name'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'success' ? 'green' : 'red'}>
          {status === 'success' ? 'Success' : 'Failed'}
        </Tag>
      )
    },
    {
      title: 'Executed At',
      dataIndex: 'executed_at',
      key: 'executed_at',
      render: (date) => new Date(date).toLocaleString()
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration}s`
    },
    {
      title: 'Results',
      dataIndex: 'results',
      key: 'results',
      render: (results) => (
        <Text code style={{ fontSize: '11px' }}>
          {JSON.stringify(results, null, 2)}
        </Text>
      )
    }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <Title level={4}>
              <InfoCircleOutlined /> Rule Information
            </Title>
            <Paragraph type="secondary">
              Provide basic information about your automation rule.
            </Paragraph>
            <Form.Item
              name="name"
              label="Rule Name"
              rules={[{ required: true, message: 'Please enter rule name' }]}
            >
              <Input placeholder="e.g., Low Stock Alert & Auto Reorder" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <TextArea 
                rows={3} 
                placeholder="Describe what this rule does and when it should trigger"
              />
            </Form.Item>
          </div>
        );

      case 1:
        return (
          <div>
            <Title level={4}>
              <ThunderboltOutlined /> Trigger Event
            </Title>
            <Paragraph type="secondary">
              Choose the event that will trigger this automation rule.
            </Paragraph>
            <Form.Item
              name="trigger"
              label="When this happens"
              rules={[{ required: true, message: 'Please select a trigger event' }]}
            >
              <Select placeholder="Select trigger event" size="large">
                {triggerEvents.map(event => (
                  <Option key={event.value} value={event.value}>
                    <Space>
                      {event.icon}
                      <span>{event.label}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Alert
              message="Trigger Events"
              description="These events are automatically detected by the system. When any of these events occur, the rule conditions will be evaluated."
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          </div>
        );

      case 2:
        return (
          <div>
            <Title level={4}>
              <SettingOutlined /> Conditions
            </Title>
            <Paragraph type="secondary">
              Add conditions to control when the rule should execute. All conditions must be met.
            </Paragraph>
            <Form.List name="conditions">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} size="small" style={{ marginBottom: 8 }}>
                      <Row gutter={8}>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'field']}
                            rules={[{ required: true, message: 'Field required' }]}
                          >
                            <Input placeholder="Field name" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'operator']}
                            rules={[{ required: true, message: 'Operator required' }]}
                          >
                            <Select placeholder="Operator">
                              {operators.map(op => (
                                <Option key={op.value} value={op.value}>
                                  {op.label}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'value']}
                            rules={[{ required: true, message: 'Value required' }]}
                          >
                            <Input placeholder="Value" />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                          />
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />}
                  >
                    Add Condition
                  </Button>
                </>
              )}
            </Form.List>
            <Alert
              message="Condition Logic"
              description="All conditions must be true for the rule to execute. Use conditions to fine-tune when your automation should run."
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          </div>
        );

      case 3:
        return (
          <div>
            <Title level={4}>
              <RobotOutlined /> Actions
            </Title>
            <Paragraph type="secondary">
              Define what actions should be performed when the rule triggers.
            </Paragraph>
            <Form.List name="actions">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card key={key} size="small" style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'type']}
                            label="Action Type"
                            rules={[{ required: true, message: 'Action type required' }]}
                          >
                            <Select placeholder="Select action">
                              {actionTypes.map(action => (
                                <Option key={action.value} value={action.value}>
                                  <Space>
                                    {action.icon}
                                    <span>{action.label}</span>
                                  </Space>
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={10}>
                          <Form.Item
                            {...restField}
                            name={[name, 'config']}
                            label="Configuration (JSON)"
                            rules={[{ required: true, message: 'Configuration required' }]}
                          >
                            <TextArea 
                              rows={3} 
                              placeholder='{"key": "value"}' 
                            />
                          </Form.Item>
                        </Col>
                        <Col span={2}>
                          <Form.Item label=" ">
                            <Button 
                              type="text" 
                              danger 
                              icon={<DeleteOutlined />}
                              onClick={() => remove(name)}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />}
                  >
                    Add Action
                  </Button>
                </>
              )}
            </Form.List>
            <Alert
              message="Action Configuration"
              description="Actions are executed in order. Use JSON format for configuration. Variables from trigger data can be used with ${variable_name} syntax."
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          </div>
        );

      case 4:
        return (
          <div>
            <Title level={4}>
              <CheckCircleOutlined /> Review & Confirm
            </Title>
            <Paragraph type="secondary">
              Review your automation rule before saving.
            </Paragraph>
            
            <Card title="Rule Summary" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>Name:</Text>
                  <br />
                  <Text>{form.getFieldValue('name')}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Trigger:</Text>
                  <br />
                  <Text>{form.getFieldValue('trigger')}</Text>
                </Col>
              </Row>
              <Divider />
              <Text strong>Description:</Text>
              <br />
              <Text>{form.getFieldValue('description')}</Text>
            </Card>

            <Card title="If-Then Logic Preview" style={{ marginBottom: 16 }}>
              <Timeline>
                <Timeline.Item 
                  dot={<ThunderboltOutlined style={{ fontSize: '16px' }} />}
                  color="blue"
                >
                  <Text strong>WHEN:</Text> {form.getFieldValue('trigger')}
                </Timeline.Item>
                
                {form.getFieldValue('conditions')?.length > 0 && (
                  <Timeline.Item 
                    dot={<SettingOutlined style={{ fontSize: '16px' }} />}
                    color="orange"
                  >
                    <Text strong>IF:</Text>
                    <ul style={{ marginTop: 8, marginBottom: 0 }}>
                      {form.getFieldValue('conditions')?.map((condition, index) => (
                        <li key={index}>
                          {condition.field} {condition.operator} {condition.value}
                        </li>
                      ))}
                    </ul>
                  </Timeline.Item>
                )}
                
                <Timeline.Item 
                  dot={<RobotOutlined style={{ fontSize: '16px' }} />}
                  color="green"
                >
                  <Text strong>THEN:</Text>
                  <ul style={{ marginTop: 8, marginBottom: 0 }}>
                    {form.getFieldValue('actions')?.map((action, index) => (
                      <li key={index}>
                        {actionTypes.find(a => a.value === action.type)?.label || action.type}
                      </li>
                    ))}
                  </ul>
                </Timeline.Item>
              </Timeline>
            </Card>

            <Alert
              message="Ready to Save"
              description="Your automation rule is ready to be created. It will be activated immediately and start monitoring for trigger events."
              type="success"
              showIcon
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <RobotOutlined /> Automation Rules
        </Title>
        <Paragraph>
          Create and manage automated workflows to streamline your business operations.
          Set up rules that automatically respond to events like low inventory, new customers, or high-value orders.
        </Paragraph>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Rules"
              value={stats.total_rules}
              prefix={<RobotOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Rules"
              value={stats.active_rules}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={stats.success_rate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress 
              percent={stats.success_rate} 
              showInfo={false} 
              strokeColor="#52c41a"
              size="small"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Daily Executions"
              value={stats.daily_executions}
              prefix={<ThunderboltOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Controls */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space>
              <Input.Search
                placeholder="Search rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 300 }}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 120 }}
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="paused">Paused</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateRule}
              size="large"
            >
              Create Rule
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Rules Table */}
      <Card title="Automation Rules" style={{ marginBottom: '24px' }}>
        <Table
          columns={ruleColumns}
          dataSource={filteredRules}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} rules`
          }}
        />
      </Card>

      {/* Execution History */}
      <Card title={<><HistoryOutlined /> Execution History</>}>
        <Table
          columns={executionColumns}
          dataSource={executions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} executions`
          }}
        />
      </Card>

      {/* Rule Builder Modal */}
      <Modal
        title={
          <Space>
            <RobotOutlined />
            {editingRule ? 'Edit Automation Rule' : 'Create Automation Rule'}
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setCurrentStep(0);
          form.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Steps current={currentStep} style={{ marginBottom: '24px' }}>
          <Step title="Info" icon={<InfoCircleOutlined />} />
          <Step title="Trigger" icon={<ThunderboltOutlined />} />
          <Step title="Conditions" icon={<SettingOutlined />} />
          <Step title="Actions" icon={<RobotOutlined />} />
          <Step title="Confirm" icon={<CheckCircleOutlined />} />
        </Steps>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            conditions: [],
            actions: []
          }}
        >
          {renderStepContent()}
        </Form>

        <Divider />

        <div style={{ textAlign: 'right' }}>
          <Space>
            {currentStep > 0 && (
              <Button onClick={prevStep}>
                Previous
              </Button>
            )}
            {currentStep < 4 && (
              <Button type="primary" onClick={nextStep}>
                Next <ArrowRightOutlined />
              </Button>
            )}
            {currentStep === 4 && (
              <Button type="primary" onClick={handleSaveRule}>
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </Button>
            )}
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default AutomationPage; 