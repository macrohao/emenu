import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Typography, Tag, Spin, Empty, Input, Switch,
} from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { getCategories, getDishes, getMyDishes } from '../api';

const { Title, Text, Paragraph } = Typography;
const IMG_BASE = '';
const NO_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iNDAiPvCfjrU8L3RleHQ+PC9zdmc+';

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [dishesByCategory, setDishesByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showMyOnly, setShowMyOnly] = useState(false);
  const [mobile, setMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [catRes, dishRes] = await Promise.all([
          getCategories(),
          showMyOnly ? getMyDishes({ available: true }) : getDishes({ available: true }),
        ]);
        setCategories(catRes.data);

        const map = { all: dishRes.data };
        catRes.data.forEach((cat) => {
          map[cat._id] = dishRes.data.filter(
            (d) => (d.category?._id || d.category) === cat._id
          );
        });
        setDishesByCategory(map);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showMyOnly]);

  const filterDishes = (list) => {
    if (!search.trim()) return list;
    return list.filter(
      (d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        (d.description || '').toLowerCase().includes(search.toLowerCase())
    );
  };

  const currentDishes = filterDishes(dishesByCategory[activeCategory] || []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spin size="large" description="加载菜单中..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* 横幅 */}
      <div
        style={{
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
          borderRadius: 16,
          padding: mobile ? '16px 14px' : '24px 20px',
          marginBottom: 12,
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: mobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: mobile ? 'flex-start' : 'center',
          gap: mobile ? 10 : 0,
          marginBottom: 12,
        }}>
          <div>
            <Title level={4} style={{ color: '#2e7d5e', margin: '0 0 4px 0', fontSize: mobile ? 16 : undefined }}>
              🍽️ 今日菜单
            </Title>
            <Text style={{ color: '#5a8f6a', fontSize: 12 }}>
              {showMyOnly ? '我的菜品' : '全部菜品'} · {dishesByCategory['all']?.length || 0} 道
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <UserOutlined style={{ fontSize: 12, opacity: 0.7 }} />
            <Text style={{ fontSize: 12, color: '#5a8f6a', marginRight: 4 }}>我的菜品</Text>
            <Switch
              checked={showMyOnly}
              onChange={setShowMyOnly}
              checkedChildren="开"
              unCheckedChildren="关"
              size={mobile ? 'small' : 'medium'}
            />
          </div>
        </div>
        <Input
          prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
          placeholder="搜索菜品..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ borderRadius: 20, width: mobile ? '100%' : 280 }}
          allowClear
          size={mobile ? 'middle' : 'middle'}
        />
      </div>

      {mobile ? (
        /* ====== 移动端：Tab 切换 ====== */
        <>
          {/* 分类 Tab */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 8,
            WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
          }}>
            <Tag
              onClick={() => setActiveCategory('all')}
              style={{
                flexShrink: 0, cursor: 'pointer', borderRadius: 20, padding: '4px 14px', fontWeight: 500, fontSize: 13,
                border: activeCategory === 'all' ? '1px solid #2e7d5e' : '1px solid #ddd',
                background: activeCategory === 'all' ? '#2e7d5e' : '#fff',
                color: activeCategory === 'all' ? '#fff' : '#666',
              }}
            >
              全部 ({dishesByCategory['all']?.length || 0})
            </Tag>
            {categories.map((cat) => (
              <Tag
                key={cat._id}
                onClick={() => setActiveCategory(cat._id)}
                style={{
                  flexShrink: 0, cursor: 'pointer', borderRadius: 20, padding: '4px 14px', fontWeight: 500, fontSize: 13,
                  border: activeCategory === cat._id ? '1px solid #2e7d5e' : '1px solid #ddd',
                  background: activeCategory === cat._id ? '#2e7d5e' : '#fff',
                  color: activeCategory === cat._id ? '#fff' : '#666',
                }}
              >
                {cat.name} ({dishesByCategory[cat._id]?.length || 0})
              </Tag>
            ))}
          </div>

          {/* 菜品卡片 */}
          {currentDishes.length === 0 ? (
            <Empty description={search ? '未找到匹配的菜品' : showMyOnly ? '你还没有添加菜品' : '暂无菜品'} />
          ) : (
            <Row gutter={[8, 8]}>
              {currentDishes.map((dish) => (
                <Col key={dish._id} xs={12}>
                  <Card
                    className="menu-card"
                    hoverable
                    cover={
                      <img
                        src={dish.image ? IMG_BASE + dish.image : NO_IMAGE}
                        alt={dish.name}
                        style={{ height: 100, objectFit: 'cover' }}
                        onError={(e) => { e.target.src = NO_IMAGE; }}
                      />
                    }
                    styles={{ body: { padding: '6px 8px' } }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Title level={5} style={{ margin: 0, fontSize: 12, flex: 1, lineHeight: 1.3 }}>
                        {dish.name}
                      </Title>
                      <Tag color="volcano" style={{ margin: '0 0 0 2px', fontWeight: 600, fontSize: 10 }}>
                        ¥{Number(dish.price).toFixed(2)}
                      </Tag>
                    </div>
                    {dish.category?.name && (
                      <Tag color="green" style={{ fontSize: 9, padding: '0 3px', marginTop: 4 }}>
                        {dish.category.name}
                      </Tag>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </>
      ) : (
        /* ====== 桌面端：左侧分类 + 右侧菜品 ====== */
        <div style={{ display: 'flex', gap: 16, minHeight: 'calc(100vh - 240px)' }}>
          {/* 左侧分类列表 */}
          <div style={{
            width: 190, flexShrink: 0, background: '#fff', borderRadius: 12,
            padding: '12px 0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            alignSelf: 'flex-start', position: 'sticky', top: 80,
          }}>
            {/* "全部"选项 */}
            <div
              onClick={() => setActiveCategory('all')}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                color: activeCategory === 'all' ? '#2e7d5e' : '#555',
                background: activeCategory === 'all' ? '#e8f5e9' : 'transparent',
                borderRight: activeCategory === 'all' ? '3px solid #2e7d5e' : '3px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <span>🍽️ 全部菜品</span>
              <Tag style={{ fontSize: 10, margin: 0, borderRadius: 10, padding: '0 6px' }}>
                {dishesByCategory['all']?.length || 0}
              </Tag>
            </div>
            {/* 分隔线 */}
            <div style={{ height: 1, background: '#f0f0f0', margin: '4px 12px' }} />
            {/* 各分类 */}
            {categories.map((cat) => (
              <div
                key={cat._id}
                onClick={() => setActiveCategory(cat._id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 16px', cursor: 'pointer', fontSize: 14,
                  color: activeCategory === cat._id ? '#2e7d5e' : '#555',
                  background: activeCategory === cat._id ? '#e8f5e9' : 'transparent',
                  borderRight: activeCategory === cat._id ? '3px solid #2e7d5e' : '3px solid transparent',
                  fontWeight: activeCategory === cat._id ? 500 : 400,
                  transition: 'all 0.15s',
                }}
              >
                <span>{cat.name}</span>
                <Tag style={{ fontSize: 10, margin: 0, borderRadius: 10, padding: '0 6px' }}>
                  {dishesByCategory[cat._id]?.length || 0}
                </Tag>
              </div>
            ))}
          </div>

          {/* 右侧菜品内容 */}
          <div style={{ flex: 1 }}>
            {/* 当前分类标题 */}
            <div style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 12, color: '#999' }}>
                {'「'} {activeCategory === 'all' ? '全部菜品' : categories.find(c => c._id === activeCategory)?.name} {'」'}
                · {currentDishes.length} 道
              </Text>
            </div>

            {currentDishes.length === 0 ? (
              <Empty description={search ? '未找到匹配的菜品' : showMyOnly ? '你还没有添加菜品' : '暂无菜品'} />
            ) : (
              <Row gutter={[12, 12]}>
                {currentDishes.map((dish) => (
                  <Col key={dish._id} md={8} lg={6}>
                    <Card
                      className="menu-card"
                      hoverable
                      cover={
                        <img
                          src={dish.image ? IMG_BASE + dish.image : NO_IMAGE}
                          alt={dish.name}
                          style={{ height: 120, objectFit: 'cover' }}
                          onError={(e) => { e.target.src = NO_IMAGE; }}
                        />
                      }
                      styles={{ body: { padding: '8px 10px' } }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Title level={5} style={{ margin: 0, fontSize: 14, flex: 1, lineHeight: 1.3 }}>
                          {dish.name}
                        </Title>
                        <Tag color="volcano" style={{ margin: '0 0 0 4px', fontWeight: 600, fontSize: 12 }}>
                          ¥{Number(dish.price).toFixed(2)}
                        </Tag>
                      </div>
                      {dish.description && (
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{ color: '#888', fontSize: 11, marginTop: 6, marginBottom: 0 }}
                        >
                          {dish.description}
                        </Paragraph>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                        {dish.category?.name && (
                          <Tag color="green" style={{ fontSize: 10, padding: '0 3px' }}>
                            {dish.category.name}
                          </Tag>
                        )}
                        {dish.owner?.nickname && (
                          <Text style={{ fontSize: 10, color: '#999' }}>
                            {dish.owner.nickname}
                          </Text>
                        )}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
