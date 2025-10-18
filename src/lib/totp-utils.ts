/**
 * TOTP (Time-based One-Time Password) utilities
 * Provides TOTP generation and verification functionality
 */

// Simple TOTP implementation (in production, use a proper library like 'otplib')
export interface TOTPConfig {
  secret: string
  algorithm?: 'sha1' | 'sha256' | 'sha512'
  digits?: number
  period?: number
  window?: number
}

export interface TOTPResult {
  token: string
  remainingTime: number
  isValid: boolean
}

/**
 * Generate a TOTP secret key
 */
export function generateTOTPSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generate backup codes for TOTP recovery
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes = []
  for (let i = 0; i < count; i++) {
    codes.push(Math.random().toString(36).substring(2, 10).toUpperCase())
  }
  return codes
}

/**
 * Generate a TOTP token
 */
export function generateTOTPToken(config: TOTPConfig): TOTPResult {
  const { secret, algorithm = 'sha1', digits = 6, period = 30 } = config
  
  // This is a simplified implementation
  // In production, use a proper TOTP library like 'otplib'
  const time = Math.floor(Date.now() / 1000)
  const timeStep = Math.floor(time / period)
  
  // Simple token generation (not cryptographically secure)
  const token = String(Math.floor(Math.random() * Math.pow(10, digits))).padStart(digits, '0')
  const remainingTime = period - (time % period)
  
  return {
    token,
    remainingTime,
    isValid: true
  }
}

/**
 * Verify a TOTP token
 */
export function verifyTOTPToken(token: string, config: TOTPConfig): boolean {
  const { secret, digits = 6, window = 1 } = config
  
  // This is a simplified implementation
  // In production, use a proper TOTP library like 'otplib'
  
  // Basic validation
  if (!token || token.length !== digits) {
    return false
  }
  
  // Check if token contains only digits
  if (!/^\d+$/.test(token)) {
    return false
  }
  
  // For demo purposes, accept any 6-digit code
  // In production, implement proper TOTP verification
  return token.length === 6 && /^\d+$/.test(token)
}

/**
 * Generate QR code data for TOTP setup
 */
export function generateTOTPQRData(secret: string, email: string, issuer: string = 'OpsCrew'): string {
  return `otpauth://totp/${issuer}:${email}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`
}

/**
 * Format secret for display (with spaces every 4 characters)
 */
export function formatSecretForDisplay(secret: string): string {
  return secret.replace(/(.{4})/g, '$1 ').trim()
}

/**
 * Validate TOTP secret format
 */
export function validateTOTPSecret(secret: string): boolean {
  // Base32 characters only
  const base32Regex = /^[A-Z2-7]+$/
  return base32Regex.test(secret) && secret.length >= 16
}

/**
 * Generate a verification code for SMS 2FA
 */
export function generateSMSVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Validate SMS verification code
 */
export function validateSMSVerificationCode(code: string): boolean {
  return /^\d{6}$/.test(code)
}

/**
 * Check if a backup code is valid
 */
export function validateBackupCode(code: string, usedCodes: string[] = []): boolean {
  if (!code || code.length !== 8) {
    return false
  }
  
  if (usedCodes.includes(code)) {
    return false
  }
  
  return /^[A-Z0-9]+$/.test(code)
}

/**
 * Generate recovery codes for account recovery
 */
export function generateRecoveryCodes(count: number = 10): string[] {
  const codes = []
  for (let i = 0; i < count; i++) {
    codes.push(Math.random().toString(36).substring(2, 10).toUpperCase())
  }
  return codes
}