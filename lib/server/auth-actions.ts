import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { UserRole } from '@/app/types/user';

export async function withServerAuth(handler: Function) {
    return async (req: NextRequest) => {
        try {
            const token = req.headers.get('Authorization')?.split('Bearer ')[1];

            if (!token) {
                return NextResponse.json(
                    { error: 'No authentication token provided' },
                    { status: 401 }
                );
            }

            const decodedToken = await adminAuth.verifyIdToken(token);

            // Add the authenticated user to the request
            (req as any).user = decodedToken;

            return handler(req);
        } catch (error) {
            console.error('Server authentication error:', error);
            return NextResponse.json(
                { error: 'Authentication failed' },
                { status: 401 }
            );
        }
    };
}

export async function adminAction(handler: Function) {
    return async (req: NextRequest) => {
        try {
            const token = req.headers.get('Authorization')?.split('Bearer ')[1];

            if (!token) {
                return NextResponse.json(
                    { error: 'No authentication token provided' },
                    { status: 401 }
                );
            }

            const decodedToken = await adminAuth.verifyIdToken(token);

            // Check if user has admin role
            if (decodedToken.role !== UserRole.ADMIN) {
                return NextResponse.json(
                    { error: 'Unauthorized: Admin access required' },
                    { status: 403 }
                );
            }

            // Add the authenticated admin user to the request
            (req as any).user = decodedToken;

            return handler(req);
        } catch (error) {
            console.error('Admin authentication error:', error);
            return NextResponse.json(
                { error: 'Authentication failed' },
                { status: 401 }
            );
        }
    };
}