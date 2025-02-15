import { NextResponse } from 'next/server';
import { getResourceById } from '@/app/actions/resources-actions';

export async function GET(
    request: Request,
    { params }: { params: { resourceId: string } }
) {
    try {
        const result = await getResourceById(params.resourceId);
        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Resource not found' },
                { status: 404 }
            );
        }
        return NextResponse.json(result.data);
    } catch (error) {
        console.error('Error fetching resource:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}