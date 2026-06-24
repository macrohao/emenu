import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Alert } from 'antd';
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { changeMyPassword } from '../api';

export default function ChangePasswordPage({ onLogout }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);
    setSuccess(false);
    try {
      await changeMyPassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success('密码修改成功，请重新登录');
      setSuccess(true);
      form.resetFields();
      setTimeout(() => onLogout(), 1500);
    } catch (err) {
      message.error(err?.response?.data?.message || '修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/profile')}
          style={{ color: '#2e7d5e', fontWeight: 500 }}>
          返回
        </Button>
      </div>

      <Card title={<><LockOutlined style={{ color: '#e65100' }} /> 修改密码</>} style={{ borderRadius: 12 }}>
        {success && (
          <Alert title="密码修改成功，即将跳转登录页..." type="success" showIcon style={{ marginBottom: 16 }} />
        )}
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="oldPassword"
            label="原密码"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="当前密码" />
          </Form.Item>

          <div style={{ height: 1, background: '#f0f0f0', margin: '4px 0 16px' }} />

          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码不能少于6位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="至少6位" />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="确认新密码"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: '请确认新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('两次密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="再次输入新密码" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} block
              style={{ background: '#2e7d5e', borderColor: '#2e7d5e', height: 42 }}>
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
