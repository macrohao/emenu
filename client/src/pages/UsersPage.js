import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Space, Row, Col,
  Popconfirm, message, Typography, Card, Tag, Switch,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined,
  AppstoreOutlined, UnorderedListOutlined,
} from '@ant-design/icons';
import { getUsers, createUser, updateUser, deleteUser } from '../api';

const { Title, Text } = Typography;
const { Option } = Select;

export default function UsersPage({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [resetPwdOpen, setResetPwdOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [mobile, setMobile] = useState(window.innerWidth <= 768);
  const [viewMode, setViewMode] = useState('card');
  const [form] = Form.useForm();
  const [pwdForm] = Form.useForm();

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await getUsers();
      setUsers(data);
    } catch {
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      nickname: record.nickname,
      role: record.role,
      enabled: record.enabled,
    });
    setModalOpen(true);
  };

  const openResetPwd = (record) => {
    setEditing(record);
    pwdForm.resetFields();
    setResetPwdOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await updateUser(editing._id, values);
        message.success('更新成功');
      } else {
        await createUser(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      if (err?.response?.data?.message) message.error(err.response.data.message);
    }
  };

  const handleResetPwd = async () => {
    try {
      const values = await pwdForm.validateFields();
      await updateUser(editing._id, { password: values.password });
      message.success('密码已重置');
      setResetPwdOpen(false);
    } catch (err) {
      if (err?.response?.data?.message) message.error(err.response.data.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      message.success('删除成功');
      fetchUsers();
    } catch (err) {
      message.error(err?.response?.data?.message || '删除失败');
    }
  };

  const handleToggleEnabled = async (record, checked) => {
    try {
      await updateUser(record._id, { enabled: checked });
      message.success(checked ? '已启用' : '已禁用');
      fetchUsers();
    } catch {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '用户名', dataIndex: 'username', key: 'username', width: 140,
      render: (v, record) => (
        <Space>
          {v}
          {record._id === currentUser?.id && <Tag color="blue" style={{ fontSize: 11 }}>我</Tag>}
        </Space>
      ),
    },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname', width: 120, render: (v) => v || '-' },
    {
      title: '角色', dataIndex: 'role', key: 'role', width: 100,
      render: (v) => (
        <Tag color={v === 'admin' ? 'red' : 'blue'}>{v === 'admin' ? '管理员' : '员工'}</Tag>
      ),
    },
    {
      title: '状态', dataIndex: 'enabled', key: 'enabled', width: 100,
      render: (v, record) => (
        <Switch
          checked={v}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          disabled={record._id === currentUser?.id}
          onChange={(checked) => handleToggleEnabled(record, checked)}
        />
      ),
    },
    {
      title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180,
      render: (v) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '操作', key: 'action', width: 200,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}
            style={{ background: '#e6f7ff', color: '#1677ff', borderColor: '#91d5ff' }}>编辑</Button>
          <Button size="small" icon={<KeyOutlined />} onClick={() => openResetPwd(record)}
            style={{ background: '#fff7e6', color: '#d46b08', borderColor: '#ffd591' }}>重置密码</Button>
          {record._id !== currentUser?.id && (
            <Popconfirm
              title="确认删除该用户？"
              onConfirm={() => handleDelete(record._id)}
              okText="确认"
              cancelText="取消"
            >
              <Button size="small" danger icon={<DeleteOutlined />}
                style={{ background: '#fff1f0', borderColor: '#ffa39e' }}>删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
        borderRadius: 16, padding: '16px 20px', marginBottom: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10,
      }}>
        <div>
          <Title level={4} style={{ color: '#2e7d5e', margin: 0 }}>👥 用户管理</Title>
          <span style={{ color: '#5a8f6a', fontSize: 13 }}>共 {users.length} 个用户</span>
        </div>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}
            style={{ background: '#2e7d5e', borderColor: '#2e7d5e' }}>新增用户</Button>
          <Button
            icon={viewMode === 'card' ? <UnorderedListOutlined /> : <AppstoreOutlined />}
            onClick={() => setViewMode(v => v === 'card' ? 'list' : 'card')}
            title={viewMode === 'card' ? '切换列表视图' : '切换卡片视图'}
          />
        </Space>
      </div>

      {viewMode === 'card' ? (
        /* ====== 卡片视图 ====== */
        <Row gutter={[12, 12]}>
          {users.map((user) => (
            <Col key={user._id} xs={24} sm={12} md={8} lg={6}>
              <Card className="category-card" styles={{ body: { padding: '16px' } }}>
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%', margin: '0 auto 8px',
                    background: user.role === 'admin'
                      ? 'linear-gradient(135deg, #e53935, #ff7043)'
                      : 'linear-gradient(135deg, #2e7d5e, #679667)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, color: '#fff',
                  }}>
                    {(user.nickname || user.username)[0]?.toUpperCase()}
                  </div>
                  <Text strong style={{ fontSize: 15 }}>{user.nickname || user.username}</Text>
                  <div>
                    <Tag color={user.role === 'admin' ? 'red' : 'blue'} style={{ fontSize: 10, marginTop: 2 }}>
                      {user.role === 'admin' ? '管理员' : '员工'}
                    </Tag>
                    {user._id === currentUser?.id && <Tag color="green" style={{ fontSize: 10 }}>我</Tag>}
                  </div>
                  <Text style={{ fontSize: 11, color: '#999', display: 'block', marginTop: 2 }}>
                    @{user.username}
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Switch
                    size="small"
                    checked={user.enabled}
                    checkedChildren="启用"
                    unCheckedChildren="禁用"
                    disabled={user._id === currentUser?.id}
                    onChange={(checked) => handleToggleEnabled(user, checked)}
                  />
                  <Space size={2}>
                    <Button type="text" icon={<EditOutlined style={{ fontSize: mobile ? 18 : 14 }} />}
                      onClick={() => openEdit(user)}
                      style={{
                        background: '#e6f7ff', color: '#1677ff', borderRadius: 6,
                        width: mobile ? 40 : 32, height: mobile ? 40 : 32, padding: 0,
                      }} />
                    <Button type="text" icon={<KeyOutlined style={{ fontSize: mobile ? 18 : 14 }} />}
                      onClick={() => openResetPwd(user)}
                      style={{
                        background: '#fff7e6', color: '#d46b08', borderRadius: 6,
                        width: mobile ? 40 : 32, height: mobile ? 40 : 32, padding: 0,
                      }} />
                    {user._id !== currentUser?.id && (
                      <Popconfirm title="确认删除该用户？" onConfirm={() => handleDelete(user._id)} okText="确认" cancelText="取消">
                        <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: mobile ? 18 : 14 }} />}
                          style={{
                            background: '#fff1f0', borderRadius: 6,
                            width: mobile ? 40 : 32, height: mobile ? 40 : 32, padding: 0,
                          }} />
                      </Popconfirm>
                    )}
                  </Space>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        /* ====== 列表视图 ====== */
        <Card>
          <Table
            rowKey="_id"
            dataSource={users}
            columns={columns}
            loading={loading}
            pagination={{ pageSize: 10, size: mobile ? 'small' : 'default' }}
            scroll={mobile ? { x: 700 } : undefined}
            size={mobile ? 'small' : 'middle'}
          />
        </Card>
      )}

      {/* 新增 / 编辑用户 */}
      <Modal
        title={editing ? '编辑用户' : '新增用户'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {!editing && (
            <>
              <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                <Input placeholder="登录用户名（不可重复）" />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码不能少于6位' },
                ]}
              >
                <Input.Password placeholder="至少6位" />
              </Form.Item>
            </>
          )}
          <Form.Item name="nickname" label="昵称">
            <Input placeholder="显示名称（可选）" />
          </Form.Item>
          <Form.Item name="role" label="角色" initialValue="staff">
            <Select>
              <Option value="staff">员工</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>
          {editing && (
            <Form.Item name="enabled" label="账号状态" valuePropName="checked" initialValue={true}>
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* 重置密码 */}
      <Modal
        title={`重置密码 — ${editing?.username}`}
        open={resetPwdOpen}
        onOk={handleResetPwd}
        onCancel={() => setResetPwdOpen(false)}
        okText="确认重置"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={pwdForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码不能少于6位' },
            ]}
          >
            <Input.Password placeholder="至少6位" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('两次密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
