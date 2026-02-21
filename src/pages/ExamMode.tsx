import { useState } from 'react';
import { Shield, Clock, Globe, Lock, AlertTriangle, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import TeacherSidebar from '@/components/teacher/TeacherSidebar';
import TeacherTopBar from '@/components/teacher/TeacherTopBar';
import UrlManager from '@/components/teacher/UrlManager';
import { toast } from '@/hooks/use-toast';

export default function ExamMode() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [examActive, setExamActive] = useState(false);
  const [settings, setSettings] = useState({
    blockInternet: true,
    blockUsb: true,
    blockClipboard: true,
    lockScreenOnInactivity: true,
    recordScreen: false,
  });
  
  const [allowedUrls, setAllowedUrls] = useState<string[]>([
    'docs.google.com',
    'classroom.google.com',
    '*.edu',
  ]);
  
  const [disallowedUrls, setDisallowedUrls] = useState<string[]>([
    'facebook.com',
    'twitter.com',
    'instagram.com',
    'tiktok.com',
    'reddit.com',
    'discord.com',
    'chatgpt.com',
  ]);

  const handleToggleExam = () => {
    setExamActive(!examActive);
    toast({
      title: examActive ? 'Exam Mode Deactivated' : 'Exam Mode Activated',
      description: examActive 
        ? 'Students can now use their workstations normally'
        : 'All restrictions are now in effect',
    });
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
            <h1 className="text-2xl font-bold mb-1">Exam Mode</h1>
            <p className="text-muted-foreground">Secure testing environment controls</p>
          </div>

          {/* Status Card */}
          <Card className={`glass-card mb-6 ${examActive ? 'border-destructive/50' : ''}`}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    examActive ? 'bg-destructive/10' : 'bg-secondary'
                  }`}>
                    {examActive ? (
                      <Shield className="w-7 h-7 text-destructive animate-pulse" />
                    ) : (
                      <Shield className="w-7 h-7 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {examActive ? 'Exam Mode Active' : 'Exam Mode Inactive'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {examActive 
                        ? '20 students are in secure exam environment'
                        : 'Click to activate exam restrictions'
                      }
                    </p>
                  </div>
                </div>
                <Button
                  variant={examActive ? 'danger' : 'glow'}
                  size="lg"
                  onClick={handleToggleExam}
                >
                  {examActive ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      End Exam
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Exam
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Restrictions
                </CardTitle>
                <CardDescription>Configure exam security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="block-internet" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Block Internet Access
                  </Label>
                  <Switch
                    id="block-internet"
                    checked={settings.blockInternet}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, blockInternet: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="block-usb" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Block USB Devices
                  </Label>
                  <Switch
                    id="block-usb"
                    checked={settings.blockUsb}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, blockUsb: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="block-clipboard" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Block Clipboard
                  </Label>
                  <Switch
                    id="block-clipboard"
                    checked={settings.blockClipboard}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, blockClipboard: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Monitoring
                </CardTitle>
                <CardDescription>Activity monitoring options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lock-inactive" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Lock on Inactivity
                  </Label>
                  <Switch
                    id="lock-inactive"
                    checked={settings.lockScreenOnInactivity}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, lockScreenOnInactivity: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="record-screen" className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Record Screen Activity
                  </Label>
                  <Switch
                    id="record-screen"
                    checked={settings.recordScreen}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, recordScreen: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* URL Management */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Website Access Control
            </h2>
            <UrlManager
              allowedUrls={allowedUrls}
              disallowedUrls={disallowedUrls}
              onAllowedChange={setAllowedUrls}
              onDisallowedChange={setDisallowedUrls}
              disabled={examActive}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
