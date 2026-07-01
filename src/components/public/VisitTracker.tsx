'use client';

import { useEffect, useRef } from 'react';

export default function VisitTracker() {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    if (sessionStorage.getItem('kp-visit-tracked')) return;

    fetch('/api/visits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: window.location.pathname }),
    }).finally(() => {
      sessionStorage.setItem('kp-visit-tracked', '1');
      tracked.current = true;
    });
  }, []);

  return null;
}
