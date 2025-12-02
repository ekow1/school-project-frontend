// Environment variables with fallbacks for local development
// For EAS builds, these will be populated from EAS environment variables
// For local development, use .env file or fallback to default values
export const ENV = {
    AUTH_API_URL: process.env.EXPO_PUBLIC_AUTH_API_URL || process.env.AUTH_API_URL || 'https://auth.ekowlabs.space/api',
    CHAT_API_URL: process.env.EXPO_PUBLIC_CHAT_API_URL || process.env.CHAT_API_URL || 'https://ai.ekowlabs.space/api',
    
    // Cloudinary configuration
    CLOUDINARY_CLOUD_NAME: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || 'ddwet1dzj',
    CLOUDINARY_UPLOAD_PRESET: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || process.env.CLOUDINARY_UPLOAD_PRESET || 'bunprofile',
    
    // Serper API configuration
    SERPER_API_KEY: process.env.EXPO_PUBLIC_SERPER_API_KEY || process.env.SERPER_API_KEY || '89fffb48355156d19b2c4acf93ccb173bd86e426',
    
    // Mapbox configuration
    MAPBOX_ACCESS_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiZWtvd2VudSIsImEiOiJjbWkzb3hlbmgxb3VpMmpzY2VlZnk0ODc3In0.G-TWI3wy1DSLObuvtSohcg',
    
    // Google Maps API configuration
    GOOGLE_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY || 'AIzaSyBBYIAR9igTpB06il6yxoce6wvC-vFZg4o',
    
    // Add other API URLs as needed
}
  
  