// Damage Re-Cut Requisition System - Frontend Application
// Global variables
let panelIdCounter = 0;
let materialsCache = [];
let isLoadingMaterials = false;
let hasFormBeenSubmitted = false;
let isPageLoaded = false;
let addPanelCallCount = 0;

// Panel Management Functions
function addPanel() {
  addPanelCallCount++;
  console.log('addPanel: Function called #' + addPanelCallCount + ', current panelIdCounter:', panelIdCounter);
  console.log('addPanel: Called from:', new Error().stack);
  panelIdCounter++;
  const panelsContainer = document.getElementById('panels-container');

  if (!panelsContainer) {
    console.error('addPanel: panels-container not found');
    return;
  }

  // Calculate the display number based on existing panels
  const existingPanels = panelsContainer.querySelectorAll('.panel-section');
  const displayNumber = existingPanels.length + 1;

  console.log('addPanel: Adding panel', displayNumber, 'with ID', panelIdCounter);

  const panelDiv = document.createElement('div');
  panelDiv.className = 'panel-section';
  panelDiv.id = `panel-${panelIdCounter}`;
  panelDiv.setAttribute('data-display-number', displayNumber);

  panelDiv.innerHTML = `
    <div class="panel-header">
      <span class="panel-title">Panel #${displayNumber}</span>
      <button type="button" class="remove-panel" onclick="removePanel(${panelIdCounter})">🗑️ Remove</button>
    </div>
    
    <div class="form-group">
      <label>Panel Number <span class="required">*</span></label>
      <textarea placeholder="Enter panel numbers (one per line or separated by commas)..." required></textarea>
    </div>
    
    <div class="form-group">
      <label>Material <span class="required">*</span></label>
      <div class="material-input-container">
        <input type="text" class="material-input" placeholder="Start typing to search materials..." required autocomplete="off">
        <div class="material-suggestions"></div>
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label>Side <span class="required">*</span></label>
        <select required>
          <option value="">Select side</option>
          <option value="Left Side">Left Side</option>
          <option value="Right Side">Right Side</option>
          <option value="Both Sides">Both Sides</option>
        </select>
      </div>
      <div class="form-group">
        <label>Quantity <span class="required">*</span></label>
        <select required>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
        </select>
      </div>
    </div>
  `;
  
  panelsContainer.appendChild(panelDiv);

  // Initialize material autocomplete for the new panel
  initializeMaterialAutocomplete(panelDiv);
}

function removePanel(panelId) {
  const panelDiv = document.getElementById(`panel-${panelId}`);
  if (panelDiv) {
    panelDiv.remove();
    // Renumber all remaining panels
    renumberPanels();
  }
}

function renumberPanels() {
  const panelsContainer = document.getElementById('panels-container');
  const panels = panelsContainer.querySelectorAll('.panel-section');

  panels.forEach((panel, index) => {
    const displayNumber = index + 1;
    panel.setAttribute('data-display-number', displayNumber);

    // Update the panel title
    const titleElement = panel.querySelector('.panel-title');
    if (titleElement) {
      titleElement.textContent = `Panel #${displayNumber}`;
    }
  });
}

// Materials Management Functions
async function loadMaterials() {
  if (isLoadingMaterials || materialsCache.length > 0) {
    return Promise.resolve(materialsCache);
  }

  isLoadingMaterials = true;

  try {
    const result = await makeAPICall('/getMaterials');
    
    // Clean and filter the materials data
    materialsCache = (result || [])
      .filter(material => material && typeof material === 'string' && material.trim() !== '')
      .map(material => material.trim())
      .sort();
    
    isLoadingMaterials = false;
    return materialsCache;
  } catch (error) {
    console.error('Error loading materials:', error);
    isLoadingMaterials = false;
    
    // Fallback to default materials
    materialsCache = [
      'Aluminum 6061-T6',
      'Aluminum 7075-T6',
      'Carbon Fiber',
      'Fiberglass',
      'Stainless Steel 316',
      'Titanium Grade 2',
      'Polycarbonate',
      'ABS Plastic',
      'Nylon 6/6',
      'PEEK'
    ];
    return materialsCache;
  }
}

async function addNewMaterial(materialName) {
  try {
    const result = await makeAPICall('/addMaterial', { materialName });
    
    if (result.success) {
      // Add to cache
      materialsCache.push(materialName);
      materialsCache.sort();
    }
    return result;
  } catch (error) {
    console.error('Error adding material:', error);
    return { success: false, message: 'Error adding material' };
  }
}

