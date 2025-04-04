import axios from 'axios';

const API_URL = 'http://54.159.194.138:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to handle trolley guy login
export const trolleyLogin = async (data) => {
  try {
    const response = await api.post('/trolley-login/', data);
    return response.data;
  } catch (error) {
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