import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Space } from 'antd';
import { UserOutlined, LockOutlined, RightOutlined, LogoutOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const IMG_BASE = '';

export default function ProfilePage({ currentUser }) {
  const navigate = useNavigate();
  const avatarUrl = currentUser?.avatar ? IMG_BASE + currentUser.avatar : null;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      {/* 个人信息卡片 */}
      <Card style={{ borderRadius: 12, marginBottom: 20, textAlign: 'center' }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: avatarUrl ? `url(${avatarUrl}) center/cover` : 'linear-gradient(135deg, #2e7d5e, #679667)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, color: '#fff', margin: '0 auto 12px',
          border: '3px solid #e8f5e9', overflow: 'hidden',
        }}>
          {!avatarUrl && <UserOutlined />}
        </div>
        <Title level={4} style={{ margin: 0 }}>
          {currentUser?.nickname || currentUser?.username}
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          @{currentUser?.username} · {currentUser?.role === 'admin' ? '管理员' : '员工'}
        </Text>
      </Card>

      {/* 功能按钮 */}
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <Card
          hoverable
          style={{ borderRadius: 12, cursor: 'pointer' }}
          onClick={() => navigate('/profile/edit')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: '#e8f5e9', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#2e7d5e',
              }}>
                <UserOutlined />
              </div>
              <div>
                <Text strong style={{ fontSize: 15 }}>修改个人信息</Text>
                <div><Text style={{ fontSize: 12, color: '#999' }}>修改昵称等个人资料</Text></div>
              </div>
            </div>
            <RightOutlined style={{ color: '#ccc', fontSize: 16 }} />
          </div>
        </Card>

        <Card
          hoverable
          style={{ borderRadius: 12, cursor: 'pointer' }}
          onClick={() => navigate('/profile/password')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: '#fff3e0', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#e65100',
              }}>
                <LockOutlined />
              </div>
              <div>
                <Text strong style={{ fontSize: 15 }}>修改密码</Text>
                <div><Text style={{ fontSize: 12, color: '#999' }}>修改登录密码</Text></div>
              </div>
            </div>
            <RightOutlined style={{ color: '#ccc', fontSize: 16 }} />
          </div>
        </Card>

        <Button
          danger
          block
          icon={<LogoutOutlined />}
          style={{ borderRadius: 10, height: 44, fontSize: 14, marginTop: 8 }}
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
        >
          退出登录
        </Button>
      </Space>
    </div>
  );
}
