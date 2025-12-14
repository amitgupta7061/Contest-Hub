'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Loader2, 
  Trash2, 
  Calendar,
  Clock,
  ExternalLink,
  Mail,
  MessageCircle,
  BellOff
} from 'lucide-react';
import { getPlatformInfo } from '@/lib/constants';

interface Notification {
  id: string;
  contestId: string;
  contestName: string;
  contestPlatform: string;
  contestUrl: string;
  contestStartTime: string;
  notifyViaEmail: boolean;
  notifyViaWhatsapp: boolean;
  email?: string;
  whatsappNumber?: string;
}

interface MyNotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MyNotificationsModal({ open, onOpenChange }: MyNotificationsModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { data: session } = useSession();
  const { toast } = useToast();

  const fetchNotifications = async () => {
    if (!session) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      
      if (response.ok) {
        setNotifications(data.notifications || []);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to fetch notifications',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && session) {
      fetchNotifications();
    }
  }, [open, session]);

  const handleDelete = async (notificationId: string) => {
    setDeletingId(notificationId);
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        toast({
          title: 'Notification cancelled',
          description: 'You will no longer receive notifications for this contest',
        });
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data.message || 'Failed to cancel notification',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel notification',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeUntil = (dateString: string) => {
    const now = new Date().getTime();
    const startTime = new Date(dateString).getTime();
    const difference = startTime - now;

    if (difference <= 0) return 'Starting soon';

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden max-h-[85vh]">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Bell className="h-5 w-5" />
              My Notifications
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Manage your contest notification subscriptions
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <BellOff className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">No notifications</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You haven&apos;t set up any contest notifications yet
                </p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {notifications.map((notification, index) => {
                  const platform = getPlatformInfo(notification.contestPlatform as any);
                  
                  return (
                    <div key={notification.id}>
                      <div 
                        className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        style={{ borderLeftWidth: '4px', borderLeftColor: platform.color }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{platform.icon}</span>
                              <Badge variant="secondary" className="text-xs">
                                {platform.name}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-sm line-clamp-2 mb-2">
                              {notification.contestName}
                            </h4>
                            
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(notification.contestStartTime)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-orange-500" />
                                <span className="text-orange-600 dark:text-orange-400 font-medium">
                                  {getTimeUntil(notification.contestStartTime)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {notification.notifyViaEmail && (
                                <Badge variant="outline" className="text-xs gap-1">
                                  <Mail className="h-3 w-3" />
                                  Email
                                </Badge>
                              )}
                              {notification.notifyViaWhatsapp && (
                                <Badge variant="outline" className="text-xs gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  WhatsApp
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.open(notification.contestUrl, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(notification.id)}
                              disabled={deletingId === notification.id}
                            >
                              {deletingId === notification.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                      {index < notifications.length - 1 && <Separator className="my-3" />}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
