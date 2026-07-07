import { Card } from '@/components/ui/Card';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: 'blue' | 'green' | 'amber' | 'slate';
}

const TONE_CLASSES: Record<NonNullable<StatCardProps['tone']>, string> = {
  blue: 'bg-brand-light text-brand',
  green: 'bg-green-50 text-green-600',
  amber: 'bg-amber-50 text-amber-600',
  slate: 'bg-slate-100 text-slate-600',
};

export function StatCard({ label, value, icon: Icon, tone = 'blue' }: StatCardProps) {
  return (
    <Card className="flex items-center gap-3 sm:gap-4">
      <div className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12', TONE_CLASSES[tone])}>
        <Icon size={20} className="sm:hidden" />
        <Icon size={24} className="hidden sm:block" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500">{label}</p>
        <p className="truncate text-lg font-bold text-slate-900 sm:text-2xl">{value}</p>
      </div>
    </Card>
  );
}
