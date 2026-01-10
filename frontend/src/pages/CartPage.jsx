import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import './CartPage.css';

const CartPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await cartAPI.getCart(user.id);
      setCart(response.data);
      // Select all items by default
      setSelectedItems(response.data.items.map(item => item.id));
    } catch (err) {
      setError('Failed to load cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartId, quantity) => {
    try {
      await cartAPI.updateCartItem(cartId, quantity);
      toast.success('Cart updated');
      fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (cartId) => {
    try {
      await cartAPI.removeFromCart(cartId);
      toast.success('Item removed from cart');
      setSelectedItems(prev => prev.filter(id => id !== cartId));
      fetchCart();
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cart.items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.items.map(item => item.id));
    }
  };

  const getSelectedTotal = () => {
    return cart.items
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.warning('Please select at least one item to checkout');
      return;
    }
    // Store selected items in sessionStorage for checkout
    sessionStorage.setItem('checkoutItems', JSON.stringify(selectedItems));
    navigate('/checkout');
  };

  if (!user) {
    return (
      <div className="cart-page">
        <div className="page-header">
          <h1>Shopping Cart</h1>
        </div>
        <div className="empty-cart">
          <p>Please login to view your cart</p>
          <button className="btn-primary" onClick={() => navigate('/login')}>Login</button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading cart...</div>;

  const selectedTotal = getSelectedTotal();
  const selectedCount = selectedItems.length;

  return (
    <div className="cart-page">
      <div className="page-header">
        <h1>Shopping Cart</h1>
      </div>
      
      {error && (
        <div className="error-box">
          <span className="error-icon">⚠</span>
          <span>{error}</span>
        </div>
      )}
      
      {cart.items.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button className="btn-primary" onClick={() => navigate('/products')}>Browse Products</button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            <div className="cart-header">
              <label className="select-all">
                <input
                  type="checkbox"
                  checked={selectedItems.length === cart.items.length}
                  onChange={handleSelectAll}
                />
                <span>Select All ({cart.items.length} items)</span>
              </label>
            </div>
            {cart.items.map((item) => (
              <div key={item.id} className={`cart-item ${selectedItems.includes(item.id) ? 'selected' : ''}`}>
                <div className="item-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                  />
                </div>
                
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
                
                <div className="item-info">
                  <h3>{item.product.name}</h3>
                  <p className="unit-price">₱{Number(item.product.price).toFixed(2)} each</p>
                </div>
                
                <div className="item-quantity">
                  <label>Qty:</label>
                  <input
                    type="number"
                    min="1"
                    max={item.product.stock}
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item.id, Number(e.target.value))}
                  />
                </div>
                
                <div className="item-subtotal">
                  <span className="subtotal-label">Subtotal</span>
                  <span className="subtotal-price">₱{(Number(item.product.price) * item.quantity).toFixed(2)}</span>
                </div>
                
                <button className="btn-remove" onClick={() => handleRemoveItem(item.id)}>Remove</button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Selected Items ({selectedCount})</span>
              <span>₱{selectedTotal.toFixed(2)}</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>₱{selectedTotal.toFixed(2)}</span>
            </div>
            <button 
              className="btn-checkout" 
              onClick={handleCheckout}
              disabled={selectedCount === 0}
            >
              Checkout ({selectedCount} {selectedCount === 1 ? 'item' : 'items'})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
