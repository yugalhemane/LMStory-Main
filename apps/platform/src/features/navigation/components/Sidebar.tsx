import { NavLink } from 'react-router-dom';
import { MAIN_NAV_ITEMS } from '../config/menu.config';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

import { useAuthStore } from '../../../store/auth.store';

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuthStore();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
          aria-label="Close Sidebar"
        />
      )}

      <aside className={`fixed left-0 top-0 h-full w-[260px] bg-card border-r border-border flex flex-col py-6 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="px-4 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-foreground">LMStory</h1>
            <p className="text-xs text-muted-foreground">LMS Platform</p>
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
          {MAIN_NAV_ITEMS.filter(item => !item.roles || (user?.role && item.roles.includes(user.role))).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                // Close sidebar on mobile after clicking a link
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-secondary text-secondary-foreground font-semibold' 
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`
              }
            >
              <item.icon size={20} />
              <span className="text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
