# OpsCrew Authentication System

## Overview

The OpsCrew authentication system provides comprehensive security features including user registration, login, password management, two-factor authentication (2FA), session management, and advanced security measures.

## Features

### Core Authentication
- **User Registration**: Email/password signup with validation
- **User Login**: Email/password authentication with rate limiting
- **OAuth Integration**: Google and Apple sign-in support
- **Password Management**: Secure password reset and update flows
- **Email Verification**: Account verification with resend functionality

### Security Features
- **Two-Factor Authentication (2FA)**: TOTP and SMS support
- **Rate Limiting**: Protection against brute force attacks
- **Session Management**: Device tracking and session revocation
- **Input Validation**: XSS protection and data sanitization
- **Password Strength**: Comprehensive password validation
- **Security Headers**: HTTPS enforcement and secure context checks

### Advanced Features
- **Account Status Management**: Suspension and deletion handling
- **Role-Based Access Control**: Permission-based route protection
- **Device Fingerprinting**: Security monitoring and detection
- **Audit Logging**: Comprehensive activity tracking
- **Backup Codes**: TOTP recovery mechanism

## Architecture

### Database Schema

The authentication system uses the following Supabase tables:

#### `user_profiles`
Extended user information beyond Supabase's built-in `auth.users`:
- Personal information (name, company, phone)
- Account preferences (notifications, theme)
- Security settings (2FA status, failed attempts)
- Account status (active, suspended, deleted)

#### `user_sessions`
Active session tracking:
- Session tokens and refresh tokens
- Device information (browser, OS, location)
- Security flags (trusted device, reauth required)
- Activity timestamps

#### `user_2fa_secrets`
Two-factor authentication secrets:
- TOTP secrets and backup codes
- SMS phone numbers and verification codes
- Recovery codes and usage tracking

#### `password_reset_tokens`
Password reset token management:
- Secure token generation and validation
- Expiration and usage tracking
- IP address and user agent logging

#### `email_verification_tokens`
Email verification token management:
- Token generation and validation
- Email address tracking
- Security logging

### API Layer

The authentication API is organized into several modules:

#### `authAPI`
Core authentication functions:
- `signUp()`: User registration with validation
- `signIn()`: User login with rate limiting
- `signInWithOAuth()`: OAuth provider integration
- `signOut()`: Session termination
- `resetPassword()`: Password reset initiation
- `updatePassword()`: Password update
- `verifyEmail()`: Email verification
- `resendEmailVerification()`: Resend verification

#### `profileAPI`
User profile management:
- `getProfile()`: Retrieve user profile
- `updateProfile()`: Update profile information
- `createProfile()`: Create new profile

#### `sessionAPI`
Session management:
- `getSessions()`: List active sessions
- `createSession()`: Create new session
- `updateSession()`: Update session data
- `revokeSession()`: Revoke specific session
- `revokeAllSessions()`: Revoke all sessions

#### `twoFactorAPI`
2FA management:
- `getSecrets()`: Get 2FA secrets
- `upsertSecrets()`: Create/update secrets
- `updateSecrets()`: Update 2FA settings
- `deleteSecrets()`: Remove 2FA

### React Context

The `AuthContext` provides:
- Global authentication state
- User and profile information
- Authentication methods
- 2FA management
- Session handling

### React Query Hooks

Custom hooks for data fetching:
- `useSignUp()`: Sign up mutation
- `useSignIn()`: Sign in mutation
- `useSignOut()`: Sign out mutation
- `useProfile()`: Profile query
- `useSessions()`: Sessions query
- `useTwoFactorSecrets()`: 2FA secrets query

## Security Measures

### Rate Limiting
- **Login**: 5 attempts per 15 minutes
- **Signup**: 3 attempts per hour
- **Password Reset**: 3 attempts per hour
- **Email Verification**: 5 attempts per hour
- **2FA**: 3 attempts per 5 minutes

### Input Validation
- Email format validation
- Password strength requirements
- XSS protection with input sanitization
- SQL injection prevention
- File upload validation

### Password Security
- Minimum 8 characters
- Uppercase, lowercase, number, special character
- Common password detection
- Secure random generation
- Strength meter with real-time feedback

### Session Security
- Secure token generation
- Device fingerprinting
- IP address tracking
- User agent validation
- Session expiration
- Concurrent session limits

### 2FA Security
- TOTP with 30-second windows
- SMS verification codes
- Backup codes for recovery
- Secure secret generation
- QR code generation for setup

## Usage Examples

### Basic Authentication

```typescript
import { useAuth } from '@/hooks/useAuth'

function LoginComponent() {
  const { signIn, signUp, signOut, user, loading } = useAuth()
  
  const handleLogin = async (email: string, password: string) => {
    const { error } = await signIn(email, password)
    if (error) {
      console.error('Login failed:', error.message)
    }
  }
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {user ? (
        <div>Welcome, {user.email}!</div>
      ) : (
        <div>Please sign in</div>
      )}
    </div>
  )
}
```

### Protected Routes

