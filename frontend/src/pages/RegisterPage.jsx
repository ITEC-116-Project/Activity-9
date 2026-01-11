import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import PasswordInput from '../components/PasswordInput';
import vmanLogo from '../assets/vman_logo_colored.png';
import '../style/RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('63')) {
      return `+${digits}`;
    } else if (digits.startsWith('0')) {
      return `+63${digits.slice(1)}`;
    } else if (digits.length > 0) {
      return `+63${digits}`;
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      if (value.length > formData.phone.length) {
        setFormData({ ...formData, [name]: formatPhoneNumber(value) });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    if (error) setError('');
  };

  const validatePassword = () => {
    const errors = [];
    const password = formData.password;
    
    if (password.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('one number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('one special character');
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password policy
    const passwordErrors = validatePassword();
    if (passwordErrors.length > 0) {
      setError(`Password must contain: ${passwordErrors.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
      });
      login(response.data.user);
      toast.success('Account created successfully! Welcome!');
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-brand">
        <img src={vmanLogo} alt="FiveMan" className="register-logo" />
        <h1 className="register-brand-name">FiveMan</h1>
        <p className="register-tagline">
          Your premier destination for laptops, mobile phones,<br />
          pre-built PCs, and computer peripherals in the Philippines.
        </p>
      </div>
      
      <div className="register-form-container">
        <h2>Create Account</h2>
        
        {error && (
          <div className="error-box">
            <span className="error-icon">⚠</span>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
          </div>
          
          <div className="form-group">
            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
            <div className="password-hints">
              <span className={formData.password.length >= 8 ? 'met' : ''}>8+ chars</span>
              <span className={/[A-Z]/.test(formData.password) ? 'met' : ''}>Uppercase</span>
              <span className={/[a-z]/.test(formData.password) ? 'met' : ''}>Lowercase</span>
              <span className={/[0-9]/.test(formData.password) ? 'met' : ''}>Number</span>
              <span className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'met' : ''}>Special</span>
            </div>
          </div>

          <div className="form-group">
            <PasswordInput
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone (optional)"
            />
          </div>

          <div className="form-group">
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Shipping Address (optional)"
            />
          </div>
          
          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
          </button>
        </form>
        
        <p className="login-link">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
