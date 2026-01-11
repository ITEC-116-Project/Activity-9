import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { useToast } from '../../components/Toast';
import PasswordInput from '../../components/PasswordInput';
import '../../style/AccountSettings.css';

const AccountSettings = () => {
  const { user, login } = useAuth();
  const toast = useToast();
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // If starts with 63, keep it, otherwise add +63
    if (digits.startsWith('63')) {
      return `+${digits}`;
    } else if (digits.startsWith('0')) {
      // Convert 09XX to +639XX
      return `+63${digits.slice(1)}`;
    } else if (digits.length > 0) {
      return `+63${digits}`;
    }
    return '';
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Only format if user is typing
      if (value.length > profileData.phone.length) {
        setProfileData({ ...profileData, [name]: formatPhoneNumber(value) });
      } else {
        setProfileData({ ...profileData, [name]: value });
      }
    } else {
      setProfileData({ ...profileData, [name]: value });
    }
    
    if (profileError) setProfileError('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    if (passwordError) setPasswordError('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileLoading(true);

    try {
      const response = await authAPI.updateProfile(user.id, {
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
      });
      
      login(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    // Validate password policy on frontend
    const passwordErrors = [];
    if (passwordData.newPassword.length < 8) {
      passwordErrors.push('at least 8 characters');
    }
    if (!/[A-Z]/.test(passwordData.newPassword)) {
      passwordErrors.push('one uppercase letter');
    }
    if (!/[a-z]/.test(passwordData.newPassword)) {
      passwordErrors.push('one lowercase letter');
    }
    if (!/[0-9]/.test(passwordData.newPassword)) {
      passwordErrors.push('one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword)) {
      passwordErrors.push('one special character');
    }

    if (passwordErrors.length > 0) {
      setPasswordError(`Password must contain: ${passwordErrors.join(', ')}`);
      return;
    }

    setPasswordLoading(true);

    try {
      await authAPI.changePassword(user.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="account-settings">
      <div className="page-header">
        <h1>⚙️ Account Settings</h1>
        <p>Manage your account information and security</p>
      </div>

      <div className="settings-grid">
        {/* Profile Section */}
        <div className="settings-card">
          <div className="card-header">
            <h2>👤 Profile Information</h2>
          </div>
          
          {profileError && (
            <div className="error-box">
              <span className="error-icon">⚠</span>
              <span>{profileError}</span>
            </div>
          )}
          
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number (Philippines)</label>
              <input
                type="text"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                placeholder="+63 9XX XXX XXXX"
              />
              <small className="field-hint">Format: +63 followed by your number</small>
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={profileData.address}
                onChange={handleProfileChange}
                placeholder="Enter your complete address"
                rows={3}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Password Section */}
        <div className="settings-card">
          <div className="card-header">
            <h2>🔐 Change Password</h2>
          </div>
          
          {passwordError && (
            <div className="error-box">
              <span className="error-icon">⚠</span>
              <span>{passwordError}</span>
            </div>
          )}
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <PasswordInput
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <PasswordInput
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <PasswordInput
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                required
              />
            </div>

            <div className="password-requirements">
              <h4>Password Requirements:</h4>
              <ul>
                <li className={passwordData.newPassword.length >= 8 ? 'met' : ''}>
                  At least 8 characters
                </li>
                <li className={/[A-Z]/.test(passwordData.newPassword) ? 'met' : ''}>
                  One uppercase letter (A-Z)
                </li>
                <li className={/[a-z]/.test(passwordData.newPassword) ? 'met' : ''}>
                  One lowercase letter (a-z)
                </li>
                <li className={/[0-9]/.test(passwordData.newPassword) ? 'met' : ''}>
                  One number (0-9)
                </li>
                <li className={/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword) ? 'met' : ''}>
                  One special character (!@#$%^&*...)
                </li>
              </ul>
            </div>

            <button type="submit" className="btn-primary" disabled={passwordLoading}>
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
