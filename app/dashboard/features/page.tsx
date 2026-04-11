import DashboardShell from '@/components/layout/DashboardShell';
import FeatureBoard from '@/components/features/FeatureBoard';

export default function FeaturesPage() {
  return (
    <DashboardShell title="Feature Board" breadcrumb="Dashboard / Feature Board">
      <FeatureBoard />
    </DashboardShell>
  );
}
