import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'fallback-secret-key-change-this-in-production';

export function signToken(payload: any) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '30d' });
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (e) {
        return null;
    }
}
