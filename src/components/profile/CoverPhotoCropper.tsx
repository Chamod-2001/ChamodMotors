'use client';

import { useEffect, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getCroppedImageBlob } from '@/lib/cropImage';

// Matches the cover photo's display box on the profile card (full width, h-44).
const COVER_ASPECT = 3.5;

export function CoverPhotoCropper({
  file,
  onCancel,
  onCropped,
}: {
  file: File;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
}) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync of a browser object URL (not derivable from render) into state so <Cropper> can display it
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleConfirm() {
    if (!objectUrl || !croppedAreaPixels) return;
    setIsSaving(true);
    try {
      const blob = await getCroppedImageBlob(objectUrl, croppedAreaPixels);
      onCropped(blob);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80 p-4">
      <div className="relative mx-auto w-full max-w-lg flex-1">
        {objectUrl && (
          <Cropper
            image={objectUrl}
            crop={crop}
            zoom={zoom}
            aspect={COVER_ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
          />
        )}
      </div>

      <div className="mx-auto w-full max-w-lg space-y-3 pt-4">
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full"
          aria-label="Zoom"
        />
        <div className="flex gap-2">
          <Button type="button" variant="secondary" fullWidth onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="button" fullWidth onClick={handleConfirm} disabled={isSaving || !croppedAreaPixels}>
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : 'Use This Photo'}
          </Button>
        </div>
      </div>
    </div>
  );
}
