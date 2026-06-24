import React, { useEffect, useState } from 'react';
import {
  Row, Col, Button, Modal, Form, Input, InputNumber, Select,
  Space, Popconfirm, message, Typography, Card, Upload,
  Tag, Switch, Empty, Spin,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined,
  AppstoreOutlined, UnorderedListOutlined,
} from '@ant-design/icons';
import { getDishes, getMyDishes, createDish, updateDish, deleteDish, getCategories } from '../api';

const { Title, Text } = Typography;
const { Option } = Select;

const IMG_BASE = '';
const NO_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iNDAiPvCfjrU8L3RleHQ+PC9zdmc+';

function getStoredUser() {
  try {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

export default function DishesPage() {
  const currentUser = getStoredUser();
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [mobile, setMobile] = useState(window.innerWidth <= 768);
  const [viewMode, setViewMode] = useState('card');
  const [form] = Form.useForm();

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dishRes, catRes] = await Promise.all([
        currentUser?.role === 'admin'
          ? getDishes(filterCategory ? { category: filterCategory } : {})
          : getMyDishes(filterCategory ? { category: filterCategory } : {}),
        getCategories(),
      ]);
      setDishes(dishRes.data);
      setCategories(catRes.data);
    } catch {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [filterCategory]); // eslint-disable-line

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setFileList([]);
    setModalOpen(true);
  };

  const openEdit = (record) => {
    if (currentUser?.role !== 'admin' && record.owner?._id !== currentUser?.id) {
      message.warning('只能编辑自己创建的菜品');
      return;
    }
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      price: record.price,
      category: record.category?._id || record.category,
      available: record.available,
      sort: record.sort,
    });
    setFileList(
      record.image
        ? [{ uid: '-1', name: 'image', status: 'done', url: IMG_BASE + record.image }]
        : []
    );
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const fd = new FormData();
      Object.entries(values).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v);
      });
      const newFile = fileList.find((f) => f.originFileObj);
      if (newFile) fd.append('image', newFile.originFileObj);

      if (editing) {
        await updateDish(editing._id, fd);
        message.success('更新成功');
      } else {
        await createDish(fd);
        message.success('添加成功');
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      if (err?.response?.data?.message) message.error(err.response.data.message);
    }
  };

  const handleDelete = async (record) => {
    if (currentUser?.role !== 'admin' && record.owner?._id !== currentUser?.id) {
      message.warning('只能删除自己创建的菜品');
      return;
    }
    try {
      await deleteDish(record._id);
      message.success('删除成功');
      fetchAll();
    } catch (err) {
      message.error(err?.response?.data?.message || '删除失败');
    }
  };

  const isOwner = (record) => currentUser?.role === 'admin' || record.owner?._id === currentUser?.id;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* 顶部栏 */}
      <div
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
          <Title level={4} style={{ color: '#2e7d5e', margin: 0 }}>
            📋 菜品管理
            {currentUser?.role !== 'admin' && (
              <span style={{ fontSize: 13, fontWeight: 400, opacity: 0.85, marginLeft: 8 }}>
                （仅显示我的菜品）
              </span>
            )}
          </Title>
          <Text style={{ color: '#5a8f6a', fontSize: 13 }}>
            共 {dishes.length} 道菜品
          </Text>
        </div>
        <Space>
          <Select
            allowClear
            placeholder="按分类筛选"
            style={{ width: 150 }}
            onChange={(v) => setFilterCategory(v || '')}
          >
            {categories.map((c) => <Option key={c._id} value={c._id}>{c.name}</Option>)}
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}
            style={{ background: '#2e7d5e', borderColor: '#2e7d5e' }}>
            新增菜品
          </Button>
          <Button
            icon={viewMode === 'card' ? <UnorderedListOutlined /> : <AppstoreOutlined />}
            onClick={() => setViewMode(v => v === 'card' ? 'list' : 'card')}
            title={viewMode === 'card' ? '切换列表视图' : '切换卡片视图'}
          />
        </Space>
      </div>

      {/* 菜品卡片 */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
          <Spin size="large" />
        </div>
      ) : dishes.length === 0 ? (
        <Empty description={filterCategory ? '该分类下暂无菜品' : '暂无菜品，点击"新增菜品"添加'} />
      ) : viewMode === 'card' ? (
        /* ====== 卡片视图 ====== */
        <Row gutter={[12, 12]}>
          {dishes.map((dish) => (
            <Col key={dish._id} xs={24} sm={12} md={8} lg={6}>
              <Card
                className="menu-card"
                hoverable
                cover={
                  <img
                    alt={dish.name}
                    src={dish.image ? IMG_BASE + dish.image : NO_IMAGE}
                    style={{ height: 120, objectFit: 'cover' }}
                    onError={(e) => { e.target.src = NO_IMAGE; }}
                  />
                }
                styles={{ body: { padding: '8px 10px' } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Title level={5} style={{ margin: 0, fontSize: 14, flex: 1, lineHeight: 1.3 }}>
                    {dish.name}
                    {!dish.available && (
                      <Tag color="default" style={{ marginLeft: 4, fontSize: 9, padding: '0 3px' }}>下架</Tag>
                    )}
                  </Title>
                  <Tag color="volcano" style={{ margin: 0, fontWeight: 600, fontSize: 12 }}>
                    ¥{Number(dish.price).toFixed(2)}
                  </Tag>
                </div>
                {dish.description && (
                  <Text
                    ellipsis
                    style={{ color: '#888', fontSize: 11, marginTop: 4, display: 'block' }}
                  >
                    {dish.description}
                  </Text>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <div>
                    {dish.category?.name && (
                      <Tag color="green" style={{ fontSize: 10, padding: '0 4px', marginRight: 4 }}>
                        {dish.category.name}
                      </Tag>
                    )}
                    {dish.owner?.nickname && (
                      <Text style={{ fontSize: 11, color: '#999' }}>
                        {dish.owner.nickname}
                      </Text>
                    )}
                  </div>
                  {isOwner(dish) && (
                    <Space size={2}>
                      <Button type="text" icon={<EditOutlined style={{ fontSize: mobile ? 20 : 14 }} />}
                        onClick={() => openEdit(dish)}
                        style={{
                          background: '#e6f7ff', color: '#1677ff', borderRadius: 6,
                          width: mobile ? 40 : 32, height: mobile ? 40 : 32,
                        }} />
                      <Popconfirm title="确认删除该菜品？" onConfirm={() => handleDelete(dish)} okText="确认" cancelText="取消">
                        <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: mobile ? 20 : 14 }} />}
                          style={{
                            background: '#fff1f0', borderRadius: 6,
                            width: mobile ? 40 : 32, height: mobile ? 40 : 32,
                          }} />
                      </Popconfirm>
                    </Space>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        /* ====== 列表视图 ====== */
        <Card style={{ borderRadius: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e8f5e9', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px', color: '#2e7d5e', fontWeight: 500, fontSize: 12, width: 50 }}>图片</th>
                <th style={{ padding: '10px 8px', color: '#2e7d5e', fontWeight: 500, fontSize: 12 }}>名称</th>
                <th style={{ padding: '10px 8px', color: '#2e7d5e', fontWeight: 500, fontSize: 12, width: 80 }}>分类</th>
                <th style={{ padding: '10px 8px', color: '#2e7d5e', fontWeight: 500, fontSize: 12, width: 70 }}>价格</th>
                <th style={{ padding: '10px 8px', color: '#2e7d5e', fontWeight: 500, fontSize: 12, width: 60 }}>状态</th>
                <th style={{ padding: '10px 8px', color: '#2e7d5e', fontWeight: 500, fontSize: 12, width: 120 }}>创建者</th>
                <th style={{ padding: '10px 8px', color: '#2e7d5e', fontWeight: 500, fontSize: 12, width: 100 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {dishes.map((dish) => (
                <tr key={dish._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '6px 8px' }}>
                    <img
                      src={dish.image ? IMG_BASE + dish.image : NO_IMAGE}
                      alt={dish.name}
                      style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }}
                      onError={(e) => { e.target.src = NO_IMAGE; }}
                    />
                  </td>
                  <td style={{ padding: '6px 8px', fontWeight: 500 }}>
                    {dish.name}
                    {!dish.available && (
                      <Tag color="default" style={{ marginLeft: 6, fontSize: 9, padding: '0 3px' }}>下架</Tag>
                    )}
                  </td>
                  <td style={{ padding: '6px 8px', color: '#666', fontSize: 12 }}>
                    {dish.category?.name || '-'}
                  </td>
                  <td style={{ padding: '6px 8px', fontWeight: 600, color: '#cf1322' }}>
                    ¥{Number(dish.price).toFixed(2)}
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <Tag color={dish.available ? 'green' : 'default'} style={{ fontSize: 10 }}>
                      {dish.available ? '上架' : '下架'}
                    </Tag>
                  </td>
                  <td style={{ padding: '6px 8px', color: '#999', fontSize: 12 }}>
                    {dish.owner?.nickname || '-'}
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    {isOwner(dish) ? (
                      <Space size={4}>
                        <Button type="text" icon={<EditOutlined style={{ fontSize: 14 }} />}
                          onClick={() => openEdit(dish)}
                          style={{ background: '#e6f7ff', color: '#1677ff', width: 32, height: 32, borderRadius: 6 }} />
                        <Popconfirm title="确认删除该菜品？" onConfirm={() => handleDelete(dish)} okText="确认" cancelText="取消">
                          <Button type="text" danger icon={<DeleteOutlined style={{ fontSize: 14 }} />}
                            style={{ background: '#fff1f0', width: 32, height: 32, borderRadius: 6 }} />
                        </Popconfirm>
                      </Space>
                    ) : (
                      <Text style={{ fontSize: 11, color: '#bbb' }}>无权限</Text>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editing ? '编辑菜品' : '新增菜品'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="菜品名称" rules={[{ required: true, message: '请输入菜品名称' }]}>
            <Input placeholder="例如：红烧肉" />
          </Form.Item>
          <Form.Item name="category" label="所属分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="选择分类">
              {categories.map((c) => <Option key={c._id} value={c._id}>{c.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="price" label="价格（元）" rules={[{ required: true, message: '请输入价格' }]}>
            <InputNumber min={0} step={0.5} precision={2} style={{ width: '100%' }} prefix="¥" />
          </Form.Item>
          <Form.Item name="description" label="菜品描述">
            <Input.TextArea rows={2} placeholder="简单介绍菜品特色（可选）" />
          </Form.Item>
          <Form.Item label="菜品图片">
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: fl }) => setFileList(fl)}
              maxCount={1}
              accept="image/*"
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传图片</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Space style={{ width: '100%' }} align="start">
            <Form.Item name="available" label="上架状态" valuePropName="checked" initialValue={true}>
              <Switch checkedChildren="上架" unCheckedChildren="下架" />
            </Form.Item>
            <Form.Item name="sort" label="排序" initialValue={0}>
              <InputNumber min={0} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
