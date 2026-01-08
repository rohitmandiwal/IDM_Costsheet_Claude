import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name: string | undefined | null): string => {
    if (!name) {
      return ''; // Return empty string if name is null, undefined, or empty
    }
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-foreground">
          Procurement Cost-Sheet System
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative" title="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </Button>

        <div className="flex items-center space-x-3 pl-4 border-l border-border">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm">
            {user && getInitials(user.fullName)}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
