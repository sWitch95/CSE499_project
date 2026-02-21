import { Student } from '@/types/lab';
import { Lock, Unlock, Monitor, MoreVertical, MessageSquare, Eye, Power, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface StudentScreenCardProps {
  student: Student;
  onAction: (studentId: string, action: string) => void;
}

export default function StudentScreenCard({ student, onAction }: StudentScreenCardProps) {
  const statusColors = {
    online: 'status-online',
    offline: 'status-offline',
    away: 'bg-warning',
  };

  return (
    <div className={cn(
      "screen-preview group animate-fade-in",
      student.isLocked && "ring-2 ring-destructive/50"
    )}>
      {/* Screen Preview Area */}
      <div className="aspect-video bg-gradient-to-br from-secondary to-muted relative overflow-hidden">
        {student.status === 'offline' ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Monitor className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <span className="text-xs text-muted-foreground">Offline</span>
            </div>
          </div>
        ) : (
          <>
            {/* Mock screen content */}
            <div className="absolute inset-2 rounded bg-background/10 animate-screen-flicker">
              <div className="h-3 bg-muted/30 rounded-t flex items-center px-2 gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive/60" />
                <div className="w-1.5 h-1.5 rounded-full bg-warning/60" />
                <div className="w-1.5 h-1.5 rounded-full bg-success/60" />
              </div>
              <div className="p-2 space-y-1">
                <div className="h-1 w-3/4 bg-muted/20 rounded" />
                <div className="h-1 w-1/2 bg-muted/20 rounded" />
                <div className="h-1 w-2/3 bg-muted/20 rounded" />
              </div>
            </div>
            
            {/* Locked Overlay */}
            {student.isLocked && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <Lock className="w-6 h-6 text-destructive mx-auto mb-1" />
                  <span className="text-xs text-destructive font-medium">Locked</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onAction(student.id, 'view')}
            title="View Full Screen"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onAction(student.id, 'remote-control')}
            title="Remote Control"
            className="bg-primary/80 hover:bg-primary"
          >
            <Smartphone className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onAction(student.id, student.isLocked ? 'unlock' : 'lock')}
            title={student.isLocked ? 'Unlock' : 'Lock'}
          >
            {student.isLocked ? (
              <Unlock className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onAction(student.id, 'message')}
            title="Send Message"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Student Info */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("status-dot shrink-0", statusColors[student.status])} />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{student.name}</p>
            <p className="text-xs text-muted-foreground">{student.workstation}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAction(student.id, 'view')}>
              <Eye className="w-4 h-4 mr-2" />
              View Screen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction(student.id, 'remote-control')}>
              <Smartphone className="w-4 h-4 mr-2" />
              Remote Control
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction(student.id, 'message')}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Send Message
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction(student.id, student.isLocked ? 'unlock' : 'lock')}>
              {student.isLocked ? (
                <>
                  <Unlock className="w-4 h-4 mr-2" />
                  Unlock Screen
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Lock Screen
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onAction(student.id, 'shutdown')}
              className="text-destructive focus:text-destructive"
            >
              <Power className="w-4 h-4 mr-2" />
              Shutdown
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Current App Badge */}
      {student.currentApp && student.status === 'online' && (
        <div className="px-3 pb-3 -mt-1">
          <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {student.currentApp}
          </span>
        </div>
      )}
    </div>
  );
}
