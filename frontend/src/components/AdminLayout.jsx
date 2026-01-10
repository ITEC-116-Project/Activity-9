import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-icon">🛒</span>
          <span className="sidebar-title">Admin Panel</span>
        </div>
        
        <nav className="sidebar-nav">
          <NavLink to="/admin" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/admin/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📋</span>
            <span>View Orders</span>
          </NavLink>
          
          <NavLink to="/admin/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📈</span>
            <span>Analytics</span>
          </NavLink>
          
          <NavLink to="/admin/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📦</span>
            <span>Products</span>
          </NavLink>
          
          <NavLink to="/admin/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">⚙️</span>
            <span>Account Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-info">
            <span className="admin-avatar">👤</span>
            <div className="admin-details">
              <span className="admin-name">{user?.name}</span>
              <span className="admin-role">Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="admin-main">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
