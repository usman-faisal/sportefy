# Google Maps API Setup for Venue Location

This application uses Google Maps API to allow users to select venue locations on a map. Follow these steps to set up the API:

## 1. Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API (if you plan to add address search functionality)
4. Go to "Credentials" and create an API key
5. Restrict the API key to your domain for security

## 2. Set Environment Variable

Create a `.env.local` file in the `apps/frontend` directory and add:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

## 3. Features

The map component provides:
- Interactive map for location selection
- Click to place marker functionality
- Drag and drop marker adjustment
- Current location detection (requires user permission)
- Coordinate display (latitude/longitude)

## 4. Security Notes

- The API key is exposed in the frontend (hence `NEXT_PUBLIC_`)
- Restrict the API key to your domain in Google Cloud Console
- Consider implementing rate limiting if needed
- Monitor API usage in Google Cloud Console

## 5. Usage

The map component is automatically included in:
- Venue creation form
- Venue editing form

Users can:
1. Click on the map to select a location
2. Use the "Use Current Location" button
3. Drag the marker to fine-tune the location
4. View the exact coordinates below the map
