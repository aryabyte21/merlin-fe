import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to fetch MAWB suggestions from the backend
export const fetchMawbSuggestions = async (query) => {
  try {
    // First try to get real MAWB numbers from backend
    try {
      console.log("Fetching MAWB suggestions for query:", query);
      const response = await api.get('/mawb-suggestions/', { params: { query } });
      console.log("Response from backend:", response.data);
      
      if (response.data && response.data.length > 0) {
        return response.data;
      } else {
        console.log("Empty response from backend, falling back to mock data");
      }
    } catch (apiError) {
      console.error("Error fetching MAWB suggestions from backend:", apiError.message);
      if (apiError.response) {
        console.error("Response status:", apiError.response.status);
        console.error("Response data:", apiError.response.data);
      }
      console.warn("API endpoint for MAWB suggestions not available, falling back to mock data");
    }
    
    // Fallback to generating random MAWB numbers
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    
    // Generate some random MAWB numbers
    const generateRandomMAWB = () => {
      const prefix = "MAWB";
      const suffix = Math.floor(1000 + Math.random() * 9000);
      return `${prefix}${suffix}`;
    };
    
    // Create a list of 10 random MAWB numbers
    const mockData = Array.from({ length: 10 }, generateRandomMAWB);
    
    // Filter based on query
    return mockData.filter(mawb => 
      mawb.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error("Error fetching MAWB suggestions:", error);
    return [];
  }
};

// Update the received pieces
export const updateReceivedPieces = async (data) => {
  return api.post('/update/', data);
};

// Simulate login (in a real app, would validate credentials)
export const login = async (checkerData) => {
  // For now, simulate a successful login
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, user: checkerData });
    }, 500);
  });
};

export default api;