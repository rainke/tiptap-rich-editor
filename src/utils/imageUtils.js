/**
 * Image Utilities
 * 
 * Provides utility functions for image handling in the editor:
 * - URL validation
 * - Base64 conversion
 * - File validation
 * 
 * Requirements: 1.2, 1.3, 1.4
 */

/**
 * Supported image MIME types
 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
]

/**
 * Supported image file extensions
 */
export const SUPPORTED_IMAGE_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'
]

/**
 * Maximum file size in bytes (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024

/**
 * Validates if a string is a valid image URL
 * 
 * Checks:
 * - Valid URL format (http/https/data URI)
 * - Has image file extension OR is a data URI with image MIME type
 * 
 * Requirement 1.2: Validate image URL before insertion
 * Requirement 1.4: Reject invalid image URLs
 * 
 * @param {string} url - The URL to validate
 * @returns {boolean} True if the URL is a valid image URL
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') {
    return false
  }

  const trimmedUrl = url.trim()
  
  if (trimmedUrl.length === 0) {
    return false
  }

  // Check for data URI (base64 encoded images)
  if (trimmedUrl.startsWith('data:')) {
    return isValidDataUri(trimmedUrl)
  }

  // Check for valid URL format
  try {
    const parsedUrl = new URL(trimmedUrl)
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false
    }

    // Check if URL has a valid image extension
    const pathname = parsedUrl.pathname.toLowerCase()
    const hasImageExtension = SUPPORTED_IMAGE_EXTENSIONS.some(ext => 
      pathname.endsWith(ext)
    )

    // Allow URLs without extension (could be dynamic image endpoints)
    // but require at least a valid URL structure
    return hasImageExtension || pathname.length > 1
  } catch {
    return false
  }
}

/**
 * Validates if a string is a valid data URI for an image
 * 
 * @param {string} dataUri - The data URI to validate
 * @returns {boolean} True if valid image data URI
 */
export function isValidDataUri(dataUri) {
  if (!dataUri || typeof dataUri !== 'string') {
    return false
  }

  // Data URI format: data:[<mediatype>][;base64],<data>
  const dataUriRegex = /^data:(image\/[a-zA-Z0-9.+-]+)(;base64)?,/
  const match = dataUri.match(dataUriRegex)
  
  if (!match) {
    return false
  }

  const mimeType = match[1]
  return SUPPORTED_IMAGE_TYPES.includes(mimeType)
}

/**
 * Converts a File object to a base64 data URL
 * 
 * Requirement 1.3: Convert local image file to base64 for insertion
 * 
 * @param {File} file - The file to convert
 * @returns {Promise<string>} Promise resolving to base64 data URL
 * @throws {Error} If file is invalid or conversion fails
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File || file instanceof Blob)) {
      reject(new Error('Invalid file: expected File or Blob object'))
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const result = reader.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('Failed to convert file to base64'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Validates an image file for size and format
 * 
 * Requirement 1.3: Validate file before conversion
 * Requirement 1.4: Reject invalid files
 * 
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @param {number} [options.maxSize=MAX_FILE_SIZE] - Maximum file size in bytes
 * @param {string[]} [options.allowedTypes=SUPPORTED_IMAGE_TYPES] - Allowed MIME types
 * @returns {{ valid: boolean, error?: string }} Validation result
 */
export function validateImageFile(file, options = {}) {
  const {
    maxSize = MAX_FILE_SIZE,
    allowedTypes = SUPPORTED_IMAGE_TYPES
  } = options

  // Check if file exists
  if (!file || !(file instanceof File || file instanceof Blob)) {
    return {
      valid: false,
      error: 'No file provided'
    }
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)
    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`
    }
  }

  // Check file size is not zero
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty'
    }
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = SUPPORTED_IMAGE_EXTENSIONS.join(', ')
    return {
      valid: false,
      error: `Unsupported file format. Allowed formats: ${allowedExtensions}`
    }
  }

  return { valid: true }
}

/**
 * Extracts image dimensions from a base64 data URL or URL
 * 
 * @param {string} src - Image source (URL or data URI)
 * @returns {Promise<{ width: number, height: number }>} Image dimensions
 */
export function getImageDimensions(src) {
  return new Promise((resolve, reject) => {
    if (!src || typeof src !== 'string') {
      reject(new Error('Invalid image source'))
      return
    }

    const img = new Image()
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = src
  })
}

/**
 * Calculates new dimensions while preserving aspect ratio
 * 
 * Requirement 2.2: Resize proportionally while maintaining aspect ratio
 * 
 * @param {number} originalWidth - Original width
 * @param {number} originalHeight - Original height
 * @param {Object} constraints - Size constraints
 * @param {number} [constraints.maxWidth] - Maximum width
 * @param {number} [constraints.maxHeight] - Maximum height
 * @param {number} [constraints.targetWidth] - Target width (height calculated)
 * @param {number} [constraints.targetHeight] - Target height (width calculated)
 * @returns {{ width: number, height: number }} New dimensions
 */
export function calculateAspectRatioDimensions(originalWidth, originalHeight, constraints = {}) {
  if (!originalWidth || !originalHeight || originalWidth <= 0 || originalHeight <= 0) {
    return { width: originalWidth || 0, height: originalHeight || 0 }
  }

  const aspectRatio = originalWidth / originalHeight
  let newWidth = originalWidth
  let newHeight = originalHeight

  // If target width is specified, calculate height
  if (constraints.targetWidth !== undefined && constraints.targetWidth > 0) {
    newWidth = constraints.targetWidth
    newHeight = Math.round(newWidth / aspectRatio)
  }
  // If target height is specified, calculate width
  else if (constraints.targetHeight !== undefined && constraints.targetHeight > 0) {
    newHeight = constraints.targetHeight
    newWidth = Math.round(newHeight * aspectRatio)
  }

  // Apply max constraints while preserving aspect ratio
  if (constraints.maxWidth && newWidth > constraints.maxWidth) {
    newWidth = constraints.maxWidth
    newHeight = Math.round(newWidth / aspectRatio)
  }

  if (constraints.maxHeight && newHeight > constraints.maxHeight) {
    newHeight = constraints.maxHeight
    newWidth = Math.round(newHeight * aspectRatio)
  }

  return {
    width: Math.max(1, newWidth),
    height: Math.max(1, newHeight)
  }
}

export default {
  isValidImageUrl,
  isValidDataUri,
  fileToBase64,
  validateImageFile,
  getImageDimensions,
  calculateAspectRatioDimensions,
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_IMAGE_EXTENSIONS,
  MAX_FILE_SIZE
}
