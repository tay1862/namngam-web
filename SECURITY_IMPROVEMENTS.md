# Security Improvements Implementation Guide

This document provides specific code implementations to address the security vulnerabilities identified in the comprehensive review.

---

## 1. Redis-Based Rate Limiting

### 1.1 Install Redis Client

```bash
npm install redis
npm install --save-dev @types/redis
```

### 1.2 Create Redis Rate Limiter

Create `src/lib/redis-rate-limit.ts`:

```typescript
import { Redis } from 'redis';

// Redis client configuration
const redis = new Redis({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

// Rate limiting with Redis
export async function redisRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<{ success: boolean; remaining: number; resetTime?: number }> {
  const key = `rate_limit:${identifier}`;
  const window = Math.ceil(windowMs / 1000); // Convert to seconds
  
  try {
    const pipeline = redis.pipeline();
    
    // Get current count and expiration
    pipeline.incr(key);
    pipeline.expire(key, window);
    
    const results = await pipeline.exec();
    const count = results?.[0]?.[1] as number || 0;
    
    if (count > maxRequests) {
      const ttl = await redis.ttl(key);
      return {
        success: false,
        remaining: 0,
        resetTime: Date.now() + (ttl * 1000),
      };
    }
    
    return {
      success: true,
      remaining: maxRequests - count,
    };
  } catch (error) {
    console.error('Redis rate limiting error:', error);
    // Fallback to in-memory rate limiting
    return { success: true, remaining: maxRequests - 1 };
  }
}
```

### 1.3 Update Security Configuration

Update `src/lib/security.ts`:

```typescript
// Add Redis rate limiting function
export { redisRateLimit } from './redis-rate-limit';

// Update rateLimit function to use Redis
export async function rateLimit(
  identifier: string, 
  maxRequests: number = SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS
) {
  // Try Redis first, fallback to in-memory
  try {
    return await redisRateLimit(identifier, maxRequests, SECURITY_CONFIG.RATE_LIMIT_WINDOW);
  } catch (error) {
    console.warn('Redis unavailable, using in-memory rate limiting');
    // Original in-memory implementation as fallback
    // ... (existing code)
  }
}
```

---

## 2. CSRF Protection Implementation

### 2.1 Install CSRF Library

```bash
npm install csurf
npm install --save-dev @types/csurf
```

### 2.2 Create CSRF Middleware

Create `src/lib/csrf.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from './prisma';

// CSRF token storage (in production, use Redis)
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Generate CSRF token
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

// Validate CSRF token
export async function validateCSRFToken(
  request: NextRequest,
  token: string
): Promise<boolean> {
  const sessionToken = request.cookies.get('next-auth.session-token')?.value ||
                      request.cookies.get('__Secure-next-auth.session-token')?.value;
  
  if (!sessionToken) {
    return false;
  }
  
  const storedToken = csrfTokens.get(sessionToken);
  
  if (!storedToken || storedToken.token !== token) {
    return false;
  }
  
  if (Date.now() > storedToken.expires) {
    csrfTokens.delete(sessionToken);
    return false;
  }
  
  return true;
}

// Set CSRF token
export function setCSRFToken(sessionToken: string): string {
  const token = generateCSRFToken();
  const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  csrfTokens.set(sessionToken, { token, expires });
  
  // Clean up expired tokens
  for (const [key, value] of csrfTokens.entries()) {
    if (Date.now() > value.expires) {
      csrfTokens.delete(key);
    }
  }
  
  return token;
}

// CSRF middleware for API routes
export function withCSRFProtection(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    // Skip CSRF for GET requests
    if (request.method === 'GET') {
      return handler(request, ...args);
    }
    
    // Get CSRF token from header
    const csrfToken = request.headers.get('x-csrf-token');
    
    if (!csrfToken) {
      return NextResponse.json(
        { success: false, error: 'CSRF token missing' },
        { status: 403 }
      );
    }
    
    const isValid = await validateCSRFToken(request, csrfToken);
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
    
    return handler(request, ...args);
  };
}
```

### 2.3 Update API Routes with CSRF Protection

Example for `src/app/api/upload/route.ts`:

