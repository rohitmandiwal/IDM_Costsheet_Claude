import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, CheckCircle, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useAuth } from "../../contexts/AuthContext";

interface SidebarProps {
  className?: string;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

interface MenuItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
  adminOnly?: boolean;
}

const allMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'PR Entry', path: '/pr-entry' },
  { icon: CheckCircle, label: 'Approvals', path: '/approvals' },
  { icon: Settings, label: 'Admin', path: '/admin', adminOnly: true },
];

export function Sidebar({ className, isCollapsed, setIsCollapsed }: SidebarProps) {
  const { user } = useAuth();

  const menuItems = useMemo(() => {
    return allMenuItems.filter(item => {
      if (item.adminOnly) {
        return user?.role === 'Admin';
      }
      return true;
    });
  }, [user?.role]);

  return (
    <aside
      className={cn(
        'bg-white text-gray-800 transition-all duration-300 flex flex-col h-screen fixed inset-y-0 left-0 z-50',
        isCollapsed ? 'w-16' : 'w-56',
        className
      )}
    >
      <div className="p-4 flex items-center justify-between">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => isCollapsed && setIsCollapsed(false)}
        >
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && <span className="font-semibold text-lg text-blue-700">ProcureCS</span>}
        </div>
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-gray-600 hover:text-gray-800 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => isCollapsed && setIsCollapsed(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors',
                'hover:bg-blue-100',
                isActive && 'bg-blue-200 text-blue-800 font-medium',
                !isActive && 'text-gray-800',
                isCollapsed && 'justify-center px-2'
              )
            }
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 text-gray-500 text-xs">
        {!isCollapsed && <span>v2.4.1</span>}
      </div>
    </aside>
  );
}
