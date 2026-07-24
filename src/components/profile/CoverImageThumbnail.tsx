'use client';

import { useImageLightbox } from '@/components/ui/ImageLightbox';

export function CoverImageThumbnail({ url, alt }: { url: string; alt: string }) {
  const { openImage } = useImageLightbox();

  return (
    <button type="button" onClick={() => openImage(url)} className="block h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={alt} className="h-full w-full object-cover" />
    </button>
  );
}
