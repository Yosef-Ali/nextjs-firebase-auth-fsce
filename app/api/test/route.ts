export async function GET(request: Request) {
    try {
        const { adminDb } = await import('@/lib/firebase-admin');
        return new Response(JSON.stringify({ message: 'Firebase Admin initialized successfully' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error: any) {
        console.error('Error initializing Firebase Admin in API route:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
