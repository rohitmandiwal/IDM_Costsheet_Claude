import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const storedCollapsed = localStorage.getItem('sidebarCollapsed');
    return storedCollapsed ? JSON.parse(storedCollapsed) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar is fixed via its own classes now */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main content area - takes remaining space and has dynamic padding */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'pl-16' : 'pl-56'}`}>
        {/* TopBar container - fixed to the top of the viewport, spans from sidebar's edge */}
        <div className={`fixed top-0 right-0 z-40 transition-all duration-300 ${isCollapsed ? 'left-16' : 'left-56'} h-16 bg-white border-b border-gray-200`}>
          <TopBar />
        </div>
        {/* Main scrollable content, pushed down by TopBar height */}
        <main className="flex-1 bg-gray-50 p-6 overflow-auto mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
