import DashboardShell from '@/components/layout/DashboardShell';
import ControllerRoom from '@/components/controller/ControllerRoom';

export default function ControllerRoute() {
  return (
    <DashboardShell title="Controller Room" breadcrumb="Dashboard / Controller Room">
      <div style={{ margin: -24, minHeight: 'calc(100% + 48px)' }}>
        <ControllerRoom />
      </div>
    </DashboardShell>
  );
}
