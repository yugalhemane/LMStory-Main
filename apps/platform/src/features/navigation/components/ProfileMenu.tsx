import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../../store/auth.store';
import { LogOut, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProfileMenu() {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User profile menu"
        className="flex items-center gap-2 hover:bg-secondary p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
          {user?.firstName?.charAt(0) || 'U'}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          role="menu"
          className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="p-2 border-b border-border">
            <p className="text-sm font-semibold truncate" title={user?.email}>{user?.email}</p>
          </div>
          <div className="p-1">
            <Link
              to="/my-certificates"
              role="menuitem"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary rounded-md transition-colors focus-visible:bg-secondary focus-visible:outline-none"
            >
              <User size={16} /> My Certificates
            </Link>
            <Link 
              to="/notifications/preferences"
              role="menuitem"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary rounded-md transition-colors focus-visible:bg-secondary focus-visible:outline-none"
            >
              <Settings size={16} /> Preferences
            </Link>
            <button 
              role="menuitem"
              onClick={() => logout()}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors focus-visible:bg-destructive/10 focus-visible:text-destructive focus-visible:outline-none"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
