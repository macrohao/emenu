import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, GithubOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

const { Title, Text } = Typography;

export default function LoginPage({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobile, setMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await login(values);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      message.success(`欢迎回来！`);
      onLogin(data.user);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: mobile ? 16 : 24,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
        styles={{ body: { padding: mobile ? 16 : 24 } }}
      >
        <div style={{ textAlign: 'center', marginBottom: mobile ? 20 : 28 }}>
          <div style={{ fontSize: mobile ? 36 : 44, lineHeight: 1 }}>🍽️</div>
          <Title level={mobile ? 4 : 3} style={{ margin: '6px 0 2px' }}>皮皮的小餐车</Title>
          <Text type="secondary" style={{ fontSize: mobile ? 12 : 14 }}>登录以继续</Text>
        </div>

        {error && (
          <Alert title={error} type="error" showIcon style={{ marginBottom: 12 }} />
        )}

        <Form layout="vertical" onFinish={handleSubmit} size={mobile ? 'middle' : 'large'}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" autoComplete="username" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登 录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <a
            href="https://github.com/macrohao"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#999', fontSize: 22, transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.target.style.color = '#333'}
            onMouseLeave={(e) => e.target.style.color = '#999'}
          >
            <GithubOutlined />
          </a>
        </div>
      </Card>
    </div>
  );
}