// UI Helper Functions
function showMessage(message, isError = false) {
  const container = document.getElementById('message-container');
  container.innerHTML = `
    <div class="${isError ? 'error-message' : 'success-message'}">
      ${message}
    </div>
  `;
  
  // Auto-hide message after 5 seconds
  setTimeout(() => {
    container.innerHTML = '';
  }, 5000);
}

// Reason Dropdown Functions
function handleReasonChange() {
  const reasonSelect = document.getElementById('reason');
  const customReasonGroup = document.getElementById('customReasonGroup');
  const customReasonInput = document.getElementById('customReason');
  
  if (reasonSelect.value === 'Other') {
    // Show custom reason input and make it required
    customReasonGroup.style.display = 'block';
    customReasonInput.required = true;
    customReasonInput.focus();
    updateCharacterCount(); // Update character count when shown
  } else {
    // Hide custom reason input and remove requirement
    customReasonGroup.style.display = 'none';
    customReasonInput.required = false;
    customReasonInput.value = ''; // Clear the input when hidden
    updateCharacterCount(); // Reset character count
  }
}

function updateCharacterCount() {
  const customReasonInput = document.getElementById('customReason');
  const characterCount = document.getElementById('characterCount');
  
  if (customReasonInput && characterCount) {
    const currentLength = customReasonInput.value.length;
    const maxLength = customReasonInput.maxLength;
    characterCount.textContent = `${currentLength}/${maxLength} characters`;
    
    // Change color when approaching limit
    if (currentLength > maxLength * 0.9) {
      characterCount.style.color = '#e53e3e';
    } else if (currentLength > maxLength * 0.8) {
      characterCount.style.color = '#ff9800';
    } else {
      characterCount.style.color = '#666';
    }
  }
}

// Form Data Collection
function collectFormData() {
  const form = document.getElementById('damageRecutForm');
  const formData = new FormData(form);
  
  // Handle reason field - use custom reason if "Other" is selected
  let reason = formData.get('reason');
  if (reason === 'Other') {
    const customReason = formData.get('customReason');
    if (customReason && customReason.trim()) {
      reason = `Other: ${customReason.trim()}`;
    }
  }
  
  // Get basic form data
  const data = {
    gliderName: formData.get('gliderName'),
    orderNumber: formData.get('orderNumber'),
    reason: reason,
    requestedBy: formData.get('requestedBy'),
    additionalNotes: formData.get('additionalNotes') || '',
    panels: []
  };
  
  // Collect panel data
  const panelSections = document.querySelectorAll('.panel-section');
  panelSections.forEach((section, index) => {
    const panelData = {};

    // Get panel number from textarea
    const panelNumberTextarea = section.querySelector('textarea');
    if (panelNumberTextarea) {
      panelData.panelNumber = panelNumberTextarea.value.trim();
    }

    // Get material from the material input
    const materialInput = section.querySelector('.material-input');
    if (materialInput) {
      panelData.material = materialInput.value.trim();
    }

    // Get side and quantity from selects
    const selects = section.querySelectorAll('select');
    selects.forEach(select => {
      const label = select.previousElementSibling?.textContent || '';
      if (label.includes('Side')) {
        panelData.side = select.value;
      } else if (label.includes('Quantity')) {
        panelData.quantity = select.value;
      }
    });

    // Only add panel if we have at least panel number or material
    if (panelData.panelNumber || panelData.material) {
      data.panels.push(panelData);
    }
  });
  
  return data;
}

// Form Submission Functions
async function submitForm(event) {
  event.preventDefault();

  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.textContent;

  // Disable submit button and show loading state
  submitBtn.disabled = true;
  submitBtn.classList.add('loading');
  submitBtn.textContent = 'Submitting...';

  try {
    const formData = collectFormData();

    // Validate custom reason if "Other" is selected
    const reasonSelect = document.getElementById('reason');
    const customReasonInput = document.getElementById('customReason');
    if (reasonSelect.value === 'Other' && (!customReasonInput.value || !customReasonInput.value.trim())) {
      showMessage('Please specify the custom reason when "Other" is selected.', true);
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      submitBtn.textContent = originalText;
      customReasonInput.focus();
      return;
    }

    // Validate that all panels have required fields
    let hasValidationErrors = false;
    formData.panels.forEach((panel, index) => {
      if (!panel.panelNumber || !panel.material || !panel.side || !panel.quantity) {
        showMessage(`Panel ${index + 1}: Please fill in all required fields (Panel Number, Material, Side, Quantity).`, true);
        hasValidationErrors = true;
      }
    });

    if (hasValidationErrors) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      submitBtn.textContent = originalText;
      return;
    }

    if (formData.panels.length === 0) {
      showMessage('Please add at least one panel to your request.', true);
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      submitBtn.textContent = originalText;
      return;
    }

    // Submit form data
    await submitFormData(formData, submitBtn, originalText);

  } catch (error) {
    console.error('Form submission error:', error);
    showMessage('Error submitting request. Please try again.', true);
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
    submitBtn.textContent = originalText;
  }
}

