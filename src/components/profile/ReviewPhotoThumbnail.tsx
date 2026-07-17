'use client';

import { useImageLightbox } from './ImageLightbox';

export function ReviewPhotoThumbnail({ url }: { url: string }) {
  const { openImage } = useImageLightbox();

  return (
    <button type="button" onClick={() => openImage(url)} className="mt-3 block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="h-24 w-24 rounded-xl object-cover transition hover:brightness-90" />
    </button>
  );
}
