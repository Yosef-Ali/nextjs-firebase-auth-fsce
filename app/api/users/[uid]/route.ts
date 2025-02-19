import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/app/lib/services/admin';
import { UserRole, UserStatus } from '@/app/types/user';
import { ADMIN_EMAILS } from '@/app/lib/firebase/user-service';

export async function PATCH(
    request: Request,
    { params }: { params: { uid: string } }
) {
    try {
        const uid = params.uid;
        if (!uid) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const userData = await request.json();

        // Validate required fields
        if (!userData.displayName || !userData.email || !userData.role || !userData.status) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get the user from Auth
        try {
            const userRecord = await adminAuth.getUser(uid);

            // Special handling for admin role changes
            if (userData.role === UserRole.ADMIN) {
                // Only allow admin role if email is in ADMIN_EMAILS
                if (!ADMIN_EMAILS.includes(userData.email)) {
                    return NextResponse.json(
                        { error: 'Unauthorized role change' },
                        { status: 403 }
                    );
                }
            }

            // Update auth user if email changed
            if (userData.email !== userRecord.email) {
                await adminAuth.updateUser(uid, {
                    email: userData.email,
                    displayName: userData.displayName
                });
            }

            // Update custom claims if role changed
            if (userData.role) {
                await adminAuth.setCustomUserClaims(uid, { role: userData.role });
            }

            // Update user document in Firestore
            const updateData = {
                displayName: userData.displayName,
                email: userData.email,
                role: userData.role,
                status: userData.status,
                updatedAt: new Date().toISOString(),
                // Only include optional fields if they're provided
                ...(userData.photoURL && { photoURL: userData.photoURL }),
                ...(userData.phoneNumber && { phoneNumber: userData.phoneNumber }),
                metadata: {
                    role: userData.role,
                    status: userData.status,
                    lastUpdated: Date.now()
                }
            };

            await adminDb.collection('users').doc(uid).update(updateData);

            return NextResponse.json({
                success: true,
                message: 'User updated successfully'
            });
        } catch (error) {
            console.error('User not found in Auth:', error);
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}