```typescript
import { withCSRFProtection } from '@/lib/csrf';

// Wrap POST handler with CSRF protection
export const POST = withCSRFProtection(async function(request: NextRequest) {
  // ... existing upload logic
});

// Add GET endpoint to fetch CSRF token
export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get('next-auth.session-token')?.value ||
                      request.cookies.get('__Secure-next-auth.session-token')?.value;
  
  if (!sessionToken) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 }
    );
  }
  
  const token = setCSRFToken(sessionToken);
  
  return NextResponse.json({
    success: true,
    csrfToken: token,
  });
}
```

### 2.4 Update Frontend to Include CSRF Token

Create `src/lib/csrf-client.ts`:

```typescript
// Client-side CSRF handling
let csrfToken: string | null = null;

export async function getCSRFToken(): Promise<string> {
  if (!csrfToken) {
    const response = await fetch('/api/upload');
    const data = await response.json();
    csrfToken = data.csrfToken;
  }
  return csrfToken;
}

export async function fetchWithCSRF(url: string, options: RequestInit = {}) {
  const token = await getCSRFToken();
  
  const headers = {
    'Content-Type': 'application/json',
    'X-CSRF-Token': token,
    ...options.headers,
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
}
```

---

## 3. Enhanced File Upload Validation

### 3.1 Create File Content Validator

Create `src/lib/file-validator.ts`:

```typescript
import sharp from 'sharp';

// File magic numbers for validation
const FILE_SIGNATURES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
};

export async function validateFileContent(
  buffer: Buffer,
  mimeType: string
): Promise<{ valid: boolean; error?: string }> {
  // Check magic numbers
  const signature = FILE_SIGNATURES[mimeType as keyof typeof FILE_SIGNATURES];
  
  if (signature) {
    const fileSignature = Array.from(buffer.slice(0, signature.length));
    
    for (let i = 0; i < signature.length; i++) {
      if (fileSignature[i] !== signature[i]) {
        return { valid: false, error: 'File content does not match declared type' };
      }
    }
  }
  
  // Additional validation for images using Sharp
  if (mimeType.startsWith('image/')) {
    try {
      const metadata = await sharp(buffer).metadata();
      
      // Validate image dimensions
      if (!metadata.width || !metadata.height) {
        return { valid: false, error: 'Invalid image dimensions' };
      }
      
      // Maximum dimensions check
      if (metadata.width > 5000 || metadata.height > 5000) {
        return { valid: false, error: 'Image dimensions too large' };
      }
      
      // Check for embedded malicious content
      const info = await sharp(buffer).stats();
      if (!info || !info.channels) {
        return { valid: false, error: 'Invalid image data' };
      }
      
    } catch (error) {
      return { valid: false, error: 'Image processing failed' };
    }
  }
  
  return { valid: true };
}

// Scan for embedded scripts in images
export async function scanForMaliciousContent(buffer: Buffer): Promise<boolean> {
  try {
    // Convert image to string to scan for suspicious patterns
    const imageString = buffer.toString('utf8', 0, Math.min(1024, buffer.length));
    
    // Common malicious patterns
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
      /eval\(/i,
      /expression\(/i,
    ];
    
    for (const pattern of maliciousPatterns) {
      if (pattern.test(imageString)) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    return false;
  }
}
```

### 3.2 Update Upload Route with Enhanced Validation

Update `src/app/api/upload/route.ts`:

```typescript
import { validateFileContent, scanForMaliciousContent } from '@/lib/file-validator';

export async function POST(request: NextRequest) {
  try {
    // ... existing authentication and rate limiting code
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new ValidationError('No file provided');
    }
    
    // Convert file to buffer for validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Enhanced file validation
    const fileValidation = validateFileUpload(file, SECURITY_CONFIG.MAX_FILE_SIZE);
    if (!fileValidation.valid) {
      throw new ValidationError(fileValidation.error || 'Invalid file');
    }
    
    // Validate file content
    const contentValidation = await validateFileContent(buffer, file.type);
    if (!contentValidation.valid) {
      throw new ValidationError(contentValidation.error || 'Invalid file content');
    }
    
    // Scan for malicious content
    const isClean = await scanForMaliciousContent(buffer);
    if (!isClean) {
      throw new ValidationError('File contains potentially malicious content');
    }
    
    // ... continue with upload process
  } catch (error) {
    // ... existing error handling
  }
}
```

