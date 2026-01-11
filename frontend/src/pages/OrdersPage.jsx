import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../style/OrdersPage.css';

const BASE_URL = 'http://localhost:3000';

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${BASE_URL}${imageUrl}`;
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ordersAPI.getUserOrders(user.id);
      setOrders(response.data);
    } catch (err) {
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  if (!user) {
    return (
      <div className="orders-page">
        <div className="page-header">
          <h1>My Orders</h1>
        </div>
        <div className="empty-orders">
          <p>Please login to view your orders</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>My Orders</h1>
      </div>
      
      {error && (
        <div className="error-box">
          <span className="error-icon">⚠</span>
          <span>{error}</span>
        </div>
      )}
      
      {orders.length === 0 ? (
        <div className="empty-orders">
          <p>You haven't placed any orders yet</p>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <>
          <div className="orders-filter">
            <label htmlFor="status-filter">Filter by Status:</label>
            <select 
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter-select"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="empty-orders">
              <p>No orders with status "{statusOptions.find(o => o.value === statusFilter)?.label}"</p>
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <h3>Order #{order.order_number}</h3>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  {order.order_items && order.order_items.length > 0 && (
                    <div className="order-items-preview">
                      {order.order_items.slice(0, 3).map((item) => (
                        <div key={item.id} className="preview-item">
                          <div className="preview-image">
                            {item.product?.image_url ? (
                              <img 
                                src={getImageUrl(item.product.image_url)} 
                                alt={item.product?.name || 'Product'} 
                              />
                            ) : (
                              <div className="no-image">📷</div>
                            )}
                          </div>
                          <div className="preview-info">
                            <span className="preview-name">{item.product?.name || 'Product'}</span>
                            <span className="preview-qty">x{item.quantity}</span>
                          </div>
                        </div>
                      ))}
                      {order.order_items.length > 3 && (
                        <div className="more-items">+{order.order_items.length - 3} more</div>
                      )}
                    </div>
                  )}
                  
                  <div className="order-info">
                    <div className="info-item">
                      <span className="label">Date</span>
                      <span className="value">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Total</span>
                      <span className="value price">₱{Number(order.total_amount).toFixed(2)}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Payment</span>
                      <span className="value">{order.payment_method.toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <Link to={`/orders/${order.id}`} className="btn-secondary">View Details</Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrdersPage;
