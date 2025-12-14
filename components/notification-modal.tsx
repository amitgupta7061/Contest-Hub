'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { Contest } from '@/types/contest';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Mail, 
  MessageCircle, 
  Loader2, 
  CheckCircle2, 
  Calendar,
  Clock,
  Trophy
} from 'lucide-react';
import { getPlatformInfo } from '@/lib/constants';

const notificationSchema = z.object({
  notifyViaEmail: z.boolean().default(false),
  notifyViaWhatsapp: z.boolean().default(false),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  whatsappNumber: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid WhatsApp number')
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => data.notifyViaEmail || data.notifyViaWhatsapp,
  { message: 'Please select at least one notification method', path: ['notifyViaEmail'] }
).refine(
  (data) => !data.notifyViaEmail || (data.email && data.email.length > 0),
  { message: 'Email is required when email notification is selected', path: ['email'] }
).refine(
  (data) => !data.notifyViaWhatsapp || (data.whatsappNumber && data.whatsappNumber.length > 0),
  { message: 'WhatsApp number is required when WhatsApp notification is selected', path: ['whatsappNumber'] }
);

type NotificationFormValues = z.infer<typeof notificationSchema>;

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contest: Contest;
}

export function NotificationModal({ open, onOpenChange, contest }: NotificationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { data: session } = useSession();
  const { toast } = useToast();
  const platform = getPlatformInfo(contest.platform);

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      notifyViaEmail: false,
      notifyViaWhatsapp: false,
      email: session?.user?.email || '',
      whatsappNumber: '',
    },
  });

  const watchEmail = form.watch('notifyViaEmail');
  const watchWhatsapp = form.watch('notifyViaWhatsapp');

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setIsSuccess(false);
    }
    onOpenChange(newOpen);
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const onSubmit = async (values: NotificationFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contestId: contest.id,
          contestName: contest.name,
          contestPlatform: contest.platform,
          contestUrl: contest.url,
          contestStartTime: contest.startTime,
          contestEndTime: contest.endTime,
          notifyViaEmail: values.notifyViaEmail,
          notifyViaWhatsapp: values.notifyViaWhatsapp,
          email: values.email,
          whatsappNumber: values.whatsappNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: 'Notification Set!',
          description: `You'll be notified before "${contest.name}" starts.`,
        });

        // Close modal after showing success
        setTimeout(() => {
          handleOpenChange(false);
        }, 2000);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to set notification. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to set notification. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        {/* Header with contest info */}
        <div 
          className="p-6 pb-4"
          style={{ 
            background: `linear-gradient(135deg, ${platform.color}15 0%, ${platform.color}05 100%)`,
            borderBottom: `3px solid ${platform.color}`
          }}
        >
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{platform.icon}</span>
              <Badge variant="secondary" className="text-xs">
                {platform.name}
              </Badge>
            </div>
            <DialogTitle className="text-xl font-bold leading-tight">
              {contest.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Set up notifications so you never miss this contest
            </DialogDescription>
          </DialogHeader>

          {/* Contest Details */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(contest.startTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(contest.duration)}</span>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="p-6 pt-4">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">You&apos;re all set!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We&apos;ll notify you before the contest starts
                </p>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Notification Method Selection */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Choose how you want to be notified
                  </h3>

                  {/* Email Option */}
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="notifyViaEmail"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none flex-1">
                            <FormLabel className="flex items-center gap-2 cursor-pointer">
                              <Mail className="h-4 w-4 text-blue-500" />
                              Email Notification
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Receive a reminder email 30 minutes before the contest
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    {watchEmail && (
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="ml-7">
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="your@email.com"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {/* WhatsApp Option */}
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="notifyViaWhatsapp"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none flex-1">
                            <FormLabel className="flex items-center gap-2 cursor-pointer">
                              <MessageCircle className="h-4 w-4 text-green-500" />
                              WhatsApp Notification
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Get a WhatsApp message 30 minutes before the contest
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />

                    {watchWhatsapp && (
                      <FormField
                        control={form.control}
                        name="whatsappNumber"
                        render={({ field }) => (
                          <FormItem className="ml-7">
                            <FormControl>
                              <div className="relative">
                                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="+91 9876543210"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  {form.formState.errors.notifyViaEmail?.message && !watchEmail && !watchWhatsapp && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.notifyViaEmail.message}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Submit Button */}
                <Button 
                  className="w-full" 
                  type="submit" 
                  disabled={isLoading || (!watchEmail && !watchWhatsapp)}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up notification...
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Notify Me
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
