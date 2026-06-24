import React, { useEffect, useState } from 'react';
import {
  Row, Col, Button, Modal, Form, Input, InputNumber,
  Space, Popconfirm, message, Typography, Card, Tag, Spin, Empty,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api';

const { Title, Text } = Typography;

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [mobile, setMobile] = useState(window.innerWidth <= 768);
  const [form] = Form.useForm();

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await getCategories();
      setCategories(data);
    } catch {
      message.error('加载分类失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await updateCategory(editing._id, values);
        message.success('更新成功');
      } else {
        await createCategory(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      if (err?.response?.data?.message) message.error(err.response.data.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      message.success('删除成功');
      fetchCategories();
    } catch (err) {
      message.error(err?.response?.data?.message || '删除失败');
    }
  };

  return (
    <div>
      {/* 顶部栏 */}
      <div
        className="categories-header"
        style={{
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
          borderRadius: 16,
          padding: '16px 20px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
          <div>
            <Title level={4} style={{ color: '#2e7d5e', margin: 0 }}>📂 分类管理</Title>
            <Text style={{ color: '#5a8f6a', fontSize: 13 }}>
              共 {categories.length} 个分类
            </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}
          style={{ background: '#2e7d5e', borderColor: '#2e7d5e' }}>
          新增分类
        </Button>
      </div>

      {/* 分类列表 */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
          <Spin size="large" />
        </div>
      ) : categories.length === 0 ? (
        <Empty description='暂无分类，点击"新增分类"创建' />
      ) : mobile ? (
        /* 移动端：卡片列表 */
        <Row gutter={[10, 10]}>
          {categories.map((cat) => (
            <Col key={cat._id} xs={24}>
              <Card className="category-card" size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Text strong style={{ fontSize: 15 }}>{cat.name}</Text>
                      <Tag style={{ fontSize: 10 }}>排序 {cat.sort}</Tag>
                    </div>
                    {cat.description && (
                      <Text style={{ color: '#888', fontSize: 12 }}>{cat.description}</Text>
                    )}
                    <div style={{ marginTop: 4 }}>
                      <Text style={{ color: '#bbb', fontSize: 11 }}>
                        {new Date(cat.createdAt).toLocaleString('zh-CN')}
                      </Text>
                    </div>
                  </div>
                  <Space size={2}>
                    <Button type="text" icon={<EditOutlined style={{ fontSize: mobile ? 18 : 14 }} />}
                      onClick={() => openEdit(cat)}
                      style={{
                        background: '#e6f7ff', color: '#1677ff', borderRadius: 6,
                        width: mobile ? 40 : 32, height: mobile ? 40 : 32, padding: 0,
                      }} />
                    <Popconfirm title="确认删除该分类？" onConfirm={() => handleDelete(cat._id)} okText="确认" cancelText="取消">
                      <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: mobile ? 18 : 14 }} />}
                        style={{
                          background: '#fff1f0', borderRadius: 6,
                          width: mobile ? 40 : 32, height: mobile ? 40 : 32, padding: 0,
                        }} />
                    </Popconfirm>
                  </Space>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        /* 桌面端：卡片容器 */
        <Card>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 8px', color: '#888', fontWeight: 500, fontSize: 13 }}>分类名称</th>
                <th style={{ padding: '12px 8px', color: '#888', fontWeight: 500, fontSize: 13 }}>描述</th>
                <th style={{ padding: '12px 8px', color: '#888', fontWeight: 500, fontSize: 13, width: 80 }}>排序</th>
                <th style={{ padding: '12px 8px', color: '#888', fontWeight: 500, fontSize: 13, width: 180 }}>创建时间</th>
                <th style={{ padding: '12px 8px', color: '#888', fontWeight: 500, fontSize: 13, width: 140 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 500 }}>{cat.name}</td>
                  <td style={{ padding: '12px 8px', color: '#666' }}>{cat.description || '-'}</td>
                  <td style={{ padding: '12px 8px' }}>{cat.sort}</td>
                  <td style={{ padding: '12px 8px', color: '#888', fontSize: 13 }}>
                    {new Date(cat.createdAt).toLocaleString('zh-CN')}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <Space>
                      <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(cat)}
                        style={{ background: '#e6f7ff', color: '#1677ff', borderColor: '#91d5ff' }}>编辑</Button>
                      <Popconfirm title="确认删除该分类？" onConfirm={() => handleDelete(cat._id)} okText="确认" cancelText="取消">
                        <Button size="small" danger icon={<DeleteOutlined />}
                          style={{ background: '#fff1f0', borderColor: '#ffa39e' }}>删除</Button>
                      </Popconfirm>
                    </Space>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editing ? '编辑分类' : '新增分类'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="保存"
        cancelText="取消"
        destroyOnClose
        width={mobile ? '95%' : 520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input placeholder="例如：凉菜、热菜、汤品..." />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="分类描述（可选）" />
          </Form.Item>
          <Form.Item name="sort" label="排序（数字越小越靠前）" initialValue={0}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
