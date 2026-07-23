import { Menu, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProfileMenu } from './ProfileMenu';

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-[260px] h-16 bg-card border-b border-border flex justify-between items-center px-4 md:px-8 z-40 transition-all duration-300">
      <div className="flex items-center gap-4 w-full">
        <button 
          onClick={onMenuClick} 
          className="p-2 -ml-2 rounded-lg hover:bg-secondary lg:hidden"
          aria-label="Open Menu"
        >
          <Menu size={20} />
        </button>
        
        {/* Placeholder for future Global Search or Breadcrumbs */}
        <div className="hidden md:flex flex-1">
          <p className="text-sm text-muted-foreground">Home</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Entry Point */}
        <Link to="/notifications" className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors relative" aria-label="Notifications">
          <Bell size={20} />
        </Link>

        <ProfileMenu />
      </div>
    </header>
  );
}
