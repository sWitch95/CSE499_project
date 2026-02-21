import { useState } from 'react';
import { Student } from '@/types/lab';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Lock,
  Unlock,
  MessageSquare,
  Power,
  RefreshCw,
  Monitor,
  Keyboard,
  Mouse,
  Volume2,
  VolumeX,
  Maximize2,
  Copy,
  Camera,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface ScreenViewerModalProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (studentId: string, action: string) => void;
}

export default function ScreenViewerModal({
  student,
  open,
  onOpenChange,
  onAction,
}: ScreenViewerModalProps) {
  const [isRemoteControlActive, setIsRemoteControlActive] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [message, setMessage] = useState('');

  if (!student) return null;

  const statusColors = {
    online: 'bg-success text-success-foreground',
    offline: 'bg-muted text-muted-foreground',
    away: 'bg-warning text-warning-foreground',
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      onAction(student.id, 'message');
      toast({
        title: 'Message Sent',
        description: `Your message was sent to ${student.name}`,
      });
      setMessage('');
    }
  };

  const handleScreenshot = () => {
    toast({
      title: 'Screenshot Captured',
      description: `Screenshot of ${student.workstation} saved.`,
    });
  };

  const handleCopyClipboard = () => {
    toast({
      title: 'Clipboard Synced',
      description: `Clipboard content copied from ${student.name}'s workstation.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader className="px-6 py-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DialogTitle className="text-xl font-semibold">
                {student.name}
              </DialogTitle>
              <Badge variant="outline" className="font-mono">
                {student.workstation}
              </Badge>
              <Badge className={cn('capitalize', statusColors[student.status])}>
                {student.status}
              </Badge>
              {student.isLocked && (
                <Badge variant="destructive">
                  <Lock className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              )}
            </div>
            {student.currentApp && student.status === 'online' && (
              <Badge variant="secondary" className="font-medium">
                {student.currentApp}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Screen Preview */}
          <div className="flex-1 p-4 flex flex-col">
            <div className="relative flex-1 rounded-lg overflow-hidden bg-gradient-to-br from-secondary to-muted border border-border/50">
              {student.status === 'offline' ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Monitor className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">Workstation Offline</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Last seen: {student.lastActive.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Mock live screen */}
                  <div className="absolute inset-4 rounded-lg bg-background/20 animate-pulse">
                    <div className="h-8 bg-muted/40 rounded-t-lg flex items-center px-3 gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive/60" />
                      <div className="w-3 h-3 rounded-full bg-warning/60" />
                      <div className="w-3 h-3 rounded-full bg-success/60" />
                      <div className="flex-1 h-4 bg-muted/30 rounded mx-8" />
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 w-3/4 bg-muted/30 rounded" />
                      <div className="h-4 w-1/2 bg-muted/30 rounded" />
                      <div className="h-4 w-2/3 bg-muted/30 rounded" />
                      <div className="h-32 bg-muted/20 rounded mt-4" />
                      <div className="h-4 w-1/3 bg-muted/30 rounded" />
                      <div className="h-4 w-1/2 bg-muted/30 rounded" />
                    </div>
                  </div>

                  {/* Locked Overlay */}
                  {student.isLocked && (
                    <div className="absolute inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center">
                      <div className="text-center">
                        <Lock className="w-12 h-12 text-destructive mx-auto mb-3" />
                        <p className="text-lg font-medium text-destructive">Screen Locked</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Student cannot see their screen
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Remote Control Active Indicator */}
                  {isRemoteControlActive && !student.isLocked && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-primary/90 rounded-full text-primary-foreground text-sm font-medium animate-pulse">
                      Remote Control Active
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Toolbar */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Button
                  variant={isRemoteControlActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setIsRemoteControlActive(!isRemoteControlActive);
                    toast({
                      title: isRemoteControlActive ? 'Remote Control Disabled' : 'Remote Control Enabled',
                      description: isRemoteControlActive 
                        ? 'You are no longer controlling this workstation.'
                        : 'You can now control keyboard and mouse.',
                    });
                  }}
                  disabled={student.status === 'offline'}
                >
                  <Mouse className="w-4 h-4 mr-2" />
                  Remote Control
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsMuted(!isMuted);
                    toast({
                      title: isMuted ? 'Audio Enabled' : 'Audio Muted',
                    });
                  }}
                  disabled={student.status === 'offline'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleScreenshot}
                  disabled={student.status === 'offline'}
                >
                  <Camera className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyClipboard}
                  disabled={student.status === 'offline'}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast({ title: 'Full screen mode' })}
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Full Screen
              </Button>
            </div>
          </div>

          {/* Right Sidebar - Controls */}
          <div className="w-72 border-l border-border/50 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={student.isLocked ? 'default' : 'outline'}
                  size="sm"
                  className="justify-start"
                  onClick={() => onAction(student.id, student.isLocked ? 'unlock' : 'lock')}
                >
                  {student.isLocked ? (
                    <>
                      <Unlock className="w-4 h-4 mr-2" />
                      Unlock
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Lock
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => {
                    onAction(student.id, 'restart');
                    toast({ title: `Restarting ${student.workstation}...` });
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Restart
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="justify-start col-span-2"
                  onClick={() => onAction(student.id, 'shutdown')}
                >
                  <Power className="w-4 h-4 mr-2" />
                  Shutdown
                </Button>
              </div>
            </div>

            <Separator />

            {/* Remote Input */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Remote Input</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  disabled={student.status === 'offline' || !isRemoteControlActive}
                  onClick={() => toast({ title: 'Keyboard input mode active' })}
                >
                  <Keyboard className="w-4 h-4 mr-2" />
                  Send Keystrokes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  disabled={student.status === 'offline' || !isRemoteControlActive}
                  onClick={() => toast({ title: 'Ctrl+Alt+Del sent' })}
                >
                  Ctrl + Alt + Del
                </Button>
              </div>
            </div>

            <Separator />

            {/* Send Message */}
            <div className="flex-1 flex flex-col">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Send Message
              </h3>
              <Textarea
                placeholder="Type a message to the student..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 min-h-[100px] resize-none"
              />
              <Button
                className="mt-2 w-full"
                onClick={handleSendMessage}
                disabled={!message.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>

            <Separator />

            {/* Student Info */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Email:</strong> {student.email}</p>
              <p><strong>Last Active:</strong> {student.lastActive.toLocaleTimeString()}</p>
              {student.currentApp && (
                <p><strong>Current App:</strong> {student.currentApp}</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
