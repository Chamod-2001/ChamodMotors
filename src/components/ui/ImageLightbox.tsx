'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ImageLightboxContextValue {
  openImage: (url: string) => void;
}

const ImageLightboxContext = createContext<ImageLightboxContextValue | undefined>(undefined);

/** Any image inside <ImageLightboxProvider> can call this to open itself full-screen. */
export function useImageLightbox(): ImageLightboxContextValue {
  const ctx = useContext(ImageLightboxContext);
  if (!ctx) throw new Error('useImageLightbox must be used within an ImageLightboxProvider');
  return ctx;
}

// One shared full-screen zoom+close overlay for a whole tree (cover photo,
// gallery photos, review photos, avatars, logos, ...) instead of duplicating
// the modal per image type. Mounted once, app-wide, in AppShell.
export function ImageLightboxProvider({ children }: { children: ReactNode }) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);

  function openImage(url: string) {
    setSelectedUrl(url);
    setEntered(false);
  }

  useEffect(() => {
    if (!selectedUrl) return;
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [selectedUrl]);

  return (
    <ImageLightboxContext.Provider value={{ openImage }}>
      {children}

      {selectedUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedUrl(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedUrl(null)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={22} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedUrl}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className={`max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl transition-all duration-200 ease-out ${
              entered ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
            }`}
          />
        </div>
      )}
    </ImageLightboxContext.Provider>
  );
}
