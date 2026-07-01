'use client';

import { useState } from 'react';

type Props = {
  onSent?: () => void;
};

export default function InboxInlineField({ onSent }: Props) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const submit = async () => {
    const text = message.trim();
    if (!text || status === 'loading') return;

    setStatus('loading');
    try {
      const authRes = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: text }),
      });

      if (authRes.ok) {
        setMessage('');
        setStatus('idle');
        window.dispatchEvent(new CustomEvent('controller:activate'));
        return;
      }

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageText: text, website: '' }),
      });

      if (res.ok) {
        setMessage('');
        setStatus('success');
        onSent?.();
        setTimeout(() => setStatus('idle'), 2000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="home-inbox__field pointer-events-auto">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="wanna say smtg (anonymously)?"
        maxLength={2000}
        disabled={status === 'loading'}
        className="home-inbox__input"
        aria-label="Message or passcode"
      />
      {status === 'error' && (
        <span className="home-inbox__sent home-inbox__sent--error">
          Failed — try again
        </span>
      )}
    </div>
  );
}
