import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Monitor, 
  LogOut, 
  Wifi, 
  HardDrive, 
  Cpu, 
  Clock,
  FileText,
  Download,
  MessageSquare,
  Bell,
  Megaphone,
  AlertTriangle,
  Info,
  CheckCircle,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const sharedFiles = [
  { id: '1', name: 'Assignment_Week1.pdf', size: '2.4 MB', date: '2 hours ago' },
  { id: '2', name: 'Project_Template.zip', size: '15.8 MB', date: 'Yesterday' },
];

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const notificationIcons = {
    info: Info,
    warning: AlertTriangle,
    error: X,
    success: CheckCircle,
    broadcast: Megaphone,
  };

  const notificationColors = {
    info: 'text-primary bg-primary/10',
    warning: 'text-warning bg-warning/10',
    error: 'text-destructive bg-destructive/10',
    success: 'text-success bg-success/10',
    broadcast: 'text-accent bg-accent/10',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 bg-card/50 backdrop-blur-xl border-b border-border px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold">LabDesk</h1>
            <p className="text-xs text-muted-foreground">Student Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Sheet */}
          <Sheet>
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
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </SheetTitle>
                <SheetDescription>
                  Messages from your instructor
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mb-4"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
                <ScrollArea className="h-[calc(100vh-200px)]">
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
                                <h4 className="font-medium text-sm">
                                  {notification.title}
                                </h4>
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
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {user?.name?.charAt(0) || 'S'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name || 'Student'}</p>
              <p className="text-xs text-muted-foreground">Workstation WS-05</p>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 lg:p-6 max-w-6xl mx-auto">
        {/* Broadcast Alert */}
        {notifications.filter(n => n.type === 'broadcast' && !n.read).length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                <Megaphone className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-accent">Broadcast Message</h3>
                {notifications
                  .filter(n => n.type === 'broadcast' && !n.read)
                  .slice(0, 1)
                  .map(n => (
                    <div key={n.id}>
                      <p className="text-sm mt-1">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(n.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  ))
                }
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  notifications
                    .filter(n => n.type === 'broadcast' && !n.read)
                    .forEach(n => markAsRead(n.id));
                }}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-1">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
          </h2>
          <p className="text-muted-foreground">
            Here's your workstation status and available resources.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Connection
              </CardTitle>
              <Wifi className="w-4 h-4 text-success" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-success">Connected</p>
              <p className="text-xs text-muted-foreground">Latency: 12ms</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Workstation
              </CardTitle>
              <Monitor className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">WS-05</p>
              <p className="text-xs text-muted-foreground">Lab Room A</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                CPU Usage
              </CardTitle>
              <Cpu className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">24%</p>
              <div className="w-full h-1.5 bg-secondary rounded-full mt-1">
                <div className="h-full w-1/4 bg-primary rounded-full" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Storage
              </CardTitle>
              <HardDrive className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">45 GB</p>
              <p className="text-xs text-muted-foreground">of 100 GB used</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Shared Files */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Shared Files
              </CardTitle>
              <CardDescription>Files shared by your instructor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sharedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Recent Messages
              </CardTitle>
              <CardDescription>Latest messages from your instructor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notif) => {
                  const Icon = notificationIcons[notif.type];
                  return (
                    <div
                      key={notif.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        notificationColors[notif.type]
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session Info */}
        <Card className="glass-card mt-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Current Session</h3>
                  <p className="text-sm text-muted-foreground">
                    CS101 - Introduction to Programming
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-success/20 text-success border-success/30">
                  Active
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Started 45 min ago
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
