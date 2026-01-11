import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI, BASE_URL } from '../../services/api';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmModal';
import '../../style/AdminOrderDetail.css';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { confirm } = useConfirm();
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

  const handleStatusChange = async (newStatus) => {
    const statusLabels = {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };

    const confirmed = await confirm({
      title: 'Update Order Status',
      message: `Are you sure you want to change the order status from "${statusLabels[order.status]}" to "${statusLabels[newStatus]}"?`,
      confirmText: 'Update',
      cancelText: 'Cancel',
      type: newStatus === 'cancelled' ? 'danger' : 'warning'
    });

    if (!confirmed) return;

    try {
      await ordersAPI.updateStatus(id, newStatus);
      toast.success('Order status updated');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
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
      <div className="admin-order-detail">
        <button className="back-btn" onClick={() => navigate('/admin/orders')}>← Back to Orders</button>
        <div className="error-box">
          <span className="error-icon">⚠</span>
          <span>{error || 'Order not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-order-detail">
      <button className="back-btn" onClick={() => navigate('/admin/orders')}>
        <span className="back-icon">←</span>
        <span>Back to Orders</span>
      </button>
      
      <div className="order-detail-card">
        <div className="order-header">
          <div className="order-title">
            <h1>Order #{order.order_number}</h1>
            <span className={`status-badge status-${order.status}`}>
              {order.status.toUpperCase()}
            </span>
          </div>
          <div className="status-control">
            <label>Update Status:</label>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={order.status === 'cancelled' || order.status === 'delivered'}
              className="status-select"
            >
              {order.status === 'pending' && (
                <>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
              {order.status === 'processing' && (
                <>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
              {order.status === 'shipped' && (
                <>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </>
              )}
              {order.status === 'delivered' && (
                <option value="delivered">Delivered</option>
              )}
              {order.status === 'cancelled' && (
                <option value="cancelled">Cancelled</option>
              )}
            </select>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="status-timeline">
          <div className={`timeline-step ${order.status !== 'cancelled' ? 'completed' : ''}`}>
            <div className="step-icon">📋</div>
            <div className="step-info">
              <span className="step-label">Order Placed</span>
              <span className="step-date">{new Date(order.created_at).toLocaleString()}</span>
            </div>
          </div>
          <div className={`timeline-step ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
            <div className="step-icon">⚙️</div>
            <div className="step-info">
              <span className="step-label">Processing</span>
              <span className="step-date">{order.processed_at ? new Date(order.processed_at).toLocaleString() : '-'}</span>
            </div>
          </div>
          <div className={`timeline-step ${['shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
            <div className="step-icon">🚚</div>
            <div className="step-info">
              <span className="step-label">Shipped</span>
              <span className="step-date">{order.shipped_at ? new Date(order.shipped_at).toLocaleString() : '-'}</span>
            </div>
          </div>
          <div className={`timeline-step ${order.status === 'delivered' ? 'completed' : ''} ${order.status === 'cancelled' ? 'cancelled' : ''}`}>
            <div className="step-icon">{order.status === 'cancelled' ? '❌' : '✅'}</div>
            <div className="step-info">
              <span className="step-label">{order.status === 'cancelled' ? 'Cancelled' : 'Delivered'}</span>
              <span className="step-date">
                {order.status === 'cancelled' && order.cancelled_at ? new Date(order.cancelled_at).toLocaleString() : 
                 order.status === 'delivered' && order.delivered_at ? new Date(order.delivered_at).toLocaleString() : '-'}
              </span>
            </div>
          </div>
        </div>

        <div className="order-info-grid">
          <div className="info-card">
            <h3>📋 Order Details</h3>
            <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
            <p><strong>Payment:</strong> {order.payment_method?.toUpperCase() || 'N/A'}</p>
            <p><strong>Items:</strong> {order.order_items?.length || 0} product(s)</p>
          </div>
          <div className="info-card">
            <h3>👤 Customer Info</h3>
            <p><strong>Name:</strong> {order.user?.name || 'Unknown'}</p>
            <p><strong>Email:</strong> {order.user?.email || 'N/A'}</p>
            <p><strong>Phone:</strong> {order.user?.phone || 'N/A'}</p>
          </div>
          <div className="info-card full-width">
            <h3>📍 Shipping Address</h3>
            <p>{order.shipping_address || 'No address provided'}</p>
          </div>
        </div>

        <div className="order-items-section">
          <h2>Order Items</h2>
          <div className="items-table">
            <div className="items-header">
              <span className="col-image">Image</span>
              <span className="col-product">Product</span>
              <span className="col-price">Price</span>
              <span className="col-qty">Qty</span>
              <span className="col-subtotal">Subtotal</span>
            </div>
            {order.order_items?.map((item) => (
              <div key={item.id} className="item-row">
                <div className="col-image">
                  {item.product?.image_url ? (
                    <img 
                      src={getImageUrl(item.product.image_url)} 
                      alt={item.product?.name || 'Product'} 
                      className="item-image"
                    />
                  ) : (
                    <div className="no-image">📷</div>
                  )}
                </div>
                <span className="col-product">{item.product?.name || 'Product'}</span>
                <span className="col-price">₱{Number(item.price).toFixed(2)}</span>
                <span className="col-qty">{item.quantity}</span>
                <span className="col-subtotal">₱{(Number(item.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="order-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₱{Number(order.total_amount).toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₱{Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
