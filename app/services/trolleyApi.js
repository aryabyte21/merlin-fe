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


export const trolleyLogin = async (checkerData) => {
  // For now, simulate a successful login
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, user: checkerData });
    }, 500);
  });
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