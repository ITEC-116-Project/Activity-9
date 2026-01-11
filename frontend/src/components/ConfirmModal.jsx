import { useState, createContext, useContext } from 'react';
import './ConfirmModal.css';

const ConfirmContext = createContext();

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'warning', // warning, danger, info
    onConfirm: null,
    onCancel: null,
  });

  const confirm = ({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'warning' }) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        type,
        onConfirm: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        },
      });
    });
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {confirmState.isOpen && (
        <ConfirmModal {...confirmState} />
      )}
    </ConfirmContext.Provider>
  );
};

const ConfirmModal = ({ title, message, confirmText, cancelText, type, onConfirm, onCancel }) => {
  const icons = {
    warning: '⚠️',
    danger: '🗑️',
    info: 'ℹ️',
  };

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className={`confirm-modal confirm-${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">{icons[type]}</div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`confirm-btn-confirm confirm-btn-${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
