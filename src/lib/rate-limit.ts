/**
 * Rate limiting utilities
 * Provides client-side rate limiting for authentication endpoints
 */

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  keyPrefix: string
}

interface RateLimitEntry {
  attempts: number
  resetTime: number
  blocked: boolean
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  /**
   * Check if an action is allowed
   */
  isAllowed(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.storage.get(key)
    
    if (!entry) {
      // First attempt
      this.storage.set(key, {
        attempts: 1,
        resetTime: now + this.config.windowMs,
        blocked: false
      })
      
      return {
        allowed: true,
        remaining: this.config.maxAttempts - 1,
        resetTime: now + this.config.windowMs
      }
    }

    // Check if window has expired
    if (now > entry.resetTime) {
      // Reset the entry
      this.storage.set(key, {
        attempts: 1,
        resetTime: now + this.config.windowMs,
        blocked: false
      })
      
      return {
        allowed: true,
        remaining: this.config.maxAttempts - 1,
        resetTime: now + this.config.windowMs
      }
    }

    // Check if blocked
    if (entry.blocked) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }

    // Check if max attempts reached
    if (entry.attempts >= this.config.maxAttempts) {
      entry.blocked = true
      this.storage.set(key, entry)
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }

    // Increment attempts
    entry.attempts++
    this.storage.set(key, entry)
    
    return {
      allowed: true,
      remaining: this.config.maxAttempts - entry.attempts,
      resetTime: entry.resetTime
    }
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.storage.delete(key)
  }

  /**
   * Get remaining attempts for a key
   */
  getRemaining(key: string): number {
    const entry = this.storage.get(key)
    if (!entry) {
      return this.config.maxAttempts
    }
    
    if (Date.now() > entry.resetTime) {
      return this.config.maxAttempts
    }
    
    return Math.max(0, this.config.maxAttempts - entry.attempts)
  }

  /**
   * Check if key is blocked
   */
  isBlocked(key: string): boolean {
    const entry = this.storage.get(key)
    if (!entry) {
      return false
    }
    
    if (Date.now() > entry.resetTime) {
      return false
    }
    
    return entry.blocked
  }

  /**
   * Get time until reset
   */
  getTimeUntilReset(key: string): number {
    const entry = this.storage.get(key)
    if (!entry) {
      return 0
    }
    
    const now = Date.now()
    return Math.max(0, entry.resetTime - now)
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.storage.clear()
  }
}

// Rate limit configurations
export const RATE_LIMITS = {
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyPrefix: 'login'
  },
  SIGNUP: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyPrefix: 'signup'
  },
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyPrefix: 'password_reset'
  },
  EMAIL_VERIFICATION: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyPrefix: 'email_verification'
  },
  TWO_FA: {
    maxAttempts: 3,
    windowMs: 5 * 60 * 1000, // 5 minutes
    keyPrefix: 'two_fa'
  }
} as const

// Create rate limiter instances
export const loginRateLimiter = new RateLimiter(RATE_LIMITS.LOGIN)
export const signupRateLimiter = new RateLimiter(RATE_LIMITS.SIGNUP)
export const passwordResetRateLimiter = new RateLimiter(RATE_LIMITS.PASSWORD_RESET)
export const emailVerificationRateLimiter = new RateLimiter(RATE_LIMITS.EMAIL_VERIFICATION)
export const twoFARateLimiter = new RateLimiter(RATE_LIMITS.TWO_FA)

/**
 * Get rate limit key for a specific action and identifier
 */
export function getRateLimitKey(action: keyof typeof RATE_LIMITS, identifier: string): string {
  const config = RATE_LIMITS[action]
  return `${config.keyPrefix}:${identifier}`
}

/**
 * Format time remaining in human-readable format
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) {
    return '0 seconds'
  }
  
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${seconds > 1 ? 's' : ''}`
  }
  
  return `${seconds} second${seconds > 1 ? 's' : ''}`
}

/**
 * Check if an IP address is likely to be a bot
 */
export function isLikelyBot(userAgent: string, ip: string): boolean {
  // Simple bot detection based on user agent patterns
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /go-http/i,
    /okhttp/i
  ]
  
  // Check user agent
  if (botPatterns.some(pattern => pattern.test(userAgent))) {
    return true
  }
  
  // Check for missing or suspicious user agent
  if (!userAgent || userAgent.length < 10) {
    return true
  }
  
  // Check for common browser patterns
  const browserPatterns = [
    /mozilla/i,
    /chrome/i,
    /safari/i,
    /firefox/i,
    /edge/i
  ]
  
  if (!browserPatterns.some(pattern => pattern.test(userAgent))) {
    return true
  }
  
  return false
}

/**
 * Generate a secure random string for CSRF protection
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) {
    return false
  }
  
  return token === storedToken
}