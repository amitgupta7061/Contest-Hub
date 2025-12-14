'use client';

import { Contest } from '@/types/contest';
import { getPlatformInfo } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ExternalLink, Timer, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { NotificationModal } from '@/components/notification-modal';

interface ContestCardProps {
  contest: Contest;
}

export function ContestCard({ contest }: ContestCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const platform = getPlatformInfo(contest.platform);
  const { data: session } = useSession();
  const { openAuthModal, setOnSuccessCallback } = useAuthModal();

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const startTime = new Date(contest.startTime).getTime();
      const difference = startTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${minutes}m ${seconds}s`);
        }
      } else {
        setTimeLeft('Started');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [contest.startTime]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (durationValue: number) => {
    // If duration is very large (> 10000), it's likely in seconds, convert to minutes
    let minutes = durationValue;
    if (durationValue > 10000) {
      minutes = Math.floor(durationValue / 60);
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleNotifyClick = () => {
    if (session) {
      setShowNotificationModal(true);
    } else {
      // Set callback to open notification modal after login
      setOnSuccessCallback(() => () => setShowNotificationModal(true));
      openAuthModal('login');
    }
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 hover:scale-[1.02] h-full flex flex-col" 
            style={{ borderLeftColor: platform.color }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{platform.icon}</span>
              <Badge variant="secondary" className="text-xs">
                {platform.name}
              </Badge>
            </div>
            <Badge variant="outline" className="text-xs">
              {contest.type}
            </Badge>
          </div>
          <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
            {contest.name}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex flex-col flex-1">
          <div className="space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(contest.startTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(contest.duration)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Timer className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-orange-600 dark:text-orange-400">
                {timeLeft}
              </span>
            </div>
          </div>
        
          <div className="flex gap-2 pt-4 mt-auto">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs"
              onClick={() => window.open(contest.url, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Contest
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1 text-xs"
              onClick={handleNotifyClick}
            >
              <Bell className="h-3 w-3 mr-1" />
              Notify Me
            </Button>
          </div>
        </CardContent>
      </Card>
    
      <NotificationModal 
        open={showNotificationModal}
        onOpenChange={setShowNotificationModal}
        contest={contest}
      />
    </>
  );
}