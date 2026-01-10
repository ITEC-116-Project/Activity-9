import { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import './AdminAnalytics.css';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading analytics...</div>;
  if (error) return <div className="error-box"><span className="error-icon">⚠</span>{error}</div>;

  const statusLabels = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return (
    <div className="admin-analytics">
      <div className="page-header">
        <h1>📈 Analytics & Reports</h1>
        <p>Overview of your store performance</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <span className="stat-value">₱{analytics?.totalRevenue?.toFixed(2) || '0.00'}</span>
            <span className="stat-label">Total Revenue</span>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <span className="stat-value">{analytics?.totalOrders || 0}</span>
            <span className="stat-label">Total Orders</span>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <span className="stat-value">{analytics?.pendingOrders || 0}</span>
            <span className="stat-label">Pending Orders</span>
          </div>
        </div>

        <div className="stat-card products">
          <div className="stat-icon">🏷️</div>
          <div className="stat-content">
            <span className="stat-value">{analytics?.totalProducts || 0}</span>
            <span className="stat-label">Total Products</span>
          </div>
        </div>
      </div>

      {/* Alert Card */}
      {analytics?.lowStockProducts > 0 && (
        <div className="alert-card">
          <span className="alert-icon">⚠️</span>
          <span>{analytics.lowStockProducts} product(s) are running low on stock (less than 10 units)</span>
        </div>
      )}

      <div className="analytics-grid">
        {/* Orders by Status */}
        <div className="analytics-card">
          <h3>Orders by Status</h3>
          <div className="status-list">
            {analytics?.ordersCount?.map((item) => (
              <div key={item.status} className="status-row">
                <span className={`status-badge status-${item.status}`}>
                  {statusLabels[item.status] || item.status}
                </span>
                <span className="status-count">{item.count}</span>
              </div>
            ))}
            {(!analytics?.ordersCount || analytics.ordersCount.length === 0) && (
              <p className="no-data">No orders yet</p>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="analytics-card">
          <h3>Top Selling Products</h3>
          <div className="top-products-list">
            {analytics?.topProducts?.map((product, index) => (
              <div key={product.product_id} className="top-product-row">
                <span className="rank">#{index + 1}</span>
                <span className="product-name">{product.name}</span>
                <span className="sold-count">{product.total_sold} sold</span>
              </div>
            ))}
            {(!analytics?.topProducts || analytics.topProducts.length === 0) && (
              <p className="no-data">No sales data yet</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="analytics-card wide">
          <h3>Recent Orders</h3>
          <div className="recent-orders-list">
            {analytics?.recentOrders?.map((order) => (
              <div key={order.id} className="recent-order-row">
                <span className="order-number">{order.order_number}</span>
                <span className="customer-name">{order.user?.name || 'Customer'}</span>
                <span className="order-amount">₱{Number(order.total_amount).toFixed(2)}</span>
                <span className={`status-badge status-${order.status}`}>
                  {statusLabels[order.status]}
                </span>
              </div>
            ))}
            {(!analytics?.recentOrders || analytics.recentOrders.length === 0) && (
              <p className="no-data">No recent orders</p>
            )}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="analytics-card wide">
          <h3>Monthly Revenue (Last 6 Months)</h3>
          <div className="monthly-revenue">
            {analytics?.monthlyRevenue?.length > 0 ? (
              <div className="revenue-bars">
                {analytics.monthlyRevenue.map((item) => (
                  <div key={item.month} className="revenue-bar-container">
                    <div 
                      className="revenue-bar" 
                      style={{ 
                        height: `${Math.max(20, (Number(item.revenue) / Math.max(...analytics.monthlyRevenue.map(r => Number(r.revenue)))) * 100)}%` 
                      }}
                    >
                      <span className="bar-value">${Number(item.revenue).toFixed(0)}</span>
                    </div>
                    <span className="bar-label">{item.month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No revenue data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
