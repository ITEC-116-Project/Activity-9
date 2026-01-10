import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI } from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await ordersAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>👋 Welcome back, {user?.name}!</h1>
        <p>Here's what's happening with your store today.</p>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="quick-stat">
              <span className="stat-icon">💰</span>
              <div className="stat-info">
                <span className="stat-number">₱{analytics?.totalRevenue?.toFixed(2) || '0.00'}</span>
                <span className="stat-label">Total Revenue</span>
              </div>
            </div>
            <div className="quick-stat">
              <span className="stat-icon">📦</span>
              <div className="stat-info">
                <span className="stat-number">{analytics?.totalOrders || 0}</span>
                <span className="stat-label">Total Orders</span>
              </div>
            </div>
            <div className="quick-stat">
              <span className="stat-icon">⏳</span>
              <div className="stat-info">
                <span className="stat-number">{analytics?.pendingOrders || 0}</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
            <div className="quick-stat">
              <span className="stat-icon">🏷️</span>
              <div className="stat-info">
                <span className="stat-number">{analytics?.totalProducts || 0}</span>
                <span className="stat-label">Products</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <Link to="/admin/products/new" className="action-btn">
                <span>➕</span> Add Product
              </Link>
              <Link to="/admin/orders" className="action-btn">
                <span>📋</span> View Orders
              </Link>
              <Link to="/admin/analytics" className="action-btn">
                <span>📈</span> View Analytics
              </Link>
            </div>
          </div>

          {/* Alerts */}
          {analytics?.lowStockProducts > 0 && (
            <div className="dashboard-alert">
              <span>⚠️</span>
              <span>{analytics.lowStockProducts} product(s) are running low on stock!</span>
              <Link to="/admin/products">View Products</Link>
            </div>
          )}

          {/* Recent Orders */}
          <div className="recent-section">
            <div className="section-header">
              <h3>Recent Orders</h3>
              <Link to="/admin/orders">View All</Link>
            </div>
            <div className="recent-list">
              {analytics?.recentOrders?.slice(0, 4).map((order) => (
                <div key={order.id} className="recent-item">
                  <div className="order-info">
                    <span className="order-id">{order.order_number}</span>
                    <span className="customer">{order.user?.name}</span>
                  </div>
                  <div className="order-meta">
                    <span className="amount">₱{Number(order.total_amount).toFixed(2)}</span>
                    <span className={`status-badge status-${order.status}`}>{order.status}</span>
                  </div>
                </div>
              ))}
              {(!analytics?.recentOrders || analytics.recentOrders.length === 0) && (
                <p className="no-data">No orders yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
