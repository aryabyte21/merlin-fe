import axios from 'axios';

// Select the appropriate API URL based on environment
const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
const API_URL =  'http://54.159.194.138:8000/api'


// Create axios instance with better configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
  withCredentials: false, // Important for CORS
});

// Function to handle trolley guy login
export const trolleyLogin = async (data) => {
  try {
    console.log("Sending trolley login request with data:", data);
    const response = await api.post('/trolley-login/', data);
    console.log("Received response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Trolley login error:", error);
    
    // Check connection errors
    if (!error.response) {
      throw new Error('Cannot connect to server. Please check your internet connection.');
    }
    
    // Check specific status codes
    if (error.response.status === 405) {
      throw new Error('Server error: Method not allowed. Please contact support.');
    }
    
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};

// Function to fetch flight number suggestions
export const fetchFlightSuggestions = async (query) => {
  try {
    const response = await api.get('/flight-suggestions/', { params: { query } });
    return response.data;
  } catch (error) {
    console.error("Error fetching flight suggestions:", error);
    return [];
  }
};

// Function to fetch MAWB numbers for a specific flight
export const fetchMawbByFlight = async (flight) => {
  try {
    const response = await api.get('/mawb-by-flight/', { params: { flight } });
    return response.data;
  } catch (error) {
    console.error("Error fetching MAWBs by flight:", error);
    return [];
  }
};

// Function to update BT number
export const updateBtNumber = async (data) => {
  try {
    const response = await api.post('/update-bt/', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update BT number');
  }
};