// Separate form submission function to prevent handler interference
async function submitFormData(formData, submitBtn, originalText) {
  console.log('submitFormData: Starting form submission');

  // Set flag to indicate a form has been submitted
  hasFormBeenSubmitted = true;
  console.log('submitFormData: Setting hasFormBeenSubmitted flag to true');

  try {
    const result = await makeAPICall('/submitDamageRecut', formData);

    console.log('FORM_SUBMISSION_SUCCESS: Handler called with result:', result);
    console.log('FORM_SUBMISSION_SUCCESS: hasFormBeenSubmitted flag is:', hasFormBeenSubmitted);

    // Only process if this is actually a form submission response
    if (!hasFormBeenSubmitted) {
      console.warn('FORM_SUBMISSION_SUCCESS: Handler called but no form was submitted - IGNORING');
      return;
    }

    if (result.success) {
      showMessage(result.message);
      // Reset form
      console.log('FORM_SUBMISSION_SUCCESS: Resetting form and adding first panel back');
      document.getElementById('damageRecutForm').reset();
      document.getElementById('panels-container').innerHTML = '';
      panelIdCounter = 0;

      // Reset custom reason field visibility
      const customReasonGroup = document.getElementById('customReasonGroup');
      const customReasonInput = document.getElementById('customReason');
      customReasonGroup.style.display = 'none';
      customReasonInput.required = false;
      customReasonInput.value = '';
      updateCharacterCount(); // Reset character count

      // Add first panel back after clearing
      addPanel();

      // Refresh recent requests to show the new submission
      refreshRecentRequests();

      // Show additional success message with Request ID emphasis
      setTimeout(() => {
        showMessage('✅ Request submitted successfully! Please save your Request ID for reference.', false);
      }, 3000);
    } else {
      showMessage(result.message, true);
    }

    // Reset the flag after processing
    hasFormBeenSubmitted = false;
    console.log('FORM_SUBMISSION_SUCCESS: Reset hasFormBeenSubmitted flag to false');

  } catch (error) {
    console.log('FORM_SUBMISSION_FAILURE: Handler called with error:', error);

    // Reset the flag
    hasFormBeenSubmitted = false;
    console.log('FORM_SUBMISSION_FAILURE: Reset hasFormBeenSubmitted flag to false');

    showMessage('Error submitting request. Please try again.', true);
    throw error;
  } finally {
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
    submitBtn.textContent = originalText;
  }
}

// Recent Requests Functions
async function loadRecentRequests() {
  console.log('RECENT_REQUESTS: Starting to load recent requests');
  const recentContainer = document.getElementById('recent-requests');

  if (!recentContainer) {
    console.error('RECENT_REQUESTS: recent-requests container not found');
    return;
  }

  // Show loading state
  recentContainer.innerHTML = `
    <div class="recent-loading">
      <div class="recent-loading-spinner"></div>
      <p>Loading recent requests...</p>
    </div>
  `;

  console.log('RECENT_REQUESTS: Calling backend getRecentRequests function');

  try {
    const requests = await makeAPICall('/getRecentRequests');
    console.log('RECENT_REQUESTS_SUCCESS: Handler called with data:', requests);
    displayRecentRequests(requests);
  } catch (error) {
    console.error('RECENT_REQUESTS_ERROR: Handler called with error:', error);
    recentContainer.innerHTML = `
      <div class="recent-error">
        <p>Unable to load recent requests</p>
        <p style="font-size: 12px; margin-top: 8px;">Error: ${error.message || error.toString()}</p>
        <button onclick="loadRecentRequests()" style="margin-top: 8px; padding: 8px 16px; background: #1e88e5; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
      </div>
    `;
  }
}

