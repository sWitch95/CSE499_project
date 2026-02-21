import { useState } from 'react';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Bell, 
  Send, 
  CheckCheck, 
  Trash2, 
  MessageSquare,
  AlertTriangle,
  Info,
  CheckCircle,
  Megaphone,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface NotificationPanelProps {
  onBroadcast?: (title: string, message: string) => void;
}

const notificationIcons: Record<Notification['type'], typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  error: X,
  success: CheckCircle,
  broadcast: Megaphone,
};

const notificationColors: Record<Notification['type'], string> = {
  info: 'text-primary bg-primary/10',
  warning: 'text-warning bg-warning/10',
  error: 'text-destructive bg-destructive/10',
  success: 'text-success bg-success/10',
  broadcast: 'text-accent bg-accent/10',
};

export default function NotificationPanel({ onBroadcast }: NotificationPanelProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification,
    clearAll,
    addNotification
  } = useNotifications();
  
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSendBroadcast = () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in both title and message.',
        variant: 'destructive'
      });
      return;
    }

    // Add to notification history
    addNotification({
      title: `📢 ${broadcastTitle}`,
      message: broadcastMessage,
      type: 'broadcast',
      from: 'You (Teacher)'
    });

    onBroadcast?.(broadcastTitle, broadcastMessage);
    
    toast({
      title: 'Broadcast sent!',
      description: `Message sent to all students in the lab.`
    });

    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-xs flex items-center justify-center text-destructive-foreground font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </SheetTitle>
          <SheetDescription>
            View notification history and send broadcasts to students
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="history" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              History
              {unreadCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="broadcast" className="flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Broadcast
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <CheckCheck className="w-4 h-4 mr-1" />
                  Mark all read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  disabled={notifications.length === 0}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear all
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="space-y-3 pr-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const Icon = notificationIcons[notification.type];
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 rounded-lg border transition-colors cursor-pointer",
                          notification.read 
                            ? "bg-card border-border" 
                            : "bg-primary/5 border-primary/20"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                            notificationColors[notification.type]
                          )}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-sm truncate">
                                {notification.title}
                              </h4>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearNotification(notification.id);
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              {notification.from && (
                                <>
                                  <span>{notification.from}</span>
                                  <span>•</span>
                                </>
                              )}
                              <span>
                                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                              </span>
                              {!notification.read && (
                                <span className="w-2 h-2 rounded-full bg-primary" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="broadcast" className="mt-4 space-y-4">
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <div className="flex items-center gap-2 text-accent mb-2">
                <Megaphone className="w-4 h-4" />
                <span className="font-medium text-sm">Broadcast Message</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Send a message to all students currently connected to the lab. 
                They will receive an instant notification.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  placeholder="e.g., Exam Starting Soon"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <Textarea
                  placeholder="Enter your message to all students..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSendBroadcast} 
                className="w-full btn-glow"
                disabled={!broadcastTitle.trim() || !broadcastMessage.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Send to All Students
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
