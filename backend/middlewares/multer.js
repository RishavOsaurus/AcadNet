import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import path from "path";

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine file type based on extension
    const ext = path.extname(file.originalname).toLowerCase();
    let resourceType = 'auto'; // Cloudinary will auto-detect
    
    // Organize files in folders based on type
    let folder = 'study-groups/resources';
    
    if (['.mp4', '.avi', '.mov', '.wmv', '.mkv', '.webm'].includes(ext)) {
      resourceType = 'video';
      folder = 'study-groups/videos';
    } else if (['.mp3', '.wav', '.aac', '.ogg', '.flac'].includes(ext)) {
      resourceType = 'video'; // Cloudinary uses 'video' for audio files
      folder = 'study-groups/audio';
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'].includes(ext)) {
      resourceType = 'image';
      folder = 'study-groups/images';
    } else {
      resourceType = 'raw'; // For PDFs, docs, etc.
      folder = 'study-groups/documents';
    }

    return {
      folder: folder,
      resource_type: resourceType,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm', 'mp3', 'wav', 'aac', 'ogg', 'flac', 'txt'],
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`, // Unique filename
    };
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB file size limit
  }
});

export default upload;