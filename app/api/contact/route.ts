import { NextResponse } from 'next/server';

// This is a server-side route that will handle the contact form submission
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate the request
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real implementation, you would send an email here using EmailJS
    // Since we're implementing client-side EmailJS, this route serves as a fallback
    // or could be used for additional server-side processing

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in contact API route:', error);
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    );
  }
}
