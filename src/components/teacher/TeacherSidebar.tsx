import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Monitor, 
  LayoutDashboard, 
  FolderSync, 
  FileCheck, 
  Users, 
  Settings,
  LogOut,
  ChevronLeft,
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Lab Management', icon: Building, path: '/dashboard/labs' },
  { label: 'File Distribution', icon: FolderSync, path: '/dashboard/files' },
  { label: 'Exam Mode', icon: FileCheck, path: '/dashboard/exam' },
  { label: 'Attendance', icon: Users, path: '/dashboard/attendance' },
];

export default function TeacherSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Monitor className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-sidebar-foreground">LabDesk</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "nav-item",
                isActive && "active"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center"
        >
          <ChevronLeft className={cn(
            "w-4 h-4 transition-transform",
            collapsed && "rotate-180"
          )} />
        </Button>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "justify-center"
        )}>
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-sm font-medium text-primary">
              {user?.name?.charAt(0) || 'T'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name || 'Teacher'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || 'teacher@lab.io'}
              </p>
            </div>
          )}
        </div>
        
        <div className={cn(
          "flex gap-2 mt-3",
          collapsed ? "flex-col" : "flex-row"
        )}>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            asChild
          >
            <Link to="/dashboard/settings">
              <Settings className="w-4 h-4" />
              {!collapsed && <span className="ml-2">Settings</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
