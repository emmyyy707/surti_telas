import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, subtitle, children }) => (
  <div className="flex min-h-screen bg-slate-100 overflow-x-hidden">
    <Sidebar />
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <Header title={title} subtitle={subtitle} />
      <div className="space-y-6">{children}</div>
    </main>
  </div>
);



