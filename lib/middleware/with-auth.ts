import { auth } from '@/lib/firebase';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/firebase';

export async function withAuth(handler: Function) {
    return async (req: NextRequest) => {
        try {
            const token = req.headers.get('Authorization')?.split('Bearer ')[1];

            if (!token) {
                return NextResponse.json(
                    { error: 'No authentication token provided' },
                    { status: 401 }
                );
            }

            const decodedToken = await verifyAuthToken(token);

            if (!decodedToken) {
                return NextResponse.json(
                    { error: 'Invalid authentication token' },
                    { status: 401 }
                );
            }

            // Add the authenticated user to the request
            (req as any).user = decodedToken;

            return handler(req);
        } catch (error) {
            console.error('Authentication error:', error);
            return NextResponse.json(
                { error: 'Authentication failed' },
                { status: 401 }
            );
        }
    };
}