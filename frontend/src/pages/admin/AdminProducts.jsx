import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, BASE_URL } from '../../services/api';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmModal';
import './AdminProducts.css';

const AdminProducts = () => {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, productName) => {
    const confirmed = await confirm({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'
    });

    if (!confirmed) return;

    try {
      await productsAPI.delete(id);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-products">
      <div className="page-header">
        <h1>Manage Products</h1>
        <Link to="/admin/products/new" className="btn-primary">+ Add New Product</Link>
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
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="product-image-cell">
                  {product.image_url ? (
                    <img 
                      src={product.image_url.startsWith('http') ? product.image_url : `${BASE_URL}${product.image_url}`} 
                      alt={product.name}
                      className="table-product-image"
                    />
                  ) : (
                    <div className="no-image-placeholder">No Image</div>
                  )}
                </td>
                <td>{product.name}</td>
                <td className="price">₱{Number(product.price).toFixed(2)}</td>
                <td className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>{product.stock}</td>
                <td>{product.category || '-'}</td>
                <td className="actions">
                  <Link to={`/admin/products/${product.id}/edit`} className="btn-edit">Edit</Link>
                  <button onClick={() => handleDelete(product.id, product.name)} className="btn-delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
