'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from './Input';

export function LiveSearchInput({
  paramName = 'q',
  placeholder,
  autoFocus,
}: {
  paramName?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(paramName) ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(paramName, value);
      else params.delete(paramName);
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally re-runs only on `value`, not on every external searchParams/pathname/router change
  }, [value]);

  return (
    <Input
      name={paramName}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
    />
  );
}
