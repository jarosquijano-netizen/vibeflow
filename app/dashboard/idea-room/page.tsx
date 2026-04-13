import DashboardShell from '@/components/layout/DashboardShell';
import IdeaRoom from '@/components/idea-room/IdeaRoom';

export default function IdeaRoomPage() {
  return (
    <DashboardShell title="Idea Room" breadcrumb="Dashboard / Idea Room">
      <div style={{ margin: -24, height: 'calc(100% + 48px)' }}>
        <IdeaRoom />
      </div>
    </DashboardShell>
  );
}
