# Environment Variables Setup

This project uses environment variables for configuration. For EAS builds, variables are managed through the EAS dashboard. For local development, use a `.env` file.

## Setting Up Environment Variables in EAS

### 1. Create Environment Variables in EAS Dashboard

Go to the [EAS Environment Variables page](https://expo.dev/accounts/[your-account]/projects/[your-project]/variables) or use the CLI:

```bash
# Create environment variables for each environment
eas env:create --name EXPO_PUBLIC_AUTH_API_URL --value "https://auth.ekowlabs.space/api" --environment development
eas env:create --name EXPO_PUBLIC_CHAT_API_URL --value "https://ai.ekowlabs.space/api" --environment development
eas env:create --name EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME --value "ddwet1dzj" --environment development
eas env:create --name EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET --value "bunprofile" --environment development
eas env:create --name EXPO_PUBLIC_SERPER_API_KEY --value "your-key" --environment development --type secret
eas env:create --name EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN --value "your-token" --environment development --type secret
eas env:create --name EXPO_PUBLIC_GOOGLE_API_KEY --value "your-key" --environment development --type secret
```

Repeat for `preview` and `production` environments.

### 2. Required Environment Variables

- `EXPO_PUBLIC_AUTH_API_URL` - Authentication API URL
- `EXPO_PUBLIC_CHAT_API_URL` - Chat/AI API URL
- `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` - Cloudinary upload preset
- `EXPO_PUBLIC_SERPER_API_KEY` - Serper API key (mark as secret)
- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` - Mapbox access token (mark as secret)
- `EXPO_PUBLIC_GOOGLE_API_KEY` - Google Maps API key (mark as secret)

**Note:** Variables prefixed with `EXPO_PUBLIC_` are available in the client-side code. Secret variables are not readable after creation for security.

## Local Development Setup

### 1. Pull Environment Variables from EAS

```bash
# Pull development environment variables
eas env:pull --environment development

# This creates a .env file in your project root
```

### 2. Manual .env File Setup

Alternatively, create a `.env` file manually in the project root:

```env
# API URLs
EXPO_PUBLIC_AUTH_API_URL=https://auth.ekowlabs.space/api
EXPO_PUBLIC_CHAT_API_URL=https://ai.ekowlabs.space/api

# Cloudinary Configuration
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=ddwet1dzj
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=bunprofile

# Serper API
EXPO_PUBLIC_SERPER_API_KEY=your-serper-api-key

# Mapbox Configuration
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token

# Google Maps API
EXPO_PUBLIC_GOOGLE_API_KEY=your-google-api-key
```

### 3. Using Environment Variables

The app automatically reads from environment variables via `config/env.ts`. Variables are accessed with fallbacks:

```typescript
import { ENV } from './config/env';

// Use ENV.AUTH_API_URL, ENV.SERPER_API_KEY, etc.
```

## Build Profiles

The `eas.json` file is configured with three build profiles:

- **development** - Uses `development` environment variables
- **preview** - Uses `preview` environment variables  
- **production** - Uses `production` environment variables

Each profile will automatically use the corresponding environment variables during the build process.

## Security Notes

1. **Never commit `.env` files** - They are already in `.gitignore`
2. **Mark sensitive keys as secrets** - Use `--type secret` when creating API keys
3. **Use different values per environment** - Development, preview, and production should have separate configurations
4. **EXPO_PUBLIC_ prefix** - Only variables with this prefix are available in client-side code

## Troubleshooting

- If variables aren't loading, ensure they're prefixed with `EXPO_PUBLIC_`
- For local development, restart the Expo dev server after creating/updating `.env`
- Secret variables cannot be pulled locally for security reasons
- Check the EAS dashboard to verify variables are set correctly

