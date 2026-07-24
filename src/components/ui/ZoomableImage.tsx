'use client';

import { useImageLightbox } from './ImageLightbox';

/** Any avatar/logo/photo thumbnail — tap to zoom full-screen via the shared
 * ImageLightboxProvider mounted in AppShell. Falls back to `fallback` when
 * `src` is missing so callers don't need their own null-check branch. */
export function ZoomableImage({
  src,
  alt = '',
  className,
  fallback,
}: {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  fallback?: React.ReactNode;
}) {
  const { openImage } = useImageLightbox();

  if (!src) return <>{fallback}</>;

  return (
    <button type="button" onClick={() => openImage(src)} className="block h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={className} />
    </button>
  );
}
