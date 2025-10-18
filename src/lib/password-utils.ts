/**
 * Password utilities and validation
 * Provides password strength checking and validation functions
 */

export interface PasswordStrength {
  score: number // 0-4
  feedback: string[]
  isStrong: boolean
  requirements: {
    length: boolean
    lowercase: boolean
    uppercase: boolean
    number: boolean
    special: boolean
  }
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = []
  const requirements = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  let score = 0

  // Length requirement
  if (requirements.length) {
    score++
  } else {
    feedback.push('Password must be at least 8 characters long')
  }

  // Lowercase requirement
  if (requirements.lowercase) {
    score++
  } else {
    feedback.push('Password must contain at least one lowercase letter')
  }

  // Uppercase requirement
  if (requirements.uppercase) {
    score++
  } else {
    feedback.push('Password must contain at least one uppercase letter')
  }

  // Number requirement
  if (requirements.number) {
    score++
  } else {
    feedback.push('Password must contain at least one number')
  }

  // Special character requirement
  if (requirements.special) {
    score++
  } else {
    feedback.push('Password must contain at least one special character')
  }

  // Additional strength checks
  if (password.length >= 12) score += 0.5
  if (password.length >= 16) score += 0.5
  if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) score += 0.5

  // Cap score at 4
  score = Math.min(score, 4)

  return {
    score: Math.floor(score),
    feedback,
    isStrong: score >= 3,
    requirements,
  }
}

export function getPasswordStrengthColor(score: number): string {
  if (score === 0) return 'bg-gray-500'
  if (score === 1) return 'bg-red-500'
  if (score === 2) return 'bg-orange-500'
  if (score === 3) return 'bg-yellow-500'
  if (score === 4) return 'bg-green-500'
  return 'bg-gray-500'
}

export function getPasswordStrengthText(score: number): string {
  if (score === 0) return 'Very Weak'
  if (score === 1) return 'Weak'
  if (score === 2) return 'Fair'
  if (score === 3) return 'Good'
  if (score === 4) return 'Strong'
  return 'Very Weak'
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const strength = checkPasswordStrength(password)
  const errors: string[] = []

  if (!strength.requirements.length) {
    errors.push('Password must be at least 8 characters long')
  }
  if (!strength.requirements.lowercase) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!strength.requirements.uppercase) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!strength.requirements.number) {
    errors.push('Password must contain at least one number')
  }
  if (!strength.requirements.special) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function generateSecurePassword(length = 16): string {
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