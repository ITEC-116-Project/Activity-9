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
  
  // Review states
  const [reviews, setReviews] = useState([]);
  const [ratingBreakdown, setRatingBreakdown] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [ratingFilter, setRatingFilter] = useState(null);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    fetchRatingBreakdown();
  }, [id]);

  useEffect(() => {
    // Check if user can rate this product (has delivered order)
    if (user && user.role !== 'admin') {
      checkCanRate();
    }
  }, [user, id]);

  useEffect(() => {
    fetchReviews(ratingFilter);
  }, [ratingFilter]);

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

  const fetchReviews = async (filter = null) => {
    try {
      const response = await productsAPI.getReviews(id, filter);
      setReviews(response.data);
    } catch (err) {
      console.error('Failed to fetch reviews');
    }
  };

  const fetchRatingBreakdown = async () => {
    try {
      const response = await productsAPI.getRatingBreakdown(id);
      setRatingBreakdown(response.data);
    } catch (err) {
      console.error('Failed to fetch rating breakdown');
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

    setSelectedRating(rating);
  };

  const handleSubmitReview = async () => {
    if (selectedRating === 0) {
      toast.warning('Please select a rating');
      return;
    }

    setRatingLoading(true);
    try {
      const response = await productsAPI.rateProduct(id, selectedRating, user.id, reviewText);
      setProduct(response.data.product);
      setHasRated(true);
      setCanRate(false);
      setSelectedRating(0);
      setReviewText('');
      toast.success('Thank you for your review!');
      // Refresh reviews and breakdown
      fetchReviews(ratingFilter);
      fetchRatingBreakdown();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setRatingLoading(false);
    }
  };

  const getTotalReviews = () => {
    return Object.values(ratingBreakdown).reduce((a, b) => a + b, 0);
  };

  const getPercentage = (count) => {
    const total = getTotalReviews();
    return total > 0 ? Math.round((count / total) * 100) : 0;
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
              <h4>Rate & Review this product:</h4>
              <StarRating 
                rating={selectedRating}
                editable={!ratingLoading}
                onRate={handleRate}
                size="large"
              />
              {selectedRating > 0 && (
                <div className="review-form">
                  <textarea
                    placeholder="Write your review (optional)..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={3}
                    disabled={ratingLoading}
                  />
                  <button 
                    className="btn-primary submit-review-btn" 
                    onClick={handleSubmitReview}
                    disabled={ratingLoading}
                  >
                    {ratingLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              )}
            </div>
          )}

          {hasRated && (
            <div className="rated-notice">
              ✓ You have rated this product
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2>Customer Reviews</h2>
        
        <div className="reviews-header">
          <div className="rating-summary">
            <div className="average-rating">
              <span className="big-rating">{product.rating || 0}</span>
              <div className="rating-info">
                <StarRating rating={product.rating || 0} size="medium" />
                <span className="total-reviews">{getTotalReviews()} reviews</span>
              </div>
            </div>
            
            <div className="rating-breakdown">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div 
                  key={stars} 
                  className={`breakdown-row ${ratingFilter === stars ? 'active' : ''}`}
                  onClick={() => setRatingFilter(ratingFilter === stars ? null : stars)}
                >
                  <span className="stars-label">{stars} ⭐</span>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${getPercentage(ratingBreakdown[stars])}%` }}
                    />
                  </div>
                  <span className="count">({ratingBreakdown[stars]})</span>
                </div>
              ))}
            </div>
          </div>

          {ratingFilter && (
            <div className="filter-notice">
              Showing {ratingFilter}-star reviews 
              <button onClick={() => setRatingFilter(null)}>Clear filter</button>
            </div>
          )}
        </div>

        <div className="reviews-list">
          {reviews.length === 0 ? (
            <div className="no-reviews">
              {ratingFilter 
                ? `No ${ratingFilter}-star reviews yet.`
                : 'No reviews yet. Be the first to review this product!'}
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <span className="reviewer-avatar">👤</span>
                    <span className="reviewer-name">{review.user.name}</span>
                  </div>
                  <div className="review-meta">
                    <StarRating rating={review.rating} size="small" />
                    <span className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {review.review && (
                  <p className="review-text">{review.review}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
