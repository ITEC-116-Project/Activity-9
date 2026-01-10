import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, ordersAPI, BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [selectedItems, setSelectedItems] = useState([]);
  const [formData, setFormData] = useState({
    shipping_address: user?.address || '',
    payment_method: 'cod',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      // Get selected items from sessionStorage
      const storedItems = sessionStorage.getItem('checkoutItems');
      if (storedItems) {
        setSelectedItems(JSON.parse(storedItems));
      }
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart(user.id);
      setCart(response.data);
      
      // If no items selected from cart page, redirect back
      const storedItems = sessionStorage.getItem('checkoutItems');
      if (!storedItems || response.data.items.length === 0) {
        navigate('/cart');
      }
    } catch (err) {
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  // Filter cart items to only include selected ones
  const checkoutItems = cart.items.filter(item => selectedItems.includes(item.id));
  const checkoutTotal = checkoutItems.reduce(
    (sum, item) => sum + (Number(item.product.price) * item.quantity), 
    0
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const orderData = {
        user_id: user.id,
        shipping_address: formData.shipping_address,
        payment_method: formData.payment_method,
        selected_cart_ids: selectedItems, // Pass selected items to backend
      };

      const response = await ordersAPI.create(orderData);
      // Clear selected items from sessionStorage
      sessionStorage.removeItem('checkoutItems');
      toast.success('Order placed successfully!');
      navigate(`/orders/${response.data.order.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="checkout-page">
      <div className="page-header">
        <h1>Checkout</h1>
      </div>
      
      {error && (
        <div className="error-box">
          <span className="error-icon">⚠</span>
          <span>{error}</span>
        </div>
      )}
      
      <div className="checkout-container">
        <div className="order-summary">
          <h2>Order Summary ({checkoutItems.length} items)</h2>
          <div className="summary-items">
            {checkoutItems.map((item) => (
              <div key={item.id} className="summary-item">
                <div className="item-image">
                  {item.product.image_url ? (
                    <img 
                      src={item.product.image_url.startsWith('http') ? item.product.image_url : `${BASE_URL}${item.product.image_url}`} 
                      alt={item.product.name} 
                    />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>
                <div className="item-details">
                  <span className="item-name">{item.product.name}</span>
                  <span className="item-qty">x {item.quantity}</span>
                </div>
                <span className="item-price">₱{(Number(item.product.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>₱{checkoutTotal.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <h2>Shipping Details</h2>
          <div className="form-group">
            <label>Shipping Address</label>
            <textarea
              name="shipping_address"
              value={formData.shipping_address}
              onChange={handleChange}
              placeholder="Enter your complete shipping address"
              required
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
            >
              <option value="cod">Cash on Delivery (COD)</option>
              <option value="online">Online Payment</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
