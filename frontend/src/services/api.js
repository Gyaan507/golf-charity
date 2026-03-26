
const API_BASE_URL = 'https://golf-charity-9i4k.onrender.com/api';

export const fetchAPI = async (endpoint, options = {}) => {
    // Automatically attach the token if we have one in localStorage
    const token = localStorage.getItem('token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
};