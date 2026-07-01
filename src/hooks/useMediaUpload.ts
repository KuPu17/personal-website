'use client';
import { useState, useCallback } from 'react';
import type { UploadContext, PresignedUploadResponse } from '@/types';

type UploadState = {
  uploading: boolean;
  progress: number; // 0-100
  error: string | null;
  url: string | null;
};

type UseMediaUploadReturn = {
  state: UploadState;
  upload: (file: File) => Promise<string | null>;
  reset: () => void;
};

const INITIAL_STATE: UploadState = {
  uploading: false,
  progress: 0,
  error: null,
  url: null,
};

export function useMediaUpload(context: UploadContext): UseMediaUploadReturn {
  const [state, setState] = useState<UploadState>(INITIAL_STATE);

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      setState({ uploading: true, progress: 0, error: null, url: null });

      try {
        // Step 1: request presigned URL
        const ext = file.name.match(/\.[^.]+$/)?.[0] ?? '.bin';
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
          const { error } = await presignRes.json();
          throw new Error(error ?? 'Failed to get upload URL');
        }

        const { uploadUrl, publicUrl }: PresignedUploadResponse =
          await presignRes.json();

        setState((s) => ({ ...s, progress: 20 }));

        // Step 2: PUT directly to S3 — no bytes through Next.js
        const s3Res = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        if (!s3Res.ok) {
          throw new Error(`S3 upload failed: ${s3Res.status}`);
        }

        setState({ uploading: false, progress: 100, error: null, url: publicUrl });
        return publicUrl;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setState({ uploading: false, progress: 0, error: message, url: null });
        return null;
      }
    },
    [context],
  );

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  return { state, upload, reset };
}
