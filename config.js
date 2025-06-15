// API Configuration for Damage Re-Cut Requisition System
// Update this configuration with your deployed Google Apps Script URL

const API_CONFIG = {
  // Replace this URL with your deployed Google Apps Script web app URL
  // Format: https://script.google.com/macros/s/{SCRIPT_ID}/exec
  BASE_URL: 'https://script.google.com/macros/s/AKfycbydUrIoSgdm53M7fc4LP6vXze-33QIMsWL0Nz2rbIiKGgkfnJXTkBGF777TiPOK6Jaw/exec',
  
  // API endpoints
  ENDPOINTS: {
    SUBMIT_FORM: '/submitDamageRecut',
    GET_RECENT_REQUESTS: '/getRecentRequests',
    GET_MATERIALS: '/getMaterials',
    ADD_MATERIAL: '/addMaterial',
    TEST_CONNECTION: '/testRecentRequests'
  },
  
  // Request configuration
  REQUEST_CONFIG: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // CORS mode for cross-origin requests
    mode: 'cors'
  }
};

// Helper function to make API calls to Google Apps Script
async function makeAPICall(endpoint, data = null) {
  try {
    console.log(`Making API call to: ${endpoint}`);
    console.log('Request data:', data);
    
    const requestOptions = {
      ...API_CONFIG.REQUEST_CONFIG,
      body: data ? JSON.stringify({
        action: endpoint.replace('/', ''),
        ...data
      }) : JSON.stringify({
        action: endpoint.replace('/', '')
      })
    };
    
    const response = await fetch(API_CONFIG.BASE_URL, requestOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`API response from ${endpoint}:`, result);
    
    return result;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// Validation function to check if API is configured
function validateAPIConfiguration() {
  if (API_CONFIG.BASE_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    console.error('API Configuration Error: Please update the BASE_URL in config.js with your Google Apps Script deployment URL');
    return false;
  }
  
  if (!API_CONFIG.BASE_URL.includes('script.google.com')) {
    console.error('API Configuration Error: BASE_URL should be a Google Apps Script URL');
    return false;
  }
  
  return true;
}

// Initialize API configuration check
document.addEventListener('DOMContentLoaded', function() {
  if (!validateAPIConfiguration()) {
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
      messageContainer.innerHTML = `
        <div class="error-message">
          <strong>Configuration Error:</strong> Please update the API configuration in config.js with your Google Apps Script deployment URL.
        </div>
      `;
    }
  }
});
