import DashboardShell from '@/components/layout/DashboardShell';
import ReportsPage from '@/components/reports/ReportsPage';

export default function ReportsRoute() {
  return (
    <DashboardShell title="Reports" breadcrumb="Dashboard / Reports">
      <ReportsPage />
    </DashboardShell>
  );
}
