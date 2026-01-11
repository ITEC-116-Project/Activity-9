import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, cartAPI, BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import StarRating from '../components/StarRating';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasRated, setHasRated] = useState(false);
  const [canRate, setCanRate] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    // Check if user can rate this product (has delivered order)
    if (user && user.role !== 'admin') {
      checkCanRate();
    }
  }, [user, id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getOne(id);
      setProduct(response.data);
    } catch (err) {
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const checkCanRate = async () => {
    try {
      const response = await productsAPI.canRate(id, user.id);
      setCanRate(response.data.canRate);
      setHasRated(response.data.hasRated || false);
    } catch (err) {
      setCanRate(false);
      setHasRated(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  const handleAddToCart = async () => {
    if (!user) {
      toast.warning('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (isAdmin) {
      toast.warning('Admin accounts cannot add items to cart');
      return;
    }

    try {
      await cartAPI.addToCart({
        user_id: user.id,
        product_id: product.id,
        quantity: quantity,
      });
      toast.success(`Added ${quantity} ${product.name} to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleRate = async (rating) => {
    if (!user) {
      toast.warning('Please login to rate products');
      return;
    }

    if (hasRated) {
      toast.warning('You have already rated this product');
      return;
    }

    if (!canRate) {
      toast.warning('You can only rate products from delivered orders');
      return;
    }

    setRatingLoading(true);
    try {
      const response = await productsAPI.rateProduct(id, rating, user.id);
      setProduct(response.data.product);
      setHasRated(true);
      setCanRate(false);
      toast.success('Thank you for your rating!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  
  if (error) {
    return (
      <div className="product-detail-page">
        <div className="error-box">
          <span className="error-icon">⚠</span>
          <span>{error}</span>
        </div>
        <button className="back-btn" onClick={() => navigate('/products')}>← Back to Products</button>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="error-box">
          <span className="error-icon">⚠</span>
          <span>Product not found</span>
        </div>
        <button className="back-btn" onClick={() => navigate('/products')}>← Back to Products</button>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back to Products</button>
      
      <div className="product-detail">
        <div className="product-image">
          {product.image_url ? (
            <img src={product.image_url.startsWith('http') ? product.image_url : `${BASE_URL}${product.image_url}`} alt={product.name} />
          ) : (
            <div className="no-image">No Image Available</div>
          )}
        </div>
        
        <div className="product-info">
          <span className="category-badge">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="product-rating">
            <StarRating 
              rating={product.rating || 0} 
              totalRatings={product.rating_count || 0}
              size="large"
            />
          </div>
          <p className="price">₱{Number(product.price).toFixed(2)}</p>
          <p className="description">{product.description}</p>
          <p className={`stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 ? `In Stock: ${product.stock} units` : 'Out of Stock'}
          </p>
          
          {product.stock > 0 && !isAdmin && (
            <div className="add-to-cart">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
              <button className="btn-primary" onClick={handleAddToCart}>Add to Cart</button>
            </div>
          )}

          {isAdmin && (
            <div className="admin-notice">
              <span className="admin-badge">👤 Admin View</span>
              <p>Admin accounts cannot add items to cart.</p>
            </div>
          )}

          {/* Rating Section - Only for customers who can rate (have delivered order) */}
          {user && !isAdmin && !hasRated && canRate && (
            <div className="rate-product">
              <h4>Rate this product:</h4>
              <StarRating 
                editable={!ratingLoading}
                onRate={handleRate}
                size="large"
              />
            </div>
          )}

          {hasRated && (
            <div className="rated-notice">
              ✓ You have rated this product
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
