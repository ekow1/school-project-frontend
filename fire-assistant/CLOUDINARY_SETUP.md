# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image uploads in the Fire Assistant app.

## Prerequisites
- A Cloudinary account (free tier is sufficient)
- Access to your Cloudinary dashboard

## Step 1: Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Get Your Credentials

1. Log in to your Cloudinary dashboard at https://cloudinary.com/console
2. On the dashboard, you'll see:
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key**
   - **API Secret**

3. **Copy your Cloud Name** - you'll need this.

## Step 3: Create an Unsigned Upload Preset

For mobile apps, we use **unsigned upload presets** to upload images securely without exposing API secrets.

1. In your Cloudinary dashboard, go to **Settings** (gear icon)
2. Click on **Upload** tab
3. Scroll down to **Upload presets**
4. Click **Add upload preset**
5. Configure the preset:
   - **Preset name**: Give it a name (e.g., `fire_assistant_profiles`)
   - **Signing Mode**: Select **Unsigned**
   - **Folder**: Enter `profile-pictures` (optional but recommended)
   - **Format**: Leave as default or select specific formats
   - **Access mode**: Leave as **Public**
   - **Unique filename**: Enable this (recommended)
   - **Overwrite**: Disable (recommended)

6. Click **Save**
7. **Copy the preset name** - you'll need this.

## Step 4: Configure Your App

1. Open `config/env.ts` in your project
2. Replace the placeholder values:

```typescript
export const ENV = {
  AUTH_API_URL: 'https://auth.ekowlabs.space/api',
  CHAT_API_URL: 'https://ai.ekowlabs.space/api',
  
  // Cloudinary configuration
  CLOUDINARY_CLOUD_NAME: 'your_cloud_name_here', // Replace with your Cloud Name
  CLOUDINARY_UPLOAD_PRESET: 'your_preset_name_here', // Replace with your Upload Preset name
  
  // Add other API URLs as needed
}
```

### Example:
```typescript
CLOUDINARY_CLOUD_NAME: 'dxyz123abc',
CLOUDINARY_UPLOAD_PRESET: 'fire_assistant_profiles',
```

## Step 5: Test the Upload

1. Run your app: `npx expo start`
2. Navigate to the Profile screen
3. Tap on the profile picture
4. Tap the camera icon (when in edit mode)
5. Select an image from your gallery
6. The image should upload to Cloudinary and display in your profile

## How It Works

### Upload Flow:
1. User selects an image using `expo-image-picker`
2. Image is uploaded to Cloudinary using the unsigned upload preset
3. Cloudinary returns a secure URL (e.g., `https://res.cloudinary.com/...`)
4. The URL is sent to your backend API
5. Backend updates the user's profile with the new image URL in the database

### Files Involved:
- **`utils/cloudinary.ts`**: Handles image upload to Cloudinary
- **`app/(tabs)/profile.tsx`**: Profile screen with upload functionality
- **`store/authStore.ts`**: Updates profile data including image URL

## Security Notes

✅ **Safe for Production:**
- Unsigned upload presets are safe because they're limited to uploads only
- No API secrets are exposed in the mobile app
- You can configure upload restrictions (file size, formats, etc.) in the preset

⚠️ **Recommended Settings:**
- Enable **unique filename** to prevent overwrites
- Set a **folder** to organize uploads
- Configure **allowed formats** (jpg, png, webp)
- Set **maximum file size** to prevent abuse

## Troubleshooting

### Error: "Upload failed"
- Check your Cloud Name is correct
- Verify the Upload Preset name matches exactly
- Ensure the preset is set to **Unsigned**
- Check your internet connection

### Error: "Permission Required"
- The app needs permission to access your photo library
- Go to device Settings → Fire Assistant → Allow Photos

### Image not displaying after upload
- Check the console logs for the returned URL
- Verify the URL is being saved to the database
- Check if the image URL is properly formatted

## Advanced Configuration

### Custom Transformations
You can apply transformations during upload by modifying `utils/cloudinary.ts`:

```typescript
formData.append('transformation', 'c_fill,w_400,h_400,g_face');
```

This will:
- Crop to fill 400x400px
- Focus on face detection
- Optimize for profile pictures

### Different Folders for Different Images
```typescript
// Profile pictures
await uploadImageToCloudinary(uri, 'profile-pictures');

// Incident reports
await uploadImageToCloudinary(uri, 'incident-reports');

// News images
await uploadImageToCloudinary(uri, 'news-images');
```

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Unsigned Upload Guide](https://cloudinary.com/documentation/upload_images#unsigned_upload)
- [React Native Integration](https://cloudinary.com/documentation/react_native_image_and_video_upload)

## Support

If you encounter any issues:
1. Check the Cloudinary dashboard for upload logs
2. Review the app console logs
3. Verify all credentials are correct
4. Ensure the upload preset is properly configured





