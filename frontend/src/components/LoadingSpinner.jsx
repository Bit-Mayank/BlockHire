import React from 'react';

const LoadingSpinner = ({ size = 'w-5 h-5' }) => {
    return (
        <div className={`${size} animate-spin rounded-full border-2 border-white border-t-transparent`}></div>
    );
};

export default LoadingSpinner;