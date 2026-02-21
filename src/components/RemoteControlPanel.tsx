import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRemoteControl } from '@/hooks/useRemoteControl';
import {
  Maximize2,
  Minimize2,
  Smartphone,
  Mouse,
  Keyboard,
  RefreshCw,
  X,
} from 'lucide-react';

interface RemoteControlPanelProps {
  teacherId: string;
  studentId: string;
  studentName?: string;
  onClose?: () => void;
}

interface MousePosition {
  x: number;
  y: number;
}

export function RemoteControlPanel({
  teacherId,
  studentId,
  studentName,
  onClose,
}: RemoteControlPanelProps) {
  const {
    isConnected,
    activeSession,
    error,
    startSession,
    endSession,
    sendCommand,
    lastScreenshot,
  } = useRemoteControl(teacherId);

  const screenRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mouseMode, setMouseMode] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [screenshotInterval, setScreenshotInterval] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  // Start control session
  useEffect(() => {
    if (isConnected && !activeSession) {
      startSession(teacherId, studentId).catch((err) => {
        console.error('Failed to start session:', err);
      });
    }
  }, [isConnected, teacherId, studentId, activeSession, startSession]);

  // Screenshot polling
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      sendCommand('screenshot', {
        max_width: 1280,
        max_height: 720,
      }).catch((err) => {
        console.error('Screenshot error:', err);
      });
    }, 500); // Update every 500ms (2 FPS)

    setScreenshotInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession, sendCommand]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!mouseMode || !activeSession || !screenRef.current) return;

      const rect = screenRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Scale coordinates if image is resized
      const scaleX = (lastScreenshot?.width || 1280) / rect.width;
      const scaleY = (lastScreenshot?.height || 720) / rect.height;

      sendCommand('mouse_move', {
        x: Math.round(x * scaleX),
        y: Math.round(y * scaleY),
        duration: 0.05,
      }).catch(console.error);
    },
    [mouseMode, activeSession, sendCommand, lastScreenshot]
  );

  const handleMouseClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>, button: 'left' | 'right' | 'middle' = 'left') => {
      if (!mouseMode || !activeSession || !screenRef.current) return;

      const rect = screenRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const scaleX = (lastScreenshot?.width || 1280) / rect.width;
      const scaleY = (lastScreenshot?.height || 720) / rect.height;

      try {
        await sendCommand('mouse_click', {
          x: Math.round(x * scaleX),
          y: Math.round(y * scaleY),
          button,
          clicks: 1,
        });
      } catch (err) {
        console.error('Click error:', err);
      }
    },
    [mouseMode, activeSession, sendCommand, lastScreenshot]
  );

  const handleScroll = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (!mouseMode || !activeSession) return;

      e.preventDefault();
      const amount = e.deltaY > 0 ? -3 : 3;

      sendCommand('mouse_scroll', {
        amount,
      }).catch(console.error);
    },
    [mouseMode, activeSession, sendCommand]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!keyboardMode || !activeSession) return;

      sendCommand('key_press', {
        key: e.key.toLowerCase(),
      }).catch(console.error);
    },
    [keyboardMode, activeSession, sendCommand]
  );

  const handleTypeText = useCallback(
    async (text: string) => {
      if (!activeSession) return;

      try {
        await sendCommand('type_text', {
          text,
          interval: 0.05,
        });
      } catch (err) {
        console.error('Type error:', err);
      }
    },
    [activeSession, sendCommand]
  );

  const handleEndSession = async () => {
    setIsLoading(true);
    try {
      await endSession();
      if (screenshotInterval) clearInterval(screenshotInterval);
      onClose?.();
    } catch (err) {
      console.error('Error ending session:', err);
    } finally {
      setIsLoading(false);
      setConfirmEnd(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && screenRef.current) {
      screenRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  return (
    <>
      <Card className="w-full bg-black border-gray-700">
        <CardHeader className="bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <CardTitle className="text-white">
                Remote Control: {studentName || studentId}
              </CardTitle>
              {isConnected && (
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                  Connected
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmEnd(true)}
              className="text-red-400 hover:text-red-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-900 text-red-200 rounded text-sm">
              {error}
            </div>
          )}

          {!activeSession && !isLoading && (
            <div className="text-center py-8 text-gray-400">
              Connecting to student...
            </div>
          )}

          {activeSession && (
            <>
              {/* Screen Display */}
              <div className="mb-4 bg-gray-800 rounded overflow-hidden">
                <div
                  ref={screenRef}
                  className="w-full cursor-move relative"
                  onMouseMove={handleMouseMove}
                  onClick={(e) => handleMouseClick(e, 'left')}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleMouseClick(e, 'right');
                  }}
                  onWheel={handleScroll}
                  onKeyDown={handleKeyPress}
                  tabIndex={0}
                >
                  {lastScreenshot ? (
                    <img
                      src={`data:image/jpeg;base64,${lastScreenshot}`}
                      alt="Student Screen"
                      className="w-full h-auto block"
                      style={{ maxHeight: isFullscreen ? '100vh' : '500px' }}
                    />
                  ) : (
                    <div className="w-full h-80 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Waiting for screen capture...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Control Toolbar */}
              <div className="space-y-4">
                {/* Mode Selection */}
                <div className="flex gap-2">
                  <Button
                    variant={mouseMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMouseMode(!mouseMode)}
                    className={mouseMode ? 'bg-blue-600' : ''}
                  >
                    <Mouse className="h-4 w-4 mr-2" />
                    Mouse {mouseMode ? '✓' : ''}
                  </Button>

                  <Button
                    variant={keyboardMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setKeyboardMode(!keyboardMode)}
                    className={keyboardMode ? 'bg-blue-600' : ''}
                  >
                    <Keyboard className="h-4 w-4 mr-2" />
                    Keyboard {keyboardMode ? '✓' : ''}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 className="h-4 w-4 mr-2" />
                        Exit Fullscreen
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-4 w-4 mr-2" />
                        Fullscreen
                      </>
                    )}
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTypeText('test')}
                  >
                    Type Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      sendCommand('key_press', { key: 'F5' }).catch(console.error)
                    }
                  >
                    Refresh (F5)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      sendCommand('key_press', { key: 'alt+tab' }).catch(
                        console.error
                      )
                    }
                  >
                    Alt+Tab
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      sendCommand('key_press', { key: 'esc' }).catch(console.error)
                    }
                  >
                    Escape
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  {mouseMode && 'Mouse mode active - Move and click on screen'}
                  {keyboardMode && 'Keyboard mode active - Type to send keys'}
                  {!mouseMode && !keyboardMode && 'Select a mode to start'}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirm End Dialog */}
      <AlertDialog open={confirmEnd} onOpenChange={setConfirmEnd}>
        <AlertDialogContent>
          <AlertDialogTitle>End Remote Control Session?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to end the remote control session with{' '}
            {studentName || studentId}?
          </AlertDialogDescription>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEndSession}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Ending...' : 'End Session'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default RemoteControlPanel;
