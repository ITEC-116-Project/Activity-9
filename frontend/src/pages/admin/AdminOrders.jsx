import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI, BASE_URL } from '../../services/api';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmModal';
import '../../style/AdminOrders.css';

const AdminOrders = () => {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ordersAPI.getAllOrders();
      setOrders(response.data);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus, currentStatus) => {
    const statusLabels = {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };

    const confirmed = await confirm({
      title: 'Update Order Status',
      message: `Are you sure you want to change the order status from "${statusLabels[currentStatus]}" to "${statusLabels[newStatus]}"?`,
      confirmText: 'Update',
      cancelText: 'Cancel',
      type: newStatus === 'cancelled' ? 'danger' : 'warning'
    });

    if (!confirmed) return;

    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      toast.success('Order status updated');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-orders">
      <div className="page-header">
        <h1>Manage Orders</h1>
      </div>
      
      <div className="filters-container">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      {error && (
        <div className="error-box">
          <span className="error-icon">⚠</span>
          <span>{error}</span>
        </div>
      )}
      
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Products</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.filter(order => statusFilter === 'all' || order.status === statusFilter).map((order) => (
              <tr key={order.id}>
                <td className="order-number">{order.order_number}</td>
                <td>{order.user?.name || 'Unknown'}</td>
                <td className="order-products-cell">
                  <div className="order-products-images">
                    {(order.order_items || order.items)?.slice(0, 3).map((item, index) => (
                      <div key={index} className="order-product-thumb">
                        {item.product?.image_url ? (
                          <img 
                            src={item.product.image_url.startsWith('http') ? item.product.image_url : `${BASE_URL}${item.product.image_url}`}
                            alt={item.product?.name}
                            title={item.product?.name}
                          />
                        ) : (
                          <div className="no-image-small">?</div>
                        )}
                      </div>
                    ))}
                    {(order.order_items || order.items)?.length > 3 && (
                      <div className="more-products">+{(order.order_items || order.items).length - 3}</div>
                    )}
                  </div>
                </td>
                <td className="price">₱{Number(order.total_amount).toFixed(2)}</td>
                <td>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status.toUpperCase()}
                  </span>
                </td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="actions">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value, order.status)}
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
                  <Link to={`/admin/orders/${order.id}`} className="btn-view">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
