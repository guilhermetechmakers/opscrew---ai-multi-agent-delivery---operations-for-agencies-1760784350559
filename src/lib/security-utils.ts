/**
 * Security utilities
 * Provides security-related helper functions
 */

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format (international)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): {
  score: number
  feedback: string[]
  isStrong: boolean
} {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) {
    score++
  } else {
    feedback.push('Password must be at least 8 characters long')
  }

  // Character variety checks
  if (/[a-z]/.test(password)) {
    score++
  } else {
    feedback.push('Password must contain at least one lowercase letter')
  }

  if (/[A-Z]/.test(password)) {
    score++
  } else {
    feedback.push('Password must contain at least one uppercase letter')
  }

  if (/\d/.test(password)) {
    score++
  } else {
    feedback.push('Password must contain at least one number')
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++
  } else {
    feedback.push('Password must contain at least one special character')
  }

  // Additional strength checks
  if (password.length >= 12) score += 0.5
  if (password.length >= 16) score += 0.5
  if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
    score += 0.5
  }

  // Cap score at 5
  score = Math.min(score, 5)

  return {
    score: Math.floor(score),
    feedback,
    isStrong: score >= 3
  }
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  const allChars = lowercase + uppercase + numbers + special
  let password = ''
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * Hash a string using Web Crypto API
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Check if a string contains suspicious patterns
 */
export function containsSuspiciousPatterns(input: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
    /vbscript:/i,
    /data:text\/html/i,
    /data:application\/javascript/i
  ]
  
  return suspiciousPatterns.some(pattern => pattern.test(input))
}

/**
 * Validate and sanitize file upload
 */
export function validateFileUpload(file: File, allowedTypes: string[], maxSize: number): {
  isValid: boolean
  error?: string
} {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    }
  }
  
  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size ${file.size} bytes exceeds maximum allowed size of ${maxSize} bytes`
    }
  }
  
  // Check file name for suspicious patterns
  if (containsSuspiciousPatterns(file.name)) {
    return {
      isValid: false,
      error: 'File name contains suspicious patterns'
    }
  }
  
  return { isValid: true }
}

/**
 * Check if a URL is safe
 */
export function isSafeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    
    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false
    }
    
    // Check for suspicious patterns in the URL
    if (containsSuspiciousPatterns(url)) {
      return false
    }
    
    return true
  } catch {
    return false
  }
}

/**
 * Generate a device fingerprint
 */
export function generateDeviceFingerprint(): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Device fingerprint', 2, 2)
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|')
  
  return btoa(fingerprint)
}

/**
 * Check if the current environment is secure
 */
export function isSecureEnvironment(): boolean {
  // Check if running on HTTPS
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    return false
  }
  
  // Check for secure context
  if (!window.isSecureContext) {
    return false
  }
  
  return true
}

/**
 * Validate session token format
 */
export function isValidSessionToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false
  }
  
  // Basic format validation (adjust based on your token format)
  return token.length >= 32 && /^[A-Za-z0-9+/=]+$/.test(token)
}

/**
 * Check if a string is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Check if a password has been compromised (basic check)
 */
export function isPasswordCompromised(password: string): boolean {
  // Common weak passwords
  const weakPasswords = [
    'password',
    '123456',
    '123456789',
    'qwerty',
    'abc123',
    'password123',
    'admin',
    'letmein',
    'welcome',
    'monkey',
    '1234567890',
    'dragon',
    'master',
    'hello',
    'freedom',
    'whatever',
    'qazwsx',
    'trustno1',
    'jordan',
    'jennifer',
    'zxcvbnm',
    'asdfgh',
    'hunter',
    'buster',
    'soccer',
    'hockey',
    'killer',
    'george',
    'sexy',
    'andrew',
    'charlie',
    'superman',
    'asshole',
    'fuckyou',
    'dallas',
    'jessica',
    'panties',
    'pepper',
    '1234',
    '6969',
    'killer',
    'trustno1',
    'jordan',
    'jennifer',
    'zxcvbnm',
    'asdfgh',
    'hunter',
    'buster',
    'soccer',
    'hockey',
    'killer',
    'george',
    'sexy',
    'andrew',
    'charlie',
    'superman',
    'asshole',
    'fuckyou',
    'dallas',
    'jessica',
    'panties',
    'pepper',
    '1234',
    '6969'
  ]
  
  return weakPasswords.includes(password.toLowerCase())
}