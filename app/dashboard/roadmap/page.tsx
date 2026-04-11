import DashboardShell from '@/components/layout/DashboardShell';
import RoadmapPage from '@/components/roadmap/RoadmapPage';

export default function RoadmapRoute() {
  return (
    <DashboardShell title="Roadmap" breadcrumb="Dashboard / Roadmap">
      <RoadmapPage />
    </DashboardShell>
  );
}