function displayRecentRequests(requests) {
  console.log('displayRecentRequests: Called with requests:', requests);
  const recentContainer = document.getElementById('recent-requests');

  if (!recentContainer) {
    console.error('displayRecentRequests: recent-requests container not found');
    return;
  }

  if (!requests) {
    console.log('displayRecentRequests: Requests is null or undefined');
    recentContainer.innerHTML = `
      <div class="recent-error">
        <p>Error loading requests</p>
        <p style="font-size: 12px; margin-top: 8px;">No data received from server</p>
        <button onclick="loadRecentRequests()" style="margin-top: 8px; padding: 8px 16px; background: #1e88e5; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
      </div>
    `;
    return;
  }

  if (!Array.isArray(requests)) {
    console.error('displayRecentRequests: Requests is not an array:', typeof requests);
    recentContainer.innerHTML = `
      <div class="recent-error">
        <p>Error loading requests</p>
        <p style="font-size: 12px; margin-top: 8px;">Invalid data format received</p>
        <button onclick="loadRecentRequests()" style="margin-top: 8px; padding: 8px 16px; background: #1e88e5; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
      </div>
    `;
    return;
  }

  if (requests.length === 0) {
    console.log('displayRecentRequests: No requests found, showing empty state');
    recentContainer.innerHTML = `
      <div class="recent-requests">
        <div class="recent-icon">📋</div>
        <p>No damage requests yet</p>
        <p class="subtitle">Submitted requests will appear here</p>
      </div>
    `;
    return;
  }

  console.log('displayRecentRequests: Displaying', requests.length, 'requests');

  // Display recent requests
  try {
    const requestsHtml = requests.map((request, index) => {
      console.log(`displayRecentRequests: Processing request ${index + 1}:`, request);

      if (!request || !request.requestId) {
        console.warn(`displayRecentRequests: Invalid request at index ${index}:`, request);
        return '';
      }

      const timestamp = new Date(request.timestamp);
      const formattedDate = timestamp.toLocaleDateString();
      const formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return `
        <div class="recent-item" onclick="showRequestDetails('${request.requestId}')">
          <div class="recent-item-header">
            <span class="recent-request-id">${request.requestId}</span>
            <span class="recent-timestamp">${formattedDate} ${formattedTime}</span>
          </div>
          <div class="recent-item-details">
            <div class="recent-item-detail">
              <span class="recent-item-label">Glider:</span> ${request.gliderName || 'N/A'}
            </div>
            <div class="recent-item-detail">
              <span class="recent-item-label">Order:</span> ${request.orderNumber || 'N/A'}
            </div>
            <div class="recent-item-detail">
              <span class="recent-item-label">Panels:</span> ${request.panelCount || 1}
            </div>
          </div>
        </div>
      `;
    }).filter(html => html !== '').join('');

    if (requestsHtml === '') {
      console.warn('displayRecentRequests: All requests were invalid, showing empty state');
      recentContainer.innerHTML = `
        <div class="recent-requests">
          <div class="recent-icon">📋</div>
          <p>No valid requests found</p>
          <p class="subtitle">Please check the data format</p>
        </div>
      `;
    } else {
      recentContainer.innerHTML = requestsHtml;
      console.log('displayRecentRequests: Successfully displayed requests');
    }
  } catch (error) {
    console.error('displayRecentRequests: Error rendering requests:', error);
    recentContainer.innerHTML = `
      <div class="recent-error">
        <p>Error displaying requests</p>
        <p style="font-size: 12px; margin-top: 8px;">Rendering error: ${error.message}</p>
        <button onclick="loadRecentRequests()" style="margin-top: 8px; padding: 8px 16px; background: #1e88e5; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
      </div>
    `;
  }
}

function refreshRecentRequests() {
  // Refresh recent requests after a short delay to allow backend processing
  setTimeout(() => {
    loadRecentRequests();
  }, 1000);
}

function showRequestDetails(requestId) {
  // Placeholder for showing request details
  showMessage(`Request details for ${requestId} - Feature coming soon!`);
}

