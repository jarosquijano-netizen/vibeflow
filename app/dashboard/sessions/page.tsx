import { Suspense } from 'react';
import DashboardShell from '@/components/layout/DashboardShell';
import VibeSessions from '@/components/sessions/VibeSessions';

export default function SessionsPage() {
  return (
    <DashboardShell title="Vibe Sessions" breadcrumb="Dashboard / Vibe Sessions">
      <div className="h-full flex overflow-hidden -m-6">
        <Suspense fallback={null}>
          <VibeSessions />
        </Suspense>
      </div>
    </DashboardShell>
  );
}
