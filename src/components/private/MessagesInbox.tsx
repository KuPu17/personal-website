'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Message } from '@/db/schema';
import clsx from 'clsx';

type Props = { initialMessages: Message[] };

export default function MessagesInbox({ initialMessages }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const unread = initialMessages.filter((m) => !m.isRead);
  const read = initialMessages.filter((m) => m.isRead);

  const handleMarkRead = async (id: string) => {
    setLoading(id);
    await fetch(`/api/messages/manage/${id}`, { method: 'PATCH' });
    setLoading(null);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    setLoading(id);
    await fetch(`/api/messages/manage/${id}`, { method: 'DELETE' });
    setLoading(null);
    if (expanded === id) setExpanded(null);
    router.refresh();
  };

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const MessageRow = ({ msg }: { msg: Message }) => {
    const isOpen = expanded === msg.id;
    const busy = loading === msg.id;

    return (
      <div
        className={clsx(
          'border-b border-border last:border-0 transition-colors',
          !msg.isRead && 'bg-accent/[0.03]',
        )}
      >
        <button
          onClick={() => {
            setExpanded(isOpen ? null : msg.id);
            if (!msg.isRead) handleMarkRead(msg.id);
          }}
          className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-overlay/40 transition-colors"
        >
          {/* Unread indicator */}
          <span className={clsx('mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 transition-colors', !msg.isRead ? 'bg-accent' : 'bg-transparent')} />
          <div className="flex-1 min-w-0">
            <p className={clsx('text-sm leading-relaxed', msg.isRead ? 'text-subtle' : 'text-secondary')}>
              {msg.messageText.length > 100 && !isOpen
                ? msg.messageText.slice(0, 100) + '…'
                : msg.messageText}
            </p>
            <p className="text-xs text-muted font-mono mt-1">{formatDate(msg.createdAt)}</p>
          </div>
        </button>

        {/* Expanded actions */}
        {isOpen && (
          <div className="px-4 pb-3 flex items-center gap-3 pl-9">
            {!msg.isRead && (
              <button
                onClick={() => handleMarkRead(msg.id)}
                disabled={busy}
                className="text-xs text-subtle hover:text-primary transition-colors"
              >
                Mark read
              </button>
            )}
            <button
              onClick={() => handleDelete(msg.id)}
              disabled={busy}
              className="text-xs text-subtle hover:text-danger transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  };

  if (initialMessages.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-subtle text-sm">No messages yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {unread.length > 0 && (
        <div>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mb-3">
            Unread · {unread.length}
          </p>
          <div className="card p-0 overflow-hidden">
            {unread.map((m) => <MessageRow key={m.id} msg={m} />)}
          </div>
        </div>
      )}

      {read.length > 0 && (
        <div>
          <p className="text-xs font-mono text-muted uppercase tracking-widest mb-3">
            Read · {read.length}
          </p>
          <div className="card p-0 overflow-hidden">
            {read.map((m) => <MessageRow key={m.id} msg={m} />)}
          </div>
        </div>
      )}
    </div>
  );
}
