'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Loader2, Mail, Lock, User, ArrowLeft, CheckCircle2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultView?: 'login' | 'register';
  onSuccess?: () => void;
}

type AuthView = 'login' | 'register' | 'verify';

export function AuthModal({ open, onOpenChange, defaultView = 'login', onSuccess }: AuthModalProps) {
  const [view, setView] = useState<AuthView>(defaultView);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const resetForms = () => {
    loginForm.reset();
    registerForm.reset();
    setOtp('');
    setPendingEmail('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForms();
      setView(defaultView);
    }
    onOpenChange(newOpen);
  };

  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const signInData = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (signInData?.error) {
        if (signInData.error.includes('verify your email')) {
          toast({
            title: 'Email not verified',
            description: 'Please verify your email before logging in',
            variant: 'destructive',
          });
          setPendingEmail(values.email);
          setView('verify');
        } else {
          toast({
            title: 'Error',
            description: 'Invalid email or password',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in',
        });
        router.refresh();
        handleOpenChange(false);
        onSuccess?.();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message || 'Verification code sent to your email',
        });
        setPendingEmail(values.email);
        setView('verify');
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Email verified successfully! Please login.',
        });
        setOtp('');
        setView('login');
        loginForm.setValue('email', pendingEmail);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Verification failed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const response = await fetch('/api/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Verification code sent to your email',
        });
        setCountdown(60);
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to resend code',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 pb-4">
          <DialogHeader>
            {view === 'verify' && (
              <Button
                variant="ghost"
                size="sm"
                className="w-fit -ml-2 mb-2"
                onClick={() => setView('login')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Button>
            )}
            <DialogTitle className="text-2xl font-bold">
              {view === 'login' && 'Welcome back'}
              {view === 'register' && 'Create an account'}
              {view === 'verify' && 'Verify your email'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {view === 'login' && 'Enter your credentials to sign in'}
              {view === 'register' && 'Enter your details to get started'}
              {view === 'verify' && (
                <>
                  We&apos;ve sent a code to <span className="font-medium text-foreground">{pendingEmail}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-4">
          {view === 'login' && (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="mail@example.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </Form>
          )}

          {view === 'register' && (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="John Doe"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="mail@example.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </Form>
          )}

          {view === 'verify' && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                className="w-full"
                onClick={handleVerify}
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Email
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Didn&apos;t receive the code? </span>
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={handleResend}
                  disabled={isResending || countdown > 0}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
                </Button>
              </div>
            </div>
          )}

          {view !== 'verify' && (
            <div className="mt-6 text-center text-sm">
              {view === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold"
                    onClick={() => setView('register')}
                  >
                    Sign up
                  </Button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold"
                    onClick={() => setView('login')}
                  >
                    Sign in
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
