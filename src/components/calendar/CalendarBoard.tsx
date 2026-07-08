'use client';

import { useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { MonthCalendar } from '@/components/calendar/MonthCalendar';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { ReminderForm } from '@/components/calendar/ReminderForm';
import { formatLocalDate } from '@/lib/calculations';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { ReminderItem } from '@/lib/queries/reminders';
import type { SimpleCustomer, SimpleVehicle, SimpleFinanceOfficer } from '@/lib/queries/finance';

export function CalendarBoard({
  reminders,
  vehicles,
  customers,
  officers,
}: {
  reminders: ReminderItem[];
  vehicles: SimpleVehicle[];
  customers: SimpleCustomer[];
  officers: SimpleFinanceOfficer[];
}) {
  const [selectedDate, setSelectedDate] = useState(() => formatLocalDate(new Date()));
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <MonthCalendar reminders={reminders} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <CollapsibleSection label={t('add_reminder')} icon={CalendarPlus}>
        <ReminderForm vehicles={vehicles} customers={customers} officers={officers} defaultDate={selectedDate} />
      </CollapsibleSection>
    </div>
  );
}
