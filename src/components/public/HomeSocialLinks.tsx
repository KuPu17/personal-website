'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useControllerMode } from '@/contexts/ControllerModeContext';
import { DEFAULT_EMAIL, DEFAULT_LINKEDIN } from '@/lib/site-contacts';

type Editing = null | 'email' | 'linkedin';

export default function HomeSocialLinks() {
  const { isActive, isLoading } = useControllerMode();
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [linkedin, setLinkedin] = useState(DEFAULT_LINKEDIN);
  const [editing, setEditing] = useState<Editing>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/site-settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { email?: string; linkedin?: string } | null) => {
        if (!data) return;
        if (data.email) setEmail(data.email);
        if (data.linkedin) setLinkedin(data.linkedin);
      })
      .catch(() => {});
  }, []);

  const canEdit = isActive && !isLoading;

  const openEdit = (type: 'email' | 'linkedin') => {
    setEditing(type);
    setDraft(type === 'email' ? email : linkedin);
  };

  const saveEdit = async () => {
    if (!editing || saving) return;
    const value = draft.trim();
    if (!value) return;

    setSaving(true);
    try {
      const payload =
        editing === 'email' ? { email: value } : { linkedin: value };
      const res = await fetch('/api/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Save failed');
      const data = (await res.json()) as { email: string; linkedin: string };
      setEmail(data.email);
      setLinkedin(data.linkedin);
      setEditing(null);
    } catch {
      // Keep editor open on failure
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="home-contact__social-row">
      <div className="home-social-wrap">
        {canEdit && editing !== 'email' && (
          <button
            type="button"
            className="home-social-edit"
            onClick={() => openEdit('email')}
            aria-label="Edit email link"
          >
            edit
          </button>
        )}
        {editing === 'email' ? (
          <div className="home-social-editor">
            <input
              type="email"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="home-social-editor__input"
              placeholder="email address"
              disabled={saving}
            />
            <button
              type="button"
              className="home-social-editor__save"
              onClick={saveEdit}
              disabled={saving}
              aria-label="Save email"
            >
              {saving ? '…' : '✓'}
            </button>
          </div>
        ) : (
          <a
            href={`mailto:${email}`}
            className="home-social-block"
            aria-label="Email"
          >
            <Image
              src="/icons/email.svg"
              alt=""
              width={63}
              height={63}
              className="home-social-block__icon"
              draggable={false}
            />
          </a>
        )}
      </div>

      <div className="home-social-wrap">
        {canEdit && editing !== 'linkedin' && (
          <button
            type="button"
            className="home-social-edit"
            onClick={() => openEdit('linkedin')}
            aria-label="Edit LinkedIn link"
          >
            edit
          </button>
        )}
        {editing === 'linkedin' ? (
          <div className="home-social-editor">
            <input
              type="url"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="home-social-editor__input"
              placeholder="https://linkedin.com/in/…"
              disabled={saving}
            />
            <button
              type="button"
              className="home-social-editor__save"
              onClick={saveEdit}
              disabled={saving}
              aria-label="Save LinkedIn URL"
            >
              {saving ? '…' : '✓'}
            </button>
          </div>
        ) : (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="home-social-block"
            aria-label="LinkedIn"
          >
            <Image
              src="/icons/linkedin.svg"
              alt=""
              width={63}
              height={63}
              className="home-social-block__icon"
              draggable={false}
            />
          </a>
        )}
      </div>
    </div>
  );
}
