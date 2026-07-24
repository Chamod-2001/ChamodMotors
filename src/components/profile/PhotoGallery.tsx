'use client';

import { getShopImagePublicUrl } from '@/lib/storageUrls';
import { useImageLightbox } from '@/components/ui/ImageLightbox';
import type { ShopPhoto } from '../../../types/database.types';

export function PhotoGallery({ photos, title }: { photos: ShopPhoto[]; title: string }) {
  const { openImage } = useImageLightbox();

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => openImage(getShopImagePublicUrl(photo.storage_path))}
            className="block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getShopImagePublicUrl(photo.storage_path)}
              alt=""
              className="aspect-square w-full rounded-xl object-cover transition hover:brightness-90"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
