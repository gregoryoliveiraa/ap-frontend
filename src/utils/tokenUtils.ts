/**
 * Token utilities for handling JWT tokens
 */

export interface TokenData {
  /**
   * Expiration timestamp (in seconds since epoch)
   */
  exp: number;
  
  /**
   * Subject (user ID)
   */
  sub: string;
}

/**
 * Decode a JWT token without using external libraries
 * @param token JWT token string to decode
 * @returns Decoded token payload or null if invalid
 */
export function decodeJWT<T = TokenData>(token: string): T | null {
  try {
    // JWT structure: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Base64 decode the payload
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
} 