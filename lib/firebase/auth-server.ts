import { NextRequest } from 'next/server';
import { adminAuth } from './admin';

export interface AuthenticatedRequest extends NextRequest {
    user: {
        uid: string;
        email: string;
    };
}

export async function verifyAuthToken(token: string) {
    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        throw new Error('Invalid auth token');
    }
}

export function validateAuthHeader(authHeader: string | null): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or invalid authorization header');
    }
    return authHeader.split('Bearer ')[1];
}

export async function authenticateServerRequest(req: NextRequest): Promise<AuthenticatedRequest> {
    const authHeader = req.headers.get('authorization');
    const token = validateAuthHeader(authHeader);
    const decodedToken = await verifyAuthToken(token);

    return Object.assign(req, {
        user: {
            uid: decodedToken.uid,
            email: decodedToken.email || '',
        },
    }) as AuthenticatedRequest;
}