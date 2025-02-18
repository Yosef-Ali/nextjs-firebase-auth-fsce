'use client';

import { useEffect, useState } from 'react';

export default function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    setDebugInfo(JSON.stringify({
      window: typeof window !== 'undefined',
      document: typeof document !== 'undefined',
      timestamp: new Date().toISOString()
    }, null, 2));
  }, []);

  if (!debugInfo) {
    return <div>Loading debug info...</div>;
  }

  return (
    <pre className="bg-muted p-2 rounded text-sm">
      {debugInfo}
    </pre>
  );
}