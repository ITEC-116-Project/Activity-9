import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI, cartAPI, BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import StarRating from '../components/StarRating';
import './ProductsPage.css';

const PRODUCT_CATEGORIES = [
  'Laptops',
  'Mobile Phones',
  'Tablets',
  'Pre-Built PCs',
  'Custom PC Builds',
  'Processors (CPU)',
  'Graphics Cards (GPU)',
  'Motherboards',
  'RAM & Memory',
  'Storage (SSD/HDD)',
  'Power Supplies',
  'PC Cases',
  'Cooling & Fans',
  'Monitors',
  'Keyboards',
  'Mouse & Mousepads',
  'Headsets & Audio',
  'Webcams & Microphones',
  'Networking',
  'Cables & Adapters',
  'Laptop Accessories',
  'Phone Accessories',
  'Gaming Peripherals',
  'Software & OS'
];

const ProductsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (searchTerm = '', category = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await productsAPI.getAll(searchTerm, category);
      setProducts(response.data);
    } catch (err) {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(search, selectedCategory);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    fetchProducts(search, category);
  };

  const isAdmin = user?.role === 'admin';

  const handleAddToCart = async (productId) => {
    if (!user) {
      toast.warning('Please login to add items to cart');
      // Redirect to login after a short delay
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    if (isAdmin) {
      toast.warning('Admin accounts cannot add items to cart');
      return;
    }

    try {
      await cartAPI.addToCart({
        user_id: user.id,
        product_id: productId,
        quantity: 1,
      });
      toast.success('Item added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Our Products</h1>
        <p>
          {selectedCategory 
            ? `Browsing: ${selectedCategory}` 
            : 'Discover amazing products at great prices'}
        </p>
      </div>
      
      {error && (
        <div className="error-box">
          <span className="error-icon">⚠</span>
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {/* Category Pills - Horizontally Scrollable */}
      <div className="category-pills">
        <button 
          className={`category-pill ${selectedCategory === '' ? 'active' : ''}`}
          onClick={() => handleCategoryClick('')}
        >
          All Products
        </button>
        {PRODUCT_CATEGORIES.map((category) => (
          <button 
            key={category}
            className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="products-grid">
        {products.length === 0 ? (
          <div className="no-products">
            <span className="no-products-icon">📦</span>
            <p>No products available{selectedCategory ? ` in ${selectedCategory}` : ''}</p>
          </div>
        ) : (
            products.map((product) => (
              <div 
                key={product.id} 
                className="product-card clickable"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="product-image">
                  {product.image_url ? (
                    <img src={product.image_url.startsWith('http') ? product.image_url : `${BASE_URL}${product.image_url}`} alt={product.name} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <StarRating 
                    rating={product.rating || 0} 
                    totalRatings={product.rating_count || 0}
                    size="small"
                  />
                  <p className="price">₱{Number(product.price).toFixed(2)}</p>
                  <p className={`stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
                  </p>
                  <div className="product-actions">
                    {product.stock > 0 && !isAdmin && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product.id);
                        }} 
                        className="btn-primary"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    // </div>
  );
};

export default ProductsPage;
