import DashboardShell from '@/components/layout/DashboardShell';
import SyncMonitor from '@/components/sync/SyncMonitor';

export default function SyncPage() {
  return (
    <DashboardShell title="Sync Monitor" breadcrumb="Dashboard / Sync Monitor">
      <SyncMonitor />
    </DashboardShell>
  );
}
