import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', duration = 4000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
                onClose && onClose();
            }, 300); // Wait for fade out animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-400" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-400" />;
            default:
                return <CheckCircle className="w-5 h-5 text-green-400" />;
        }
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-900 border-green-700';
            case 'error':
                return 'bg-red-900 border-red-700';
            case 'warning':
                return 'bg-yellow-900 border-yellow-700';
            default:
                return 'bg-green-900 border-green-700';
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose && onClose();
        }, 300);
    };

    return (
        <div
            className={`fixed bottom-4 right-4 z-50 transform transition-all duration-300 ease-in-out ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
        >
            <div
                className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg ${getBackgroundColor()} min-w-72 max-w-md`}
            >
                {getIcon()}
                <p className="text-white text-sm font-medium flex-1">{message}</p>
                <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;