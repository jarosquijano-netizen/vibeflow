import DashboardShell from '@/components/layout/DashboardShell';
import ArcadePage from '@/components/arcade/ArcadePage';

export default function ArcadeRoute() {
  return (
    <DashboardShell title="Arcade" breadcrumb="Dashboard / Arcade">
      <div style={{ margin: -24, minHeight: 'calc(100% + 48px)' }}>
        <ArcadePage />
      </div>
    </DashboardShell>
  );
}
