export const getStatus = (code) => {
    const statuses = [
        'Open',
        'In Progress',
        'Submitted',
        'Approved',
        'Disputed',
        'Closed',
        'Cancelled',
    ];
    return statuses[code] || 'Unknown';
};