import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import PasswordInput from '../components/PasswordInput';
import vmanLogo from '../assets/vman_logo_colored.png';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      login(response.data.user);
      toast.success(`Welcome back, ${response.data.user.name}!`);
      
      // Redirect based on role
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/products');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid email or password';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-brand">
        <img src={vmanLogo} alt="FiveMan" className="login-logo" />
        <h1 className="login-brand-name">FiveMan</h1>
        <p className="login-tagline">
          Your premier destination for laptops, mobile phones,<br />
          pre-built PCs, and computer peripherals in the Philippines.
        </p>
      </div>
      
      <div className="login-form-container">
        <h2>Log In</h2>
        
        {error && (
          <div className="error-box">
            <span className="error-icon">⚠</span>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className={error ? 'input-error' : ''}
              required
            />
          </div>
          
          <div className="form-group">
            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className={error ? 'input-error' : ''}
              required
            />
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'LOGGING IN...' : 'LOG IN'}
          </button>
        </form>
        
        <p className="register-link">
          New to FiveMan? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
