"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from 'next-auth/react';
import { useToast } from "@/hooks/use-toast";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  isSignUp?: boolean;
}

export function UserAuthForm({ className, isSignUp = false, ...props }: UserAuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [name, setName] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [mobile, setMobile] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Validate form inputs
        if (!name.trim()) {
          setError('Please enter your name');
          setIsLoading(false);
          return;
        }
        if (!email.trim()) {
          setError('Please enter your email');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }

        // Signup - Send form data in body
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            mobile: mobile.trim() || null,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          const errorMsg = data.message || data.error || 'Failed to create account';
          setError(errorMsg);
          setIsLoading(false);
          return;
        }

        toast({
          title: 'Success',
          description: 'Account created! Logging you in...',
        });

        // Automatically log in after signup
        const loginResult = await signIn('credentials', {
          email: email.trim(),
          password,
          redirect: false,
        });

        if (loginResult?.ok) {
          // Clear form
          setEmail('');
          setPassword('');
          setName('');
          setMobile('');
          setIsLoading(false);

          toast({
            title: 'Welcome!',
            description: 'Redirecting to setup...',
          });

          // Redirect to onboard (don't wait, let the redirect handler authenticate)
          router.push('/onboard');
        } else {
          // If auto-login fails, redirect to login page
          setEmail('');
          setPassword('');
          setName('');
          setMobile('');
          setIsLoading(false);

          router.replace('/login');
        }
      } else {
        // Login
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (!result?.ok) {
          const errorMsg = result?.error || 'Invalid email or password';
          
          // Check if it's an OAuth-only account error
          if (errorMsg.includes('OAuth') || errorMsg.includes('Google') || errorMsg.includes('GitHub')) {
            setError(`${errorMsg}. Try using the Google or GitHub login button below.`);
          } else {
            setError(errorMsg);
          }
          
          setIsLoading(false);
          return;
        }

        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });

        // Clear form
        setEmail('');
        setPassword('');
        setName('');
        setMobile('');
        setIsLoading(false);

        // Replace history and redirect to onboard
        setTimeout(() => {
          router.replace('/onboard');
        }, 500);
      }
    } catch (error: any) {
      console.error('[AUTH_ERROR]', error);
      const errorMessage = error?.message || 'An error occurred. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  }

  const loginWithGoogle = async () => {
    setIsLoading(true);

    try {
      await signIn('google')
    } catch(error) {
      toast({
        title: 'There was a problem.',
        description: 'There was an error logging in with Google',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  const loginWithGitHub = async () => {
    setIsLoading(true);

    try {
      await signIn('github')
    } catch(error) {
      toast({
        title: 'There was a problem.',
        description: 'There was an error logging in with GitHub',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          {isSignUp && (
            <div className="grid gap-1">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                type="text"
                autoCapitalize="words"
                disabled={isLoading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              autoCapitalize="none"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isSignUp && (
            <div className="grid gap-1">
              <Label htmlFor="mobile">Mobile Number (Optional)</Label>
              <Input
                id="mobile"
                placeholder="+1 (555) 000-0000"
                type="tel"
                disabled={isLoading}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
          )}

          <Button disabled={isLoading} className="w-full">
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button onClick={loginWithGoogle} variant="outline" type="button" disabled={isLoading}>
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}
          Google
        </Button>
        <Button onClick={loginWithGitHub} variant="outline" type="button" disabled={isLoading}>
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.gitHub className="mr-2 h-4 w-4" />
          )}
          GitHub
        </Button>
      </div>
    </div>
  );
}

