import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOutlined, AppstoreOutlined, UnorderedListOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';

export default function MobileNav({ currentUser }) {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { key: '/', title: '今日菜单', icon: <BookOutlined /> },
    { key: '/dishes', title: '菜品管理', icon: <AppstoreOutlined /> },
    { key: '/categories', title: '分类管理', icon: <UnorderedListOutlined /> },
    ...(currentUser?.role === 'admin'
      ? [{ key: '/users', title: '用户管理', icon: <TeamOutlined /> }]
      : []),
    { key: '/profile', title: '我的', icon: <UserOutlined /> },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        background: '#fff',
        borderTop: '1px solid #e8e8e8',
        display: 'flex',
        height: 50,
        alignItems: 'center',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
      }}
    >
      {tabs.map((item) => {
        const isActive = location.pathname === item.key;
        return (
          <button
            key={item.key}
            onClick={() => navigate(item.key)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              background: 'transparent',
              border: 'none',
              padding: 0,
              color: isActive ? '#2e7d5e' : '#999',
              transition: 'color 0.2s',
            }}
          >
            <span style={{ fontSize: 19, marginBottom: 2 }}>{item.icon}</span>
            <span style={{ fontSize: 10 }}>{item.title}</span>
          </button>
        );
      })}
    </div>
  );
}
