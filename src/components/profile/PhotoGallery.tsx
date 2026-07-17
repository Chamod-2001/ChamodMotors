'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getShopImagePublicUrl } from '@/lib/storageUrls';
import type { ShopPhoto } from '../../../types/database.types';

export function PhotoGallery({ photos, title }: { photos: ShopPhoto[]; title: string }) {
  const [selected, setSelected] = useState<ShopPhoto | null>(null);
  const [entered, setEntered] = useState(false);

  function openPhoto(photo: ShopPhoto) {
    setSelected(photo);
    setEntered(false);
  }

  useEffect(() => {
    if (!selected) return;
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [selected]);

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <button key={photo.id} type="button" onClick={() => openPhoto(photo)} className="block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getShopImagePublicUrl(photo.storage_path)}
              alt=""
              className="aspect-square w-full rounded-xl object-cover transition hover:brightness-90"
            />
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelected(null)}
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={22} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getShopImagePublicUrl(selected.storage_path)}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className={`max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl transition-all duration-200 ease-out ${
              entered ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
            }`}
          />
        </div>
      )}
    </div>
  );
}
