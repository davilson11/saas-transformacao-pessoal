'use client';

import { useEffect } from 'react';

export default function SwRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // registro silencioso — não bloqueia a app
      });
    }
  }, []);

  return null;
}
