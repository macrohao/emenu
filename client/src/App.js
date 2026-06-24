import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Space, Typography, ConfigProvider } from 'antd';
import {
  BookOutlined, AppstoreOutlined, UnorderedListOutlined,
  TeamOutlined, UserOutlined, LogoutOutlined, SettingOutlined,
} from '@ant-design/icons';

import MenuPage from './pages/MenuPage';
import DishesPage from './pages/DishesPage';
import CategoriesPage from './pages/CategoriesPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import LoginPage from './pages/LoginPage';
import { RequireAuth, RequireAdmin } from './components/Guard';
import MobileNav from './components/MobileNav';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

function getStoredUser() {
  try {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [mobileView, setMobileView] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMobile = () => setMobileView(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogin = (user) => setCurrentUser(user);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    navigate('/login');
  };

  const navItems = [
    { key: '/', icon: <BookOutlined />, label: <Link to="/">今日菜单</Link> },
    { key: '/dishes', icon: <AppstoreOutlined />, label: <Link to="/dishes">菜品管理</Link> },
    { key: '/categories', icon: <UnorderedListOutlined />, label: <Link to="/categories">分类管理</Link> },
    ...(currentUser?.role === 'admin'
      ? [{ key: '/users', icon: <TeamOutlined />, label: <Link to="/users">用户管理</Link> }]
      : []),
  ];

  const selectedKey = navItems.find((n) => n.key === location.pathname)?.key || '/';

  const userMenuItems = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: <Link to="/profile">个人设置</Link>,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ];

  if (!currentUser) {
    return (
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#2e7d5e',
            colorLink: '#2e7d5e',
            borderRadius: 8,
          },
        }}
      >
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#2e7d5e',
            colorLink: '#2e7d5e',
            borderRadius: 8,
          },
        }}
      >
      <Layout style={{ minHeight: '100vh', paddingBottom: mobileView ? 50 : 0 }}>
        {!mobileView ? (
          <Header style={{ display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, background: 'linear-gradient(135deg, #4a9e6f 0%, #2e7d5e 100%)' }}>
            <div onClick={() => navigate('/')} style={{ color: '#fff', fontSize: 18, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}>
              🍽️ 皮皮的小餐车
            </div>
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[selectedKey]}
              items={navItems}
              style={{ flex: 1, minWidth: 0, borderBottom: 'none', background: 'transparent' }}
            />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer', color: '#fff' }}>
                <Avatar size="small" style={{ background: 'rgba(255,255,255,0.25)' }} icon={<UserOutlined />} />
                <Text style={{ color: '#fff', fontSize: 14 }}>
                  {currentUser.nickname || currentUser.username}
                </Text>
              </Space>
            </Dropdown>
          </Header>
        ) : (
          <Header
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 12px',
              background: 'linear-gradient(135deg, #3d9163 0%, #2e7d5e 100%)',
            }}
          >
            <div onClick={() => navigate('/')} style={{ color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                🍽️ 皮皮的小餐车
            </div>
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ background: 'rgba(255,255,255,0.25)', width: 32, height: 32, lineHeight: '32px' }} icon={<UserOutlined style={{ fontSize: 16 }} />} />
              </Space>
            </Dropdown>
          </Header>
        )}

        <Content className="site-layout-content">
          <Routes>
            <Route path="/" element={<MenuPage />} />
            <Route
              path="/dishes"
              element={
                <RequireAuth currentUser={currentUser}>
                  <DishesPage />
                </RequireAuth>
              }
            />
            <Route
              path="/categories"
              element={
                <RequireAuth currentUser={currentUser}>
                  <CategoriesPage />
                </RequireAuth>
              }
            />
            <Route
              path="/users"
              element={
                <RequireAdmin currentUser={currentUser}>
                  <UsersPage currentUser={currentUser} />
                </RequireAdmin>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth currentUser={currentUser}>
                  <ProfilePage currentUser={currentUser} />
                </RequireAuth>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <RequireAuth currentUser={currentUser}>
                  <EditProfilePage currentUser={currentUser} onLogin={handleLogin} />
                </RequireAuth>
              }
            />
            <Route
              path="/profile/password"
              element={
                <RequireAuth currentUser={currentUser}>
                  <ChangePasswordPage onLogout={handleLogout} />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Content>

        {!mobileView && (
          <Footer style={{ textAlign: 'center', color: '#999' }}>
            皮皮的小餐车 © 2026 · MERN Stack
          </Footer>
        )}

        {mobileView && <MobileNav currentUser={currentUser} />}
      </Layout>
    </ConfigProvider>
  );
}
