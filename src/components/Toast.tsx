import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'success' | 'error';
  message: string;
  actionText?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4500);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      <div className={`toast ${toast.type}`}>
        {toast.type === 'success' ? (
          <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0 }} />
        ) : (
          <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
        )}

        <div className="toast-message">{toast.message}</div>

        {toast.actionText && toast.onAction && (
          <button
            type="button"
            className="toast-action-btn"
            onClick={() => {
              toast.onAction?.();
              onClose();
            }}
          >
            {toast.actionText}
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '2px'
          }}
          aria-label="Cerrar notificación"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
