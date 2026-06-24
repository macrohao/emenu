import React from 'react';
import { Navigate } from 'react-router-dom';

// 未登录跳转 /login
export function RequireAuth({ currentUser, children }) {
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

// 非管理员跳转首页
export function RequireAdmin({ currentUser, children }) {
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