// Test function to debug backend connectivity
async function testBackend() {
  console.log('testBackend: Starting backend test');

  try {
    const result = await makeAPICall('/testRecentRequests');
    console.log('testBackend: Success result:', result);
    alert('Backend Test Results:\n\n' + JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('testBackend: Error:', error);
    alert('Backend Test Failed:\n\n' + error.toString());
  }
}

// Material Autocomplete Functions
function initializeMaterialAutocomplete(panelElement) {
  const materialInput = panelElement.querySelector('.material-input');
  const suggestionsDiv = panelElement.querySelector('.material-suggestions');

  if (!materialInput || !suggestionsDiv) return;

  let currentHighlight = -1;

  materialInput.addEventListener('input', async function() {
    const query = this.value.toLowerCase().trim();

    if (query.length < 1) {
      hideSuggestions();
      return;
    }

    // Load materials if not already loaded
    if (materialsCache.length === 0) {
      await loadMaterials();
    }

    // Filter materials based on query
    const filteredMaterials = materialsCache.filter(material =>
      material.toLowerCase().includes(query)
    );

    showSuggestions(filteredMaterials, query);
  });

  materialInput.addEventListener('keydown', function(e) {
    const suggestions = suggestionsDiv.querySelectorAll('.suggestion-item');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentHighlight = Math.min(currentHighlight + 1, suggestions.length - 1);
      updateHighlight();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentHighlight = Math.max(currentHighlight - 1, -1);
      updateHighlight();
    } else if (e.key === 'Enter' && currentHighlight >= 0) {
      e.preventDefault();
      suggestions[currentHighlight].click();
    } else if (e.key === 'Escape') {
      hideSuggestions();
    }
  });

  materialInput.addEventListener('blur', function() {
    // Delay hiding to allow click events on suggestions
    setTimeout(() => hideSuggestions(), 150);
  });

  function showSuggestions(materials, query) {
    if (materials.length === 0 && query.length > 0) {
      // Show "Add new material" option
      suggestionsDiv.innerHTML = `
        <div class="add-new-material" onclick="handleAddNewMaterial('${query}', this)">
          <span>+</span> Add "${query}" as new material
        </div>
      `;
    } else {
      // Show filtered materials
      suggestionsDiv.innerHTML = materials.map(material =>
        `<div class="suggestion-item" onclick="selectMaterial('${material}', this)">${material}</div>`
      ).join('');

      // Add "Add new material" option if query doesn't match exactly
      if (query.length > 0 && !materials.some(m => m.toLowerCase() === query.toLowerCase())) {
        suggestionsDiv.innerHTML += `
          <div class="add-new-material" onclick="handleAddNewMaterial('${query}', this)">
            <span>+</span> Add "${query}" as new material
          </div>
        `;
      }
    }

    suggestionsDiv.classList.add('show');
    materialInput.classList.add('has-suggestions');
    currentHighlight = -1;
  }

  function hideSuggestions() {
    suggestionsDiv.classList.remove('show');
    materialInput.classList.remove('has-suggestions');
    currentHighlight = -1;
  }

  function updateHighlight() {
    const suggestions = suggestionsDiv.querySelectorAll('.suggestion-item');
    suggestions.forEach((item, index) => {
      item.classList.toggle('highlighted', index === currentHighlight);
    });
  }

  // Make functions available globally for onclick handlers
  window.selectMaterial = function(material, element) {
    const panel = element.closest('.panel-section');
    const input = panel.querySelector('.material-input');
    input.value = material;
    hideSuggestions();
  };

  window.handleAddNewMaterial = async function(materialName, element) {
    const panel = element.closest('.panel-section');
    const input = panel.querySelector('.material-input');

    try {
      const result = await addNewMaterial(materialName);
      if (result.success) {
        input.value = materialName;
        showMessage(`Material "${materialName}" added successfully!`);
      } else {
        showMessage(result.message || 'Error adding material', true);
      }
    } catch (error) {
      showMessage('Error adding material. Please try again.', true);
    }

    hideSuggestions();
  };
}

// Application Initialization
function initializeApp() {
  console.log('initializeApp: Starting application initialization');

  // Check if panels already exist (safety check)
  const existingPanels = document.querySelectorAll('.panel-section');
  console.log('initializeApp: Found', existingPanels.length, 'existing panels');

  if (existingPanels.length === 0) {
    console.log('initializeApp: No existing panels, adding first panel');
    addPanel();
  } else {
    console.warn('initializeApp: Panels already exist, skipping addPanel()');
  }

  // Pre-load materials for better performance
  loadMaterials();

  // Set page loaded flag
  isPageLoaded = true;
  console.log('initializeApp: Set isPageLoaded flag to true');

  // Delay loading recent requests to prevent interference with form handlers
  setTimeout(() => {
    console.log('initializeApp: Loading recent requests after delay');
    loadRecentRequests();
  }, 1000);

  console.log('initializeApp: Application initialization complete');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing application');

  // Initialize the application
  initializeApp();

  // Add form submission handler
  const form = document.getElementById('damageRecutForm');
  if (form) {
    form.addEventListener('submit', submitForm);
  }

  console.log('Application initialization complete');
});
