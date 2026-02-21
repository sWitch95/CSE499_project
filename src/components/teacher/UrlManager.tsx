import { useState } from 'react';
import { Plus, Trash2, Globe, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface UrlManagerProps {
  allowedUrls: string[];
  disallowedUrls: string[];
  onAllowedChange: (urls: string[]) => void;
  onDisallowedChange: (urls: string[]) => void;
  disabled?: boolean;
}

export default function UrlManager({
  allowedUrls,
  disallowedUrls,
  onAllowedChange,
  onDisallowedChange,
  disabled = false,
}: UrlManagerProps) {
  const [newAllowedUrl, setNewAllowedUrl] = useState('');
  const [newDisallowedUrl, setNewDisallowedUrl] = useState('');

  const isValidUrl = (url: string): boolean => {
    try {
      // Allow domain patterns like *.google.com or google.com
      if (url.includes('*') || !url.includes('://')) {
        return url.length > 0 && url.length <= 255;
      }
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddAllowed = () => {
    const trimmedUrl = newAllowedUrl.trim().toLowerCase();
    if (!trimmedUrl) return;
    
    if (!isValidUrl(trimmedUrl)) {
      toast({ title: 'Invalid URL', description: 'Please enter a valid URL or domain pattern', variant: 'destructive' });
      return;
    }
    
    if (allowedUrls.includes(trimmedUrl)) {
      toast({ title: 'URL Already Exists', description: 'This URL is already in the allowed list', variant: 'destructive' });
      return;
    }
    
    if (disallowedUrls.includes(trimmedUrl)) {
      toast({ title: 'Conflict', description: 'This URL is in the blocked list. Remove it first.', variant: 'destructive' });
      return;
    }
    
    onAllowedChange([...allowedUrls, trimmedUrl]);
    setNewAllowedUrl('');
    toast({ title: 'URL Added', description: `${trimmedUrl} added to allowed list` });
  };

  const handleAddDisallowed = () => {
    const trimmedUrl = newDisallowedUrl.trim().toLowerCase();
    if (!trimmedUrl) return;
    
    if (!isValidUrl(trimmedUrl)) {
      toast({ title: 'Invalid URL', description: 'Please enter a valid URL or domain pattern', variant: 'destructive' });
      return;
    }
    
    if (disallowedUrls.includes(trimmedUrl)) {
      toast({ title: 'URL Already Exists', description: 'This URL is already in the blocked list', variant: 'destructive' });
      return;
    }
    
    if (allowedUrls.includes(trimmedUrl)) {
      toast({ title: 'Conflict', description: 'This URL is in the allowed list. Remove it first.', variant: 'destructive' });
      return;
    }
    
    onDisallowedChange([...disallowedUrls, trimmedUrl]);
    setNewDisallowedUrl('');
    toast({ title: 'URL Blocked', description: `${trimmedUrl} added to blocked list` });
  };

  const handleRemoveAllowed = (url: string) => {
    onAllowedChange(allowedUrls.filter((u) => u !== url));
    toast({ title: 'URL Removed', description: `${url} removed from allowed list` });
  };

  const handleRemoveDisallowed = (url: string) => {
    onDisallowedChange(disallowedUrls.filter((u) => u !== url));
    toast({ title: 'URL Unblocked', description: `${url} removed from blocked list` });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Allowed URLs */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <Globe className="w-5 h-5" />
            Allowed URLs
          </CardTitle>
          <CardDescription>
            Only these URLs will be accessible during exam (whitelist mode)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., docs.google.com or *.edu"
              value={newAllowedUrl}
              onChange={(e) => setNewAllowedUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddAllowed()}
              disabled={disabled}
              className="flex-1"
            />
            <Button 
              size="icon" 
              onClick={handleAddAllowed} 
              disabled={disabled || !newAllowedUrl.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="min-h-[120px] max-h-[200px] overflow-y-auto space-y-2">
            {allowedUrls.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No URLs added. All websites will be blocked by default.
              </p>
            ) : (
              allowedUrls.map((url) => (
                <div
                  key={url}
                  className="flex items-center justify-between p-2 rounded-lg bg-success/10 border border-success/20"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Globe className="w-4 h-4 text-success shrink-0" />
                    <span className="text-sm truncate">{url}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => handleRemoveAllowed(url)}
                    disabled={disabled}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {allowedUrls.length > 0 && (
            <Badge variant="outline" className="text-success border-success/30">
              {allowedUrls.length} URL{allowedUrls.length !== 1 ? 's' : ''} allowed
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Blocked URLs */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Ban className="w-5 h-5" />
            Blocked URLs
          </CardTitle>
          <CardDescription>
            These URLs will always be blocked, even if in allowed list
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., facebook.com or *.social"
              value={newDisallowedUrl}
              onChange={(e) => setNewDisallowedUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddDisallowed()}
              disabled={disabled}
              className="flex-1"
            />
            <Button 
              size="icon" 
              variant="destructive"
              onClick={handleAddDisallowed} 
              disabled={disabled || !newDisallowedUrl.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="min-h-[120px] max-h-[200px] overflow-y-auto space-y-2">
            {disallowedUrls.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No URLs blocked. Add social media or cheating sites.
              </p>
            ) : (
              disallowedUrls.map((url) => (
                <div
                  key={url}
                  className="flex items-center justify-between p-2 rounded-lg bg-destructive/10 border border-destructive/20"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Ban className="w-4 h-4 text-destructive shrink-0" />
                    <span className="text-sm truncate">{url}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => handleRemoveDisallowed(url)}
                    disabled={disabled}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {disallowedUrls.length > 0 && (
            <Badge variant="outline" className="text-destructive border-destructive/30">
              {disallowedUrls.length} URL{disallowedUrls.length !== 1 ? 's' : ''} blocked
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
