import * as jwt from 'jsonwebtoken';

/**
 * Generate JWT token with the provided payload
 * @param payload - The data to encode in the JWT
 * @returns JWT token string
 */
export function generateJwtToken(payload: any): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload, secret, { expiresIn: '1h' });
}