import Link from 'next/link';
import { Bell, CalendarClock, ClipboardCheck, Star } from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LogoutButton } from './LogoutButton';

function NotificationLink({
  href,
  label,
  count,
  icon: Icon,
}: {
  href: string;
  label: string;
  count: number;
  icon: typeof Bell;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
    >
      <Icon size={16} />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}

export function AppHeader({
  title,
  employeeName,
  employeeRole,
  isAdmin,
  unreadActivityCount,
  dueReminderCount,
  pendingApprovalCount,
  pendingReviewCount,
}: {
  title: string;
  employeeName: string;
  employeeRole: string;
  isAdmin: boolean;
  unreadActivityCount: number;
  dueReminderCount: number;
  pendingApprovalCount: number;
  pendingReviewCount: number;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {employeeName} · <span className="capitalize">{employeeRole}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <NotificationLink href="/calendar" label="Reminders" count={dueReminderCount} icon={CalendarClock} />
          {isAdmin && (
            <NotificationLink
              href="/vehicles/approvals"
              label="Pending Approvals"
              count={pendingApprovalCount}
              icon={ClipboardCheck}
            />
          )}
          {isAdmin && (
            <NotificationLink
              href="/profile#pending-reviews"
              label="Pending Reviews"
              count={pendingReviewCount}
              icon={Star}
            />
          )}
          {isAdmin && <NotificationLink href="/activity" label="Activity" count={unreadActivityCount} icon={Bell} />}
          <ThemeToggle />
          <LanguageSwitcher />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
