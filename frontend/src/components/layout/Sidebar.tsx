import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, CheckSquare, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';

interface SidebarProps {
  className?: string;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'PR Entry', path: '/pr-entry' },
  { icon: CheckSquare, label: 'Approvals', path: '/approvals' },
  { icon: Settings, label: 'Admin', path: '/admin' },
];

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'bg-primary text-primary-foreground transition-all duration-300 flex flex-col',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-primary-foreground/10">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
              <span className="text-primary font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-lg">ProcureCS</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center mx-auto">
            <span className="text-primary font-bold text-sm">P</span>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-3 py-2.5 rounded-md transition-colors',
                'hover:bg-primary-foreground/10',
                isActive && 'bg-primary-foreground/20',
                isCollapsed && 'justify-center'
              )
            }
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-primary-foreground/10">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="ml-2 text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
