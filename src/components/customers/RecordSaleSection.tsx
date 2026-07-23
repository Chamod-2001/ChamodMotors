'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RecordSaleForm } from './RecordSaleForm';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { SellableVehicle } from '@/lib/queries/customers';
import { ShoppingBag, X } from 'lucide-react';

export function RecordSaleSection({
  customerId,
  sellableVehicles,
}: {
  customerId: string;
  sellableVehicles: SellableVehicle[];
}) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  if (!open) {
    return (
      <Button variant="success" fullWidth onClick={() => setOpen(true)}>
        <ShoppingBag size={18} /> {t('record_vehicle_purchase')}
      </Button>
    );
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{t('record_purchase')}</h2>
        <button onClick={() => setOpen(false)} aria-label="Close" className="text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>
      <RecordSaleForm
        customerId={customerId}
        sellableVehicles={sellableVehicles}
        onDone={() => setOpen(false)}
      />
    </Card>
  );
}
