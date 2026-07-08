'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Card } from '@/components/ui/Card';
import { PlusCircle, UserPlus, MessageCircle, Search } from 'lucide-react';

export function QuickActions({ isAdmin }: { isAdmin: boolean }) {
  const { t } = useLanguage();

  const actions = [
    ...(isAdmin ? [{ href: '/vehicles/new', label: t('add_vehicle'), icon: PlusCircle, tone: 'text-brand bg-brand-light' }] : []),
    { href: '/customers/new', label: t('add_customer'), icon: UserPlus, tone: 'text-green-600 bg-green-50' },
    { href: '/finance', label: t('open_finance_whatsapp'), icon: MessageCircle, tone: 'text-emerald-600 bg-emerald-50' },
    { href: '/search', label: t('search_vehicle'), icon: Search, tone: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-slate-900">{t('quick_actions')}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map(({ href, label, icon: Icon, tone }) => (
          <Link key={href} href={href}>
            <Card className="flex h-full flex-col items-center justify-center gap-2 py-6 text-center transition hover:shadow-md active:scale-[0.98]">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}>
                <Icon size={24} />
              </div>
              <p className="text-sm font-semibold text-slate-700">{label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
