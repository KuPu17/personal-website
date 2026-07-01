'use client';
import { useState, useRef } from 'react';

type Props = {
  value: string;
  onChange: (val: string) => void;
  context: 'blog' | 'project' | 'journal';
  placeholder?: string;
  rows?: number;
};

export default function MarkdownEditor({
  value,
  onChange,
  context,
  placeholder = 'Write in Markdown...',
  rows = 18,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Upload an image via presigned URL and insert Markdown link
  const handleImageUpload = async (file: File) => {
    const ext = file.name.match(/\.[^.]+$/)?.[0] ?? '.jpg';
    setUploading(true);
    setUploadError('');

    try {
      // Step 1: get presigned URL from our API
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          mimeType: file.type,
          fileExtension: ext,
        }),
      });

      if (!presignRes.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, publicUrl } = await presignRes.json();

      // Step 2: upload directly to S3 — no bytes through Next.js
      const s3Res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!s3Res.ok) throw new Error('S3 upload failed');

      // Step 3: insert Markdown image syntax at cursor
      onChange(value + `\n\n![image](${publicUrl})\n`);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-xs font-mono text-muted">Markdown</span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="text-xs text-subtle hover:text-primary transition-colors"
        >
          {uploading ? 'Uploading…' : '+ Image'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFilePick}
        />
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        placeholder={placeholder}
        rows={rows}
        className="input-base resize-y font-mono text-xs leading-relaxed"
      />

      {uploadError && (
        <p className="text-xs text-danger">{uploadError}</p>
      )}
    </div>
  );
}
