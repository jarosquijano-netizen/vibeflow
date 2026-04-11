import Sidebar from './Sidebar';
import Header from './Header';
import CyberOverrides from './CyberOverrides';
import CyberHUD from './CyberHUD';

interface DashboardShellProps {
  children: React.ReactNode;
  title: string;
  breadcrumb: string;
}

export default function DashboardShell({ children, title, breadcrumb }: DashboardShellProps) {
  return (
    <>
      <CyberOverrides />
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Header title={title} breadcrumb={breadcrumb} />
          <main
            style={{
              flex: 1,
              overflowY: 'auto',
              backgroundColor: 'var(--color-content-bg)',
              padding: 24,
            }}
          >
            {children}
          </main>
        </div>
      </div>
      <CyberHUD />
    </>
  );
}
