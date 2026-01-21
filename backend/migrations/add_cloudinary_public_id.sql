-- Migration: Add cloudinaryPublicId to additional_resources table
-- Date: 2026-01-21
-- Description: Adds cloudinaryPublicId field to store Cloudinary file identifiers for deletion

ALTER TABLE additional_resources 
ADD COLUMN cloudinary_public_id VARCHAR(255) NULL 
COMMENT 'Cloudinary public_id for file deletion';

-- Add index for faster lookups (optional but recommended)
CREATE INDEX idx_cloudinary_public_id ON additional_resources(cloudinary_public_id);

-- Note: Existing records will have NULL cloudinaryPublicId
-- Only new uploads will have this field populated
-- Old files will remain on local storage unless manually migrated
