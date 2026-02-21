import { useState } from 'react';
import { User, Bell, Monitor, Shield, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TeacherSidebar from '@/components/teacher/TeacherSidebar';
import TeacherTopBar from '@/components/teacher/TeacherTopBar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const { user } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  const [profile, setProfile] = useState({
    name: user?.name || 'Teacher',
    email: user?.email || 'teacher@lab.io',
    department: 'Computer Science',
    labRoom: 'Lab 101',
  });

  const [notifications, setNotifications] = useState({
    studentOffline: true,
    restrictedApp: true,
    examAlerts: true,
    fileTransferComplete: false,
    dailySummary: true,
    soundEnabled: true,
  });

  const [labSettings, setLabSettings] = useState({
    autoLockOnIdle: true,
    idleTimeout: '5',
    screenRefreshRate: '3',
    defaultView: 'grid',
    showOfflineStudents: true,
    autoReconnect: true,
  });

  const handleSaveProfile = () => {
    toast({ title: 'Profile Updated', description: 'Your profile settings have been saved.' });
  };

  const handleSaveNotifications = () => {
    toast({ title: 'Notifications Updated', description: 'Your notification preferences have been saved.' });
  };

  const handleSaveLabSettings = () => {
    toast({ title: 'Lab Settings Updated', description: 'Your lab configuration has been saved.' });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="hidden lg:block">
        <TeacherSidebar />
      </div>

      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 lg:hidden transform transition-transform duration-300 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <TeacherSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <TeacherTopBar
          onSearch={() => {}}
          onGlobalAction={() => {}}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          isMobileSidebarOpen={mobileSidebarOpen}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">Settings</h1>
            <p className="text-muted-foreground">Manage your account and lab preferences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="lab" className="gap-2">
                <Monitor className="w-4 h-4" />
                Lab Config
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>Update your personal details and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {profile.name.charAt(0)}
                      </span>
                    </div>
                    <Button variant="outline">Change Avatar</Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={profile.department}
                        onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="labRoom">Default Lab Room</Label>
                      <Input
                        id="labRoom"
                        value={profile.labRoom}
                        onChange={(e) => setProfile({ ...profile, labRoom: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveProfile} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Profile
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Choose what alerts you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Student Goes Offline</Label>
                        <p className="text-sm text-muted-foreground">Alert when a student unexpectedly disconnects</p>
                      </div>
                      <Switch
                        checked={notifications.studentOffline}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, studentOffline: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Restricted Application Access</Label>
                        <p className="text-sm text-muted-foreground">Alert when students open blocked apps</p>
                      </div>
                      <Switch
                        checked={notifications.restrictedApp}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, restrictedApp: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Exam Mode Alerts</Label>
                        <p className="text-sm text-muted-foreground">Critical alerts during exam sessions</p>
                      </div>
                      <Switch
                        checked={notifications.examAlerts}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, examAlerts: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>File Transfer Complete</Label>
                        <p className="text-sm text-muted-foreground">Notify when file distribution finishes</p>
                      </div>
                      <Switch
                        checked={notifications.fileTransferComplete}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, fileTransferComplete: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Daily Summary</Label>
                        <p className="text-sm text-muted-foreground">Receive a daily lab activity summary</p>
                      </div>
                      <Switch
                        checked={notifications.dailySummary}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, dailySummary: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sound Notifications</Label>
                        <p className="text-sm text-muted-foreground">Play sound for important alerts</p>
                      </div>
                      <Switch
                        checked={notifications.soundEnabled}
                        onCheckedChange={(checked) => 
                          setNotifications({ ...notifications, soundEnabled: checked })
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveNotifications} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Notifications
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Lab Config Tab */}
            <TabsContent value="lab">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Lab Configuration
                  </CardTitle>
                  <CardDescription>Configure default lab monitoring behavior</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-Lock on Idle</Label>
                          <p className="text-sm text-muted-foreground">Lock student screens when idle</p>
                        </div>
                        <Switch
                          checked={labSettings.autoLockOnIdle}
                          onCheckedChange={(checked) => 
                            setLabSettings({ ...labSettings, autoLockOnIdle: checked })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Idle Timeout (minutes)</Label>
                        <Select
                          value={labSettings.idleTimeout}
                          onValueChange={(value) => 
                            setLabSettings({ ...labSettings, idleTimeout: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 minute</SelectItem>
                            <SelectItem value="3">3 minutes</SelectItem>
                            <SelectItem value="5">5 minutes</SelectItem>
                            <SelectItem value="10">10 minutes</SelectItem>
                            <SelectItem value="15">15 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Screen Refresh Rate (seconds)</Label>
                        <Select
                          value={labSettings.screenRefreshRate}
                          onValueChange={(value) => 
                            setLabSettings({ ...labSettings, screenRefreshRate: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 second</SelectItem>
                            <SelectItem value="2">2 seconds</SelectItem>
                            <SelectItem value="3">3 seconds</SelectItem>
                            <SelectItem value="5">5 seconds</SelectItem>
                            <SelectItem value="10">10 seconds</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Default Dashboard View</Label>
                        <Select
                          value={labSettings.defaultView}
                          onValueChange={(value) => 
                            setLabSettings({ ...labSettings, defaultView: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="grid">Grid View</SelectItem>
                            <SelectItem value="list">List View</SelectItem>
                            <SelectItem value="compact">Compact View</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Show Offline Students</Label>
                          <p className="text-sm text-muted-foreground">Display offline workstations in grid</p>
                        </div>
                        <Switch
                          checked={labSettings.showOfflineStudents}
                          onCheckedChange={(checked) => 
                            setLabSettings({ ...labSettings, showOfflineStudents: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Auto-Reconnect</Label>
                          <p className="text-sm text-muted-foreground">Automatically reconnect to students</p>
                        </div>
                        <Switch
                          checked={labSettings.autoReconnect}
                          onCheckedChange={(checked) => 
                            setLabSettings({ ...labSettings, autoReconnect: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSaveLabSettings} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Lab Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
