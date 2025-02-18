'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [debugInfo, setDebugInfo] = useState('Loading...');

  useEffect(() => {
    console.log('Test page mounted');
    setDebugInfo(JSON.stringify({
      window: typeof window !== 'undefined',
      document: typeof document !== 'undefined',
      timestamp: new Date().toISOString()
    }, null, 2));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-2xl font-bold mb-4">
        Test Page
      </h1>
      <p className="mb-6">If you can see this, basic routing and styling are working.</p>
      
      <div className="p-4 bg-card rounded-lg border border-border">
        <h2 className="text-lg font-semibold mb-2">Debug Info:</h2>
        <pre className="bg-muted p-2 rounded text-sm">
          {debugInfo}
        </pre>
      </div>
    </div>
  );
}
