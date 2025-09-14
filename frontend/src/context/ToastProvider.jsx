import React, { createContext, useState } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success', duration = 4000) => {
        const id = Date.now();
        const newToast = { id, message, type, duration };

        setToasts(prev => [...prev, newToast]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const showSuccess = (message, duration) => showToast(message, 'success', duration);
    const showError = (message, duration) => showToast(message, 'error', duration);
    const showWarning = (message, duration) => showToast(message, 'warning', duration);

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning }}>
            {children}
            <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2">
                {toasts.map((toast, index) => (
                    <div
                        key={toast.id}
                        style={{
                            transform: `translateY(-${index * 70}px)`,
                            zIndex: 50 - index
                        }}
                    >
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            duration={toast.duration}
                            onClose={() => removeToast(toast.id)}
                        />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export default ToastContext;