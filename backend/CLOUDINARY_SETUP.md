# Cloudinary Setup Guide

This application now uses Cloudinary for file storage instead of local file system. This guide will help you configure Cloudinary for your deployment.

## Prerequisites

- A Cloudinary account (free tier available at https://cloudinary.com/)

## Setup Steps

### 1. Create a Cloudinary Account

1. Go to [https://cloudinary.com/](https://cloudinary.com/)
2. Sign up for a free account
3. Once logged in, you'll see your Dashboard

### 2. Get Your Cloudinary Credentials

On your Cloudinary Dashboard, you'll find:
- **Cloud Name**: Your unique cloud name
- **API Key**: Your API key
- **API Secret**: Your API secret (click "Reveal" to see it)

### 3. Configure Environment Variables

Add the following variables to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Replace `your_cloud_name`, `your_api_key`, and `your_api_secret` with your actual Cloudinary credentials.

## File Organization

Files are automatically organized in Cloudinary folders based on their type:

- **Documents** (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT): `study-groups/documents/`
- **Images** (JPG, JPEG, PNG, GIF, BMP, SVG): `study-groups/images/`
- **Videos** (MP4, AVI, MOV, WMV, MKV, WEBM): `study-groups/videos/`
- **Audio** (MP3, WAV, AAC, OGG, FLAC): `study-groups/audio/`
- **Other files**: `study-groups/resources/`

## File Size Limits

The current configuration allows files up to **2MB** in size. You can adjust this in:
```javascript
// backend/middlewares/multer.js
limits: {
  fileSize: 2 * 1024 * 1024, // 2MB
}
```

## Supported File Formats

### Documents
- PDF: `.pdf`
- Word: `.doc`, `.docx`
- Excel: `.xls`, `.xlsx`
- PowerPoint: `.ppt`, `.pptx`
- Text: `.txt`

### Media
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.svg`
- Videos: `.mp4`, `.avi`, `.mov`, `.wmv`, `.mkv`, `.webm`
- Audio: `.mp3`, `.wav`, `.aac`, `.ogg`, `.flac`

## Database Changes

A new field `cloudinaryPublicId` has been added to the `additional_resources` table to store Cloudinary's public ID for file deletion. This field is automatically populated when files are uploaded.

## Migration from Local Storage

If you have existing files stored locally:

1. **No automatic migration** is performed
2. Existing file paths in the database will still point to local files
3. New uploads will use Cloudinary
4. You may need to manually migrate existing files or accept that old files use local storage

### Manual Migration Steps (Optional)

If you want to migrate existing files to Cloudinary:

1. Upload each file to Cloudinary using the Cloudinary SDK
2. Update the database records with the new Cloudinary URL and public_id
3. Delete the old local files

## Features

### Automatic File Cleanup

When resources are deleted, the system automatically:
- Deletes files from Cloudinary using the stored public_id
- Removes database records
- Handles errors gracefully (continues even if Cloudinary deletion fails)

### Resource Approval System

- Creator's resources are automatically approved
- Other members' uploads require admin approval
- Rejected resources are deleted from both Cloudinary and database

### Resource Management

- **Like/Dislike**: Users can like or dislike approved resources
- **Report**: Members can report inappropriate resources
- **Delete**: Admins and creators can delete approved resources

## Troubleshooting

### Files Not Uploading

1. Check that your Cloudinary credentials are correct in `.env`
2. Verify the file size is within limits (2MB default)
3. Ensure the file format is supported
4. Check server logs for specific error messages

### "Invalid Credentials" Error

- Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are correctly set
- Make sure there are no extra spaces in the `.env` file
- Restart your server after updating `.env`

### Files Not Deleting from Cloudinary

- Check that `cloudinaryPublicId` is properly stored in the database
- Verify your Cloudinary API Secret is correct
- Check server logs for specific Cloudinary API errors

## Cloudinary Dashboard

You can view and manage all uploaded files at:
- **Media Library**: https://cloudinary.com/console/media_library
- **Usage Statistics**: https://cloudinary.com/console/usage

## Free Tier Limits

Cloudinary free tier includes:
- **25 GB** storage
- **25 GB** monthly bandwidth
- **25,000** monthly transformations

Monitor your usage in the Cloudinary console to ensure you stay within limits.

## Security Best Practices

1. **Never commit** your `.env` file to version control
2. **Rotate** your API Secret regularly
3. **Use environment variables** for all sensitive credentials
4. **Enable signed uploads** for production (optional advanced feature)
5. **Set up upload presets** in Cloudinary console for better security

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK Guide](https://cloudinary.com/documentation/node_integration)
- [Multer Storage Cloudinary](https://github.com/affanshahid/multer-storage-cloudinary)
