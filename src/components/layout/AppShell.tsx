import { AppHeader } from './AppHeader';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { SidebarContent } from './SidebarContent';
import { SidebarProvider } from './SidebarContext';
import { OfflineSyncManager } from './OfflineSyncManager';
import { getCurrentEmployee } from '@/lib/queries/session';
import { getUnreadActivityCount } from '@/lib/queries/activity';
import { countPendingReminders } from '@/lib/queries/reminders';
import { countPendingVehicleEditRequests } from '@/lib/queries/vehicleEditRequests';

export async function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const employee = await getCurrentEmployee();
  const isAdmin = employee?.role === 'admin';
  const [unreadActivityCount, dueReminderCount, pendingApprovalCount] = await Promise.all([
    isAdmin ? getUnreadActivityCount() : Promise.resolve(0),
    countPendingReminders(),
    isAdmin ? countPendingVehicleEditRequests() : Promise.resolve(0),
  ]);

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar isAdmin={isAdmin} />
        <SidebarContent>
          <AppHeader
            title={title}
            employeeName={employee?.name ?? ''}
            employeeRole={employee?.role ?? 'sales'}
            isAdmin={isAdmin}
            unreadActivityCount={unreadActivityCount}
            dueReminderCount={dueReminderCount}
            pendingApprovalCount={pendingApprovalCount}
          />
          {children}
        </SidebarContent>
      </div>
      <BottomNav isAdmin={isAdmin} />
      <OfflineSyncManager />
    </SidebarProvider>
  );
}
