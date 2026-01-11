import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI, BASE_URL } from '../../services/api';
import { useToast } from '../../components/Toast';
import './ProductForm.css';

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

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getOne(id);
      const product = response.data;
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock,
        category: product.category || '',
      });
      if (product.image_url) {
        setExistingImage(product.image_url);
      }
    } catch (err) {
      setError('Product not found');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setExistingImage(null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', Number(formData.price));
      data.append('stock', Number(formData.stock));
      data.append('category', formData.category);
      
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (isEditing) {
        await productsAPI.update(id, data);
        toast.success('Product updated successfully');
      } else {
        await productsAPI.create(data);
        toast.success('Product created successfully');
      }
      
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = () => {
    if (imagePreview) return imagePreview;
    if (existingImage) {
      return existingImage.startsWith('http') ? existingImage : `${BASE_URL}${existingImage}`;
    }
    return null;
  };

  return (
    <div className="product-form-page">
      <div className="page-header">
        <h1>{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
      </div>
      
      {error && (
        <div className="error-box">
          <span className="error-icon">⚠</span>
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label>Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
            rows={4}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Stock Quantity</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
              required
              min="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Product Image</label>
          <div className="image-upload-container">
            {getImageUrl() ? (
              <div className="image-preview">
                <img src={getImageUrl()} alt="Product preview" />
                <button type="button" className="btn-remove-image" onClick={handleRemoveImage}>
                  ✕ Remove
                </button>
              </div>
            ) : (
              <div className="upload-placeholder">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  id="image-upload"
                  className="file-input"
                />
                <label htmlFor="image-upload" className="upload-label">
                  <span className="upload-icon">📷</span>
                  <span>Click to upload image</span>
                  <span className="upload-hint">JPG, PNG, GIF, WEBP (max 5MB)</span>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/products')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
