import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Lock, 
  Unlock, 
  MessageSquare, 
  Power, 
  RotateCcw,
  X,
  CheckSquare,
  Square,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiSelectToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onAction: (action: string, data?: string) => void;
  isSelecting: boolean;
  onToggleSelecting: () => void;
}

export default function MultiSelectToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onAction,
  isSelecting,
  onToggleSelecting,
}: MultiSelectToolbarProps) {
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      onAction('message', message);
      setMessage('');
      setShowMessageDialog(false);
    }
  };

  return (
    <>
      <div className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300",
        isSelecting || selectedCount > 0 
          ? "translate-y-0 opacity-100" 
          : "translate-y-20 opacity-0 pointer-events-none"
      )}>
        <div className="flex items-center gap-2 p-2 rounded-xl bg-card/95 backdrop-blur-xl border border-border shadow-xl">
          {/* Selection Toggle */}
          <Button
            variant={isSelecting ? "default" : "outline"}
            size="sm"
            onClick={onToggleSelecting}
            className="gap-2"
          >
            {isSelecting ? (
              <>
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Exit Selection</span>
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Select Multiple</span>
              </>
            )}
          </Button>

          {isSelecting && (
            <>
              <div className="h-6 w-px bg-border" />
              
              {/* Selection Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSelectAll}
                  disabled={selectedCount === totalCount}
                >
                  <Square className="w-4 h-4 mr-1" />
                  All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDeselectAll}
                  disabled={selectedCount === 0}
                >
                  <X className="w-4 h-4 mr-1" />
                  None
                </Button>
              </div>

              <div className="h-6 w-px bg-border" />

              {/* Selected Count */}
              <div className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-medium text-sm">
                {selectedCount} selected
              </div>

              <div className="h-6 w-px bg-border" />

              {/* Bulk Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onAction('lock')}
                  disabled={selectedCount === 0}
                  title="Lock selected"
                >
                  <Lock className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onAction('unlock')}
                  disabled={selectedCount === 0}
                  title="Unlock selected"
                >
                  <Unlock className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMessageDialog(true)}
                  disabled={selectedCount === 0}
                  title="Message selected"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onAction('restart')}
                  disabled={selectedCount === 0}
                  title="Restart selected"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onAction('shutdown')}
                  disabled={selectedCount === 0}
                  className="text-destructive hover:text-destructive"
                  title="Shutdown selected"
                >
                  <Power className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to {selectedCount} Students</DialogTitle>
            <DialogDescription>
              This message will be sent to all selected students instantly.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={!message.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
