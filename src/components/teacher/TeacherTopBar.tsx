import { useState } from 'react';
import { Search, Power, Lock, Bell, ChevronDown, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TeacherTopBarProps {
  onSearch: (query: string) => void;
  onGlobalAction: (action: string) => void;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export default function TeacherTopBar({ 
  onSearch, 
  onGlobalAction,
  onToggleMobileSidebar,
  isMobileSidebarOpen
}: TeacherTopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <header className="h-16 bg-card/50 backdrop-blur-xl border-b border-border px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onToggleMobileSidebar}
      >
        {isMobileSidebarOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </Button>

      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search students by name or workstation..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10 bg-input border-border w-full"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        {/* Global Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="hidden sm:flex">
              Global Actions
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onGlobalAction('lock-all')}>
              <Lock className="w-4 h-4 mr-2" />
              Lock All Screens
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onGlobalAction('unlock-all')}>
              <Lock className="w-4 h-4 mr-2" />
              Unlock All Screens
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onGlobalAction('shutdown-all')}
              className="text-destructive focus:text-destructive"
            >
              <Power className="w-4 h-4 mr-2" />
              Shutdown All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onGlobalAction('restart-all')}>
              <Power className="w-4 h-4 mr-2" />
              Restart All
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