```typescript
import { AuthMiddleware } from '@/components/auth/AuthMiddleware'

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={
        <AuthMiddleware requireAuth={true} requireEmailVerification={true}>
          <Dashboard />
        </AuthMiddleware>
      } />
    </Routes>
  )
}
```

### 2FA Setup

```typescript
import { useTwoFactorSecrets, useUpdateTwoFactorSecrets } from '@/hooks/useAuthQueries'

function TwoFactorSetup() {
  const { data: secrets } = useTwoFactorSecrets()
  const updateSecrets = useUpdateTwoFactorSecrets()
  
  const enableTOTP = async (code: string) => {
    await updateSecrets.mutateAsync({
      totp_enabled: true,
      totp_enabled_at: new Date().toISOString()
    })
  }
  
  return (
    <div>
      {/* 2FA setup UI */}
    </div>
  )
}
```

## Configuration

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Rate Limiting Configuration

```typescript
import { RATE_LIMITS } from '@/lib/rate-limit'

// Customize rate limits
const customLimits = {
  LOGIN: {
    maxAttempts: 3,
    windowMs: 30 * 60 * 1000, // 30 minutes
    keyPrefix: 'login'
  }
}
```

### Security Configuration

```typescript
import { isSecureEnvironment } from '@/lib/security-utils'

// Check security environment
if (!isSecureEnvironment()) {
  console.warn('Running in insecure environment')
}
```

## Testing

### Test Page

Access the authentication test page at `/auth-test` (development only):

- Test all authentication functions
- Monitor mutation status
- View current authentication state
- Test with custom parameters

### Test Functions

```typescript
import { authAPI } from '@/api/auth'

// Test sign up
const { data, error } = await authAPI.signUp('test@example.com', 'password123')

// Test sign in
const { data, error } = await authAPI.signIn('test@example.com', 'password123')

// Test password reset
const { error } = await authAPI.resetPassword('test@example.com')
```

## Error Handling

### Error Types

The authentication system uses custom error types:

```typescript
class AuthError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 400) {
    super(message)
    this.name = 'AuthError'
  }
}
```

### Common Error Codes

- `EMAIL_REQUIRED`: Email field is missing
- `INVALID_EMAIL`: Email format is invalid
- `PASSWORD_REQUIRED`: Password field is missing
- `PASSWORD_TOO_SHORT`: Password is too short
- `PASSWORD_WEAK`: Password doesn't meet strength requirements
- `RATE_LIMIT_EXCEEDED`: Too many attempts
- `LOGIN_FAILED`: Login credentials are invalid
- `SIGNUP_FAILED`: Registration failed
- `TOKEN_VERIFICATION_FAILED`: Token is invalid or expired

### Error Handling Example

```typescript
try {
  await authAPI.signIn(email, password)
} catch (error) {
  if (error instanceof AuthError) {
    switch (error.code) {
      case 'RATE_LIMIT_EXCEEDED':
        toast.error('Too many attempts. Please try again later.')
        break
      case 'LOGIN_FAILED':
        toast.error('Invalid email or password.')
        break
      default:
        toast.error(error.message)
    }
  }
}
```

## Best Practices

### Security
1. Always validate input on both client and server
2. Use HTTPS in production
3. Implement proper rate limiting
4. Store sensitive data securely
5. Use strong password requirements
6. Enable 2FA for sensitive accounts

### Performance
1. Use React Query for caching
2. Implement optimistic updates
3. Debounce user input
4. Lazy load authentication components
5. Minimize re-renders

### User Experience
1. Provide clear error messages
2. Show loading states
3. Implement password strength meter
4. Use progressive enhancement
5. Provide helpful guidance

## Troubleshooting

### Common Issues

1. **Rate Limiting**: Check if user has exceeded attempt limits
2. **Token Expiration**: Implement proper token refresh
3. **CORS Issues**: Configure Supabase CORS settings
4. **Session Conflicts**: Handle concurrent sessions properly
5. **2FA Setup**: Ensure proper secret generation and validation

### Debug Mode

Enable debug mode in development:

```typescript
// In development
if (import.meta.env.DEV) {
  console.log('Auth state:', { user, profile, loading })
}
```

### Logging

The system provides comprehensive logging:

```typescript
// Authentication events
console.log('User signed in:', user.email)
console.log('Session created:', session.id)
console.log('2FA enabled:', profile.two_factor_enabled)
```

## Migration Guide

### Upgrading from Basic Auth

1. Install new dependencies
2. Update environment variables
3. Run database migrations
4. Update component imports
5. Test all authentication flows

### Database Migrations

```sql
-- Run migrations in order
-- 1. Create user profiles table
-- 2. Create sessions table
-- 3. Create 2FA secrets table
-- 4. Create token tables
-- 5. Set up RLS policies
```

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review error logs
3. Test with the auth test page
4. Contact support: support@opscrew.ai

## Changelog

### v1.0.0
- Initial authentication system
- Basic login/signup functionality
- Password reset flows
- Email verification

### v1.1.0
- Added 2FA support
- Session management
- Rate limiting
- Enhanced security

### v1.2.0
- OAuth integration
- Advanced error handling
- Security middleware
- Comprehensive testing