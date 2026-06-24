import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, ArrowLeftOutlined, CameraOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { updateMyProfile } from '../api';

const { Text } = Typography;

const IMG_BASE = '';

export default function EditProfilePage({ currentUser, onLogin }) {
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(currentUser?.avatar ? IMG_BASE + currentUser.avatar : null);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('nickname', values.nickname);
      fd.append('username', values.username);
      if (avatarFile) fd.append('avatar', avatarFile);

      const { data } = await updateMyProfile(fd);
      // 更新本地存储的用户信息
      const newUser = {
        ...currentUser,
        username: data.username,
        nickname: data.nickname,
        avatar: data.avatar,
      };
      localStorage.setItem('user', JSON.stringify(newUser));
      if (onLogin) onLogin(newUser);
      message.success('个人信息修改成功');
      navigate('/profile');
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

      <Card title={<><UserOutlined style={{ color: '#2e7d5e' }} /> 修改个人信息</>} style={{ borderRadius: 12 }}>
        {/* 头像上传 */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            onClick={() => document.getElementById('avatar-input').click()}
            style={{
              width: 96, height: 96, borderRadius: '50%', cursor: 'pointer',
              background: preview ? `url(${preview}) center/cover` : 'linear-gradient(135deg, #2e7d5e, #679667)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, color: '#fff', margin: '0 auto 8px',
              position: 'relative', overflow: 'hidden', border: '3px solid #e8f5e9',
            }}
          >
            {!preview && <UserOutlined />}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 14,
              padding: '3px 0', textAlign: 'center',
            }}>
              <CameraOutlined />
            </div>
          </div>
          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setAvatarFile(file);
                setPreview(URL.createObjectURL(file));
              }
            }}
          />
          <Text style={{ fontSize: 12, color: '#999', display: 'block' }}>点击头像上传照片</Text>
        </div>

        <Form
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            nickname: currentUser?.nickname || '',
            username: currentUser?.username || '',
          }}
        >
          <Form.Item
            name="nickname"
            label="昵称"
          >
            <Input placeholder="你的昵称（留空则显示用户名）" />
          </Form.Item>

          <div style={{ height: 1, background: '#f0f0f0', margin: '4px 0 16px' }} />

          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, message: '用户名不能少于2位' },
            ]}
          >
            <Input placeholder="登录用户名（修改后下次登录生效）" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} block
              style={{ background: '#2e7d5e', borderColor: '#2e7d5e', height: 42 }}>
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
