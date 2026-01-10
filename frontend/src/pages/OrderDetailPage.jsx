import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import './OrderDetailPage.css';

const BASE_URL = 'http://localhost:3000';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getOrder(id);
      setOrder(response.data);
    } catch (err) {
      setError('Order not found');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await ordersAPI.cancelOrder(id);
      toast.success('Order cancelled successfully');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${BASE_URL}${imageUrl}`;
  };

  if (loading) return <div className="loading">Loading...</div>;
  
  if (error || !order) {
    return (
      <div className="order-detail-page">
        <button className="back-btn" onClick={() => navigate('/orders')}>← Back to Orders</button>
        <div className="error-box">
          <span className="error-icon">⚠</span>
          <span>{error || 'Order not found'}</span>
        </div>
      </div>
    );
  }

  const canCancel = ['pending', 'processing'].includes(order.status);

  return (
    <div className="order-detail-page">
      <button className="back-btn" onClick={() => navigate('/orders')}>← Back to Orders</button>
      
      <div className="order-detail">
        <div className="order-header">
          <div className="order-title">
            <h1>Order #{order.order_number}</h1>
            <span className={`status-badge status-${order.status}`}>
              {order.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="order-info-grid">
          <div className="info-card">
            <h3>Order Details</h3>
            <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
            <p><strong>Payment:</strong> {order.payment_method.toUpperCase()}</p>
          </div>
          <div className="info-card">
            <h3>Shipping Address</h3>
            <p>{order.shipping_address}</p>
          </div>
        </div>

        <div className="order-items">
          <h2>Order Items</h2>
          <div className="items-list">
            {order.order_items?.map((item) => (
              <div key={item.id} className="order-item">
                <div className="item-image">
                  {item.product?.image_url ? (
                    <img 
                      src={getImageUrl(item.product.image_url)} 
                      alt={item.product?.name || 'Product'} 
                    />
                  ) : (
                    <div className="no-image">📷</div>
                  )}
                </div>
                <span className="item-name">{item.product?.name || 'Product'}</span>
                <span className="item-qty">Qty: {item.quantity}</span>
                <span className="item-price">₱{Number(item.price).toFixed(2)} each</span>
                <span className="item-subtotal">₱{(Number(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="order-total">
          <span>Total Amount</span>
          <span className="total-price">₱{Number(order.total_amount).toFixed(2)}</span>
        </div>

        {canCancel && (
          <button onClick={handleCancelOrder} className="btn-cancel">
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderDetailPage;