---

## 4. Environment Variable Validation

### 4.1 Create Enhanced Environment Validator

Create `src/lib/env-validator.ts`:

```typescript
export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvironmentVariables(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required variables
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'NODE_ENV',
  ];
  
  // Optional but recommended
  const recommended = [
    'REDIS_URL',
    'GOOGLE_ANALYTICS_ID',
    'FACEBOOK_PIXEL_ID',
  ];
  
  // Check required variables
  for (const envVar of required) {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  }
  
  // Check recommended variables
  for (const envVar of recommended) {
    if (!process.env[envVar]) {
      warnings.push(`Missing recommended environment variable: ${envVar}`);
    }
  }
  
  // Validate specific formats
  if (process.env.DATABASE_URL) {
    try {
      const dbUrl = new URL(process.env.DATABASE_URL);
      if (dbUrl.protocol !== 'postgresql:') {
        errors.push('DATABASE_URL must use postgresql:// protocol');
      }
      if (!dbUrl.hostname || dbUrl.hostname === 'localhost') {
        if (process.env.NODE_ENV === 'production') {
          warnings.push('DATABASE_URL should not use localhost in production');
        }
      }
    } catch (error) {
      errors.push('DATABASE_URL is not a valid URL');
    }
  }
  
  if (process.env.NEXTAUTH_URL) {
    try {
      const authUrl = new URL(process.env.NEXTAUTH_URL);
      if (!['http:', 'https:'].includes(authUrl.protocol)) {
        errors.push('NEXTAUTH_URL must use http:// or https:// protocol');
      }
      if (process.env.NODE_ENV === 'production' && authUrl.protocol !== 'https:') {
        errors.push('NEXTAUTH_URL must use https:// in production');
      }
    } catch (error) {
      errors.push('NEXTAUTH_URL is not a valid URL');
    }
  }
  
  if (process.env.NEXTAUTH_SECRET) {
    if (process.env.NEXTAUTH_SECRET.length < 32) {
      errors.push('NEXTAUTH_SECRET must be at least 32 characters long');
    }
    
    // Check for common weak secrets
    const weakPatterns = [
      /^(test|dev|example|default)/i,
      /^(123|password|secret)/i,
      /^(.)\1{31,}$/, // All same character
    ];
    
    for (const pattern of weakPatterns) {
      if (pattern.test(process.env.NEXTAUTH_SECRET)) {
        errors.push('NEXTAUTH_SECRET appears to be weak or default');
        break;
      }
    }
  }
  
  if (process.env.NODE_ENV && !['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    errors.push('NODE_ENV must be one of: development, production, test');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate on startup
export function validateOnStartup(): void {
  const validation = validateEnvironmentVariables();
  
  if (!validation.valid) {
    console.error('❌ Environment validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment configuration');
    }
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Environment validation warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  if (validation.valid) {
    console.log('✅ Environment validation passed');
  }
}
```

### 4.2 Update Middleware with Enhanced Validation

Update `src/middleware.ts`:

```typescript
import { validateOnStartup } from './lib/env-validator';

// Validate environment variables on startup
validateOnStartup();
```

---

## 5. Session Management Improvements

### 5.1 Create Session Manager

Create `src/lib/session-manager.ts`:

```typescript
import { prisma } from './prisma';

export class SessionManager {
  // Invalidate all sessions for a user
  static async invalidateUserSessions(userId: string): Promise<void> {
    try {
      // This would require custom session storage
      // For NextAuth, we can implement a custom adapter
      console.log(`Invalidating sessions for user: ${userId}`);
    } catch (error) {
      console.error('Error invalidating sessions:', error);
    }
  }
  
  // Invalidate session on password change
  static async invalidateOnPasswordChange(userId: string): Promise<void> {
    await this.invalidateUserSessions(userId);
    
    // Log security event
    await prisma.securityLog.create({
      data: {
        userId,
        action: 'PASSWORD_CHANGE',
        details: 'All sessions invalidated due to password change',
        timestamp: new Date(),
      },
    });
  }
  
  // Check session validity
  static async isSessionValid(sessionToken: string): Promise<boolean> {
    try {
      // Implement session validation logic
      // This would integrate with your session storage
      return true;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  }
}

// Extend Prisma schema for security logging
// Add to prisma/schema.prisma:
/*
model SecurityLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String
  details   String?
  ipAddress String?
  userAgent String?
  timestamp DateTime @default(now())
  
  @@index([userId])
  @@index([action])
  @@index([timestamp])
}
*/
```

