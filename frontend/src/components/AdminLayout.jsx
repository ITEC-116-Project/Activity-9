import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../style/AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="admin-layout">
      <div className="admin-tabs-container">
        <nav className="admin-tabs">
          <NavLink to="/admin" end className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}>
            <span className="tab-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/admin/orders" className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}>
            <span className="tab-icon">📋</span>
            <span>Orders</span>
          </NavLink>
          
          <NavLink to="/admin/analytics" className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}>
            <span className="tab-icon">📈</span>
            <span>Analytics</span>
          </NavLink>
          
          <NavLink to="/admin/products" className={({ isActive }) => `admin-tab ${isActive ? 'active' : ''}`}>
            <span className="tab-icon">📦</span>
            <span>Products</span>
          </NavLink>
        </nav>
      </div>

      <div className="admin-main">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
