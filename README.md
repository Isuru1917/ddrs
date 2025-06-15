# Damage Re-Cut Requisition System - Frontend

This is the frontend application for the Damage Re-Cut Requisition System, designed to be deployed on Vercel.

## Quick Start

1. **Configure API Endpoint**:
   - Open `config.js`
   - Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with your Google Apps Script web app URL

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```

3. **Test the Application**:
   - Visit your Vercel deployment URL
   - Submit a test request
   - Verify functionality

## Files Overview

- **`index.html`**: Main HTML structure
- **`styles.css`**: CSS styles with blue theme and responsive design
- **`app.js`**: Main JavaScript application logic
- **`config.js`**: API configuration (UPDATE THIS FILE)
- **`package.json`**: Node.js dependencies for development
- **`vercel.json`**: Vercel deployment configuration

## Features

- ✅ Responsive design optimized for Samsung A9 Tab and other devices
- ✅ Blue gradient theme throughout the application
- ✅ Dynamic panel management (add/remove panels)
- ✅ Material autocomplete with Google Sheets integration
- ✅ Reason dropdown with conditional "Other" text input
- ✅ Form validation and error handling
- ✅ Recent requests display with real-time updates
- ✅ Professional email notifications
- ✅ CORS-enabled API communication

## Configuration Required

### 1. API Endpoint Configuration

In `config.js`, update the `BASE_URL`:

```javascript
const API_CONFIG = {
  BASE_URL: 'https://script.google.com/macros/s/{YOUR_SCRIPT_ID}/exec',
  // ... rest of configuration
};
```

### 2. Backend Requirements

The frontend expects the following API endpoints from the Google Apps Script backend:

- `POST /submitDamageRecut` - Submit form data
- `POST /getRecentRequests` - Get recent requests
- `POST /getMaterials` - Get materials list
- `POST /addMaterial` - Add new material
- `POST /testRecentRequests` - Test backend connectivity

## Development

### Local Development

```bash
# Install dependencies
npm install

# Start local server
npm run dev
```

### Testing

1. **Form Submission**: Fill out and submit a complete form
2. **Panel Management**: Add and remove panels
3. **Material Autocomplete**: Test material search and adding new materials
4. **Reason Dropdown**: Test "Other" option functionality
5. **Recent Requests**: Verify loading and display
6. **Responsive Design**: Test on different screen sizes

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance Optimizations

- Minimal animations (0.2s duration)
- Efficient DOM manipulation
- Cached materials data
- Optimized for tablet performance
- CDN delivery via Vercel

## Troubleshooting

### Common Issues

1. **"Configuration Error" message**:
   - Update `config.js` with correct Google Apps Script URL

2. **Form submission fails**:
   - Check browser console for errors
   - Verify API URL is correct
   - Test backend connectivity using the "🔧 Test" button

3. **Recent requests not loading**:
   - Use the "🔄 Refresh" button
   - Check backend API status

### Debug Tools

- Browser Developer Tools (F12)
- Console logging (check for API call logs)
- Network tab (verify API requests)
- Test button for backend connectivity

## Deployment

This frontend is designed for static hosting on Vercel. See the main `DEPLOYMENT_GUIDE.md` for complete deployment instructions.

## Support

For technical support:
1. Check browser console for errors
2. Verify API configuration
3. Test backend connectivity
4. Review deployment guide