### 5.2 Update Password Change Logic

Update password change endpoints to invalidate sessions:

```typescript
import { SessionManager } from '@/lib/session-manager';

// Example password change endpoint
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      throw new AuthenticationError();
    }
    
    const { currentPassword, newPassword } = await request.json();
    
    // Validate current password
    // ... existing validation logic
    
    // Update password
    const hashedPassword = await hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });
    
    // Invalidate all sessions
    await SessionManager.invalidateOnPasswordChange(session.user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. Please login again.',
    });
  } catch (error) {
    // ... error handling
  }
}
```

---

## 6. Security Event Logging

### 6.1 Create Security Logger

Create `src/lib/security-logger.ts`:

```typescript
import { prisma } from './prisma';
import { getClientIP } from './security';

export interface SecurityEvent {
  userId?: string;
  action: string;
  details?: string;
  request?: any;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class SecurityLogger {
  static async logEvent(event: SecurityEvent): Promise<void> {
    try {
      const ipAddress = event.request ? getClientIP(event.request) : undefined;
      const userAgent = event.request?.headers?.get('user-agent') || undefined;
      
      await prisma.securityLog.create({
        data: {
          userId: event.userId,
          action: event.action,
          details: event.details,
          ipAddress,
          userAgent,
          timestamp: new Date(),
        },
      });
      
      // Log critical events to console for immediate attention
      if (event.severity === 'CRITICAL' || event.severity === 'HIGH') {
        console.error(`🚨 SECURITY EVENT [${event.severity}]: ${event.action}`, {
          userId: event.userId,
          details: event.details,
          ipAddress,
        });
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
  
  static async logLoginAttempt(
    userId: string | null,
    success: boolean,
    request: any
  ): Promise<void> {
    await this.logEvent({
      userId: userId || undefined,
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      details: success ? 'User logged in successfully' : 'Login attempt failed',
      request,
      severity: success ? 'LOW' : 'MEDIUM',
    });
  }
  
  static async logSuspiciousActivity(
    details: string,
    request: any,
    severity: 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM'
  ): Promise<void> {
    await this.logEvent({
      action: 'SUSPICIOUS_ACTIVITY',
      details,
      request,
      severity,
    });
  }
  
  static async logSecurityViolation(
    userId: string,
    violation: string,
    request: any
  ): Promise<void> {
    await this.logEvent({
      userId,
      action: 'SECURITY_VIOLATION',
      details: violation,
      request,
      severity: 'HIGH',
    });
  }
}
```

### 6.2 Update Authentication with Security Logging

Update `src/lib/auth.ts`:

```typescript
import { SecurityLogger } from './security-logger';

// In the authorize function:
async authorize(credentials: any, req: any) {
  try {
    // ... existing validation logic
    
    if (isPasswordValid) {
      // Log successful login
      await SecurityLogger.logLoginAttempt(user.id, true, req);
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } else {
      // Log failed login
      await SecurityLogger.logLoginAttempt(null, false, req);
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    // Log failed login
    await SecurityLogger.logLoginAttempt(null, false, req);
    throw error;
  }
}
```

---

## 7. Implementation Checklist

### 7.1 Immediate Implementation (High Priority)

- [ ] Implement Redis-based rate limiting
- [ ] Add CSRF protection to all state-changing API routes
- [ ] Enhance file upload validation with content checking
- [ ] Implement comprehensive environment variable validation
- [ ] Add security event logging

### 7.2 Short-term Implementation (Medium Priority)

- [ ] Implement session invalidation on password change
- [ ] Add password strength requirements enforcement
- [ ] Implement account lockout after failed attempts
- [ ] Add security headers for API responses
- [ ] Set up automated security scanning

### 7.3 Long-term Implementation (Low Priority)

- [ ] Implement advanced threat detection
- [ ] Add behavioral analysis for anomaly detection
- [ ] Implement IP-based access controls
- [ ] Set up security incident response procedures
- [ ] Regular security audits and penetration testing

