'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { VehicleCatalogEntry, VehicleType } from '../../../types/database.types';

interface BrandModelFieldsProps {
  catalog: VehicleCatalogEntry[];
  defaultVehicleType?: VehicleType;
  defaultBrand?: string;
  defaultModel?: string;
}

/** Vehicle Type + Brand + Model, in that order — picking a type narrows the
 * brand suggestions, and picking a brand narrows the model suggestions.
 * Brand/model stay free-text (via <datalist>) so an unlisted vehicle never
 * blocks data entry; anything typed gets added to the shared catalog. */
export function BrandModelFields({
  catalog,
  defaultVehicleType = 'motorcycle',
  defaultBrand = '',
  defaultModel = '',
}: BrandModelFieldsProps) {
  const { t } = useLanguage();
  const [vehicleType, setVehicleType] = useState<VehicleType>(defaultVehicleType);
  const [brand, setBrand] = useState(defaultBrand);

  const brandOptions = useMemo(
    () => Array.from(new Set(catalog.filter((c) => c.vehicle_type === vehicleType).map((c) => c.brand))).sort(),
    [catalog, vehicleType]
  );

  const modelOptions = useMemo(() => {
    const normalizedBrand = brand.trim().toLowerCase();
    return Array.from(
      new Set(
        catalog
          .filter((c) => c.vehicle_type === vehicleType && c.brand.trim().toLowerCase() === normalizedBrand)
          .map((c) => c.model)
      )
    ).sort();
  }, [catalog, vehicleType, brand]);

  return (
    <>
      <Select
        name="vehicle_type"
        label={t('vehicle_type')}
        value={vehicleType}
        onChange={(e) => setVehicleType(e.target.value as VehicleType)}
      >
        <option value="motorcycle">{t('motorcycle')}</option>
        <option value="three_wheeler">{t('three_wheeler')}</option>
        <option value="scooter">{t('scooter')}</option>
        <option value="other">{t('other_vehicle_type')}</option>
      </Select>

      <div className="w-full">
        <Input
          name="brand"
          label={t('brand')}
          required
          list="brand-suggestions"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="e.g. Bajaj"
          autoComplete="off"
        />
        <datalist id="brand-suggestions">
          {brandOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </div>

      <div className="w-full">
        <Input
          name="model"
          label={t('model')}
          required
          list="model-suggestions"
          defaultValue={defaultModel}
          placeholder="e.g. Pulsar 150"
          autoComplete="off"
        />
        <datalist id="model-suggestions">
          {modelOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </div>
    </>
  );
}
