import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardShellProps {
  children: React.ReactNode;
  title: string;
  breadcrumb: string;
}

export default function DashboardShell({ children, title, breadcrumb }: DashboardShellProps) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header title={title} breadcrumb={breadcrumb} />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            background: '#F8FAFC',
            padding: 24,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