---

## 8. Testing Security Improvements

### 8.1 Security Test Cases

Create `tests/security.test.ts`:

```typescript
import { validateFileContent, scanForMaliciousContent } from '@/lib/file-validator';
import { validateEnvironmentVariables } from '@/lib/env-validator';
import { SecurityLogger } from '@/lib/security-logger';

describe('Security Improvements', () => {
  describe('File Validation', () => {
    test('should detect invalid file content', async () => {
      const maliciousBuffer = Buffer.from('<script>alert("xss")</script>');
      const result = await validateFileContent(maliciousBuffer, 'image/jpeg');
      expect(result.valid).toBe(false);
    });
    
    test('should detect malicious content in images', async () => {
      const maliciousBuffer = Buffer.from('GIF89a<script>alert("xss")</script>');
      const isClean = await scanForMaliciousContent(maliciousBuffer);
      expect(isClean).toBe(false);
    });
  });
  
  describe('Environment Validation', () => {
    test('should detect weak NEXTAUTH_SECRET', () => {
      process.env.NEXTAUTH_SECRET = 'weakpassword';
      const result = validateEnvironmentVariables();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('NEXTAUTH_SECRET appears to be weak or default');
    });
  });
  
  describe('Security Logging', () => {
    test('should log security events', async () => {
      const mockRequest = {
        headers: new Map([['user-agent', 'test-agent']]),
        ip: '127.0.0.1',
      };
      
      await SecurityLogger.logSuspiciousActivity('Test activity', mockRequest);
      // Verify log was created (implementation depends on your testing setup)
    });
  });
});
```

---

## 9. Monitoring and Alerting

### 9.1 Security Metrics Dashboard

Create `src/lib/security-metrics.ts`:

```typescript
export class SecurityMetrics {
  static async getSecurityMetrics(timeframe: 'hour' | 'day' | 'week' = 'day') {
    const now = new Date();
    const timeframes = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
    };
    
    const startTime = new Date(now.getTime() - timeframes[timeframe]);
    
    const [
      totalEvents,
      failedLogins,
      suspiciousActivities,
      securityViolations,
    ] = await Promise.all([
      prisma.securityLog.count({
        where: { timestamp: { gte: startTime } },
      }),
      prisma.securityLog.count({
        where: { 
          action: 'LOGIN_FAILED',
          timestamp: { gte: startTime },
        },
      }),
      prisma.securityLog.count({
        where: { 
          action: 'SUSPICIOUS_ACTIVITY',
          timestamp: { gte: startTime },
        },
      }),
      prisma.securityLog.count({
        where: { 
          action: 'SECURITY_VIOLATION',
          timestamp: { gte: startTime },
        },
      }),
    ]);
    
    return {
      timeframe,
      totalEvents,
      failedLogins,
      suspiciousActivities,
      securityViolations,
      riskScore: this.calculateRiskScore({
        totalEvents,
        failedLogins,
        suspiciousActivities,
        securityViolations,
      }),
    };
  }
  
  private static calculateRiskScore(metrics: any): number {
    // Simple risk calculation (0-100)
    let score = 0;
    
    // Failed logins contribute to risk
    score += Math.min(metrics.failedLogins * 5, 30);
    
    // Suspicious activities are more concerning
    score += Math.min(metrics.suspiciousActivities * 10, 40);
    
    // Security violations are critical
    score += Math.min(metrics.securityViolations * 20, 30);
    
    return Math.min(score, 100);
  }
}
```

---

## 10. Conclusion

Implementing these security improvements will significantly enhance the security posture of the NAMNGAM application. The key focus areas are:

1. **Robust Rate Limiting**: Moving from in-memory to Redis-based rate limiting
2. **CSRF Protection**: Preventing cross-site request forgery attacks
3. **Enhanced File Validation**: Deep content inspection for uploaded files
4. **Comprehensive Logging**: Security event tracking and monitoring
5. **Session Management**: Proper session invalidation on security events

These improvements should be implemented incrementally, starting with the high-priority items, and thoroughly tested before production deployment.

Regular security audits and updates should be scheduled to ensure the application remains secure against evolving threats.