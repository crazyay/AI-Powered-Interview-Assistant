@"
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/test');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <p className="text-gray-600">Redirecting to test page...</p>
    </div>
  );
}
"@ | Out-File -FilePath "F:\AIQuizz\frontend\src\app\page.tsx" -Encoding utf8 -Force
