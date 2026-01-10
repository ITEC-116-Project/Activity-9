import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import PasswordInput from '../components/PasswordInput';
import './RegisterPage.css';

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
      <h1>Create Account</h1>
      
      {error && (
        <div className="error-box">
          <span className="error-icon">⚠</span>
          <span>{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Password</label>
          <PasswordInput
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a strong password"
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
          <label>Confirm Password</label>
          <PasswordInput
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />
        </div>

        <div className="form-group">
          <label>Phone (optional)</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+63 9XX XXX XXXX"
          />
        </div>

        <div className="form-group">
          <label>Address (optional)</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter your shipping address"
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
      
      <p className="login-link">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
