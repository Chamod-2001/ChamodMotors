import { AppHeader } from './AppHeader';
import { Sidebar } from './Sidebar';
import { SidebarContent } from './SidebarContent';
import { SidebarProvider } from './SidebarContext';
import { getCurrentEmployee } from '@/lib/queries/session';
import { getUnreadActivityCount } from '@/lib/queries/activity';

export async function AppShell({ title, children }: { title: string; children: React.ReactNode }) {
  const employee = await getCurrentEmployee();
  const isAdmin = employee?.role === 'admin';
  const unreadActivityCount = isAdmin ? await getUnreadActivityCount() : 0;

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
          />
          {children}
        </SidebarContent>
      </div>
    </SidebarProvider>
  );
